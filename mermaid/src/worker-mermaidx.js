import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { updateConfig } from './config.js'
// Shared with worker.js so index.js `instanceof` checks hold regardless of
// the selected renderer (see renderer.js).
export { MaxTextSizeError, SyntaxError, TimeoutError } from './errors.js'
import { MaxTextSizeError, SyntaxError, TimeoutError } from './errors.js'

// Bounds concurrent mermaidx spawns. Mirrors the Chromium worker's
// KROKI_MERMAID_MAX_CONCURRENCY contract (default 6) so operators keep the
// same knob; each render is a short-lived `uvx mermaidx` process instead of
// a Chromium page.
class Semaphore {
  constructor(max) {
    this.max = max
    this.count = 0
    this.queue = []
  }

  async acquire() {
    if (this.count < this.max) {
      this.count++
      return
    }
    return new Promise(resolve => this.queue.push(resolve))
  }

  release() {
    const next = this.queue.shift()
    if (next) {
      next()
    } else {
      this.count--
    }
  }
}

const MAX_CONCURRENCY = Number(process.env.KROKI_MERMAID_MAX_CONCURRENCY) || 6
// `uvx --from mermaidx mermaidx` by default (zero-install, cache pre-warmed at
// image build). Set KROKI_MERMAID_USE_UVX=0 with KROKI_MERMAID_MERMAIDX_BIN to
// call a pre-installed `mermaidx` binary directly (no uvx cold start).
const USE_UVX = process.env.KROKI_MERMAID_USE_UVX !== '0'
const MERMAIDX_BIN = process.env.KROKI_MERMAID_MERMAIDX_BIN || 'mermaidx'
// Pinned so image builds and renders are reproducible; bump together with the
// MERMAIDX_SPEC pre-warm in the Dockerfile.
const MERMAIDX_SPEC = process.env.KROKI_MERMAID_MERMAIDX_SPEC || 'mermaidx==0.9.5'

export class Worker {
  constructor() {
    this.convertTimeout = Number(process.env.KROKI_MERMAID_CONVERT_TIMEOUT) || 10000
    this.semaphore = new Semaphore(MAX_CONCURRENCY)
  }

  async convert(task, config) {
    const mermaidConfig = task.mermaidConfig
    const maxTextSize = mermaidConfig.maxTextSize
    if (maxTextSize && task.source.length > maxTextSize) {
      throw new MaxTextSizeError(task.source.length, maxTextSize)
    }
    if (config !== null && config !== undefined && typeof config[Symbol.iterator] === 'function') {
      updateConfig(mermaidConfig, config)
    }
    await this.semaphore.acquire()
    try {
      return await render(task.source, mermaidConfig, task.isPng, this.convertTimeout)
    } catch (err) {
      if (err instanceof TimeoutError || err instanceof MaxTextSizeError) {
        throw err
      }
      throw new SyntaxError(err)
    } finally {
      this.semaphore.release()
    }
  }
}

function baseArgs(mermaidConfig) {
  const args = []
  if (mermaidConfig?.theme) {
    args.push('--theme', String(mermaidConfig.theme))
  }
  return args
}

async function runMermaidx({ source, extraArgs, timeoutMs, outputFile }) {
  const { cmd, prefix } = USE_UVX
    ? { cmd: 'uvx', prefix: ['--from', MERMAIDX_SPEC, 'mermaidx'] }
    : { cmd: MERMAIDX_BIN, prefix: [] }
  const args = [...prefix, '-i', '-', ...extraArgs]
  if (outputFile) {
    args.push('-o', outputFile)
  }
  return await new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { timeout: timeoutMs })
    let stdout = Buffer.alloc(0)
    let stderr = ''
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new TimeoutError(timeoutMs))
    }, timeoutMs)
    child.stdout?.on('data', chunk => {
      stdout = Buffer.concat([stdout, chunk])
    })
    child.stderr?.on('data', chunk => {
      stderr += chunk.toString()
    })
    child.on('error', err => {
      clearTimeout(timer)
      reject(err)
    })
    child.on('close', code => {
      clearTimeout(timer)
      if (code === 0) {
        resolve({ stdout, stderr })
      } else {
        // `uvx` can emit environment-specific wrapper noise (e.g. a busybox
        // `realpath` complaint in minimal images) that must not leak into the
        // API error body; mermaid errors never start with `realpath:`.
        const message = stderr
          .split('\n')
          .filter(line => !line.startsWith('realpath:'))
          .join('\n')
          .trim()
        reject(new Error(message || `mermaidx exited with code ${code}`))
      }
    })
    child.stdin?.on('error', () => {})
    child.stdin?.write(source)
    child.stdin?.end()
  })
}

async function render(source, mermaidConfig, isPng, timeoutMs) {
  const cfg = await writeConfigFile(mermaidConfig)
  try {
    const extraArgs = [...baseArgs(mermaidConfig), ...cfg.args]
    if (!isPng) {
      const { stdout } = await runMermaidx({ source, extraArgs, timeoutMs })
      const svg = stdout.toString('utf8')
      if (!svg.trim()) {
        throw new Error('mermaidx produced empty SVG output')
      }
      // Same workaround as the Chromium worker (yuzutech/kroki#1632):
      // mermaid can emit non-XML `<br>` / `<img>` tags.
      return svg.replaceAll('<br>', '<br/>').replaceAll(/<img([^>]*)>/g, (_m, g) => `<img ${g} />`)
    }
    const dir = await mkdtemp(join(tmpdir(), 'kroki-mermaid-'))
    try {
      const out = join(dir, 'diagram.png')
      await runMermaidx({ source, extraArgs, timeoutMs, outputFile: out })
      return await readFile(out)
    } finally {
      await rm(dir, { recursive: true, force: true })
    }
  } finally {
    await cfg.cleanup()
  }
}

// mermaidx accepts a JSON mermaid config file (--config) for the
// quickjs/v8 backends. Write the effective kroki mermaidConfig (minus the
// kroki-only maxTextSize cap) to a temp file so query params like
// ?theme=dark&flowchart_curve=linear keep working.
async function writeConfigFile(mermaidConfig) {
  const { maxTextSize: _ignored, ...rest } = mermaidConfig ?? {}
  if (Object.keys(rest).length === 0) {
    return { args: [], cleanup: async () => {} }
  }
  const dir = await mkdtemp(join(tmpdir(), 'kroki-mermaid-cfg-'))
  const file = join(dir, 'config.json')
  await writeFile(file, JSON.stringify(rest), 'utf8')
  return {
    args: ['--config', file],
    cleanup: async () => rm(dir, { recursive: true, force: true })
  }
}
