import { logger } from './logger.js'
import { Worker as MermaidxWorker } from './worker-mermaidx.js'
import { Worker as PuppeteerWorker } from './worker.js'

// Selects the mermaid renderer. `KROKI_MERMAID_RENDERER=puppeteer` (default,
// legacy headless-Chromium) or `mermaidx` (opt-in browserless renderer via
// `uvx mermaidx`). Fail closed: an unrecognized or missing value selects the
// default.
export function resolveRenderer(value = process.env.KROKI_MERMAID_RENDERER) {
  const normalized = (value ?? '').toString().trim().toLowerCase()
  if (normalized === 'mermaidx') {
    return 'mermaidx'
  }
  return 'puppeteer'
}

export function createWorker(renderer = resolveRenderer()) {
  if (renderer === 'mermaidx') {
    logger.info('Using mermaidx renderer for mermaid')
    return new MermaidxWorker()
  }
  logger.info('Using puppeteer (headless Chromium) renderer for mermaid')
  return new PuppeteerWorker()
}
