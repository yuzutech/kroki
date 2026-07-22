import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
// eslint-disable-next-line
import puppeteer, { HTTPResponse, Page } from 'puppeteer'
import { logger } from './logger.js'
import { updateConfig } from './config.js'
import { applyNetworkPolicy, getBrowserWSEndpoint, protocolTimeout } from './browser-instance.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export class TimeoutError extends Error {
  constructor(timeoutDurationMs, action = 'convert') {
    super(`Timeout error: ${action} took more than ${timeoutDurationMs}ms`)
  }
}

export class SyntaxError extends Error {
  constructor(err) {
    super('Syntax error in graph', { cause: err })
    logger.error(this)
    this.name = 'SyntaxError'
    this.message = err.message
  }
}

export class MaxTextSizeError extends Error {
  constructor(actualSize, maxTextSize) {
    super(`Diagram source is too large: ${actualSize} characters (maximum is ${maxTextSize})`)
    this.name = 'MaxTextSizeError'
  }
}

// Caps how many pages (and therefore Chromium renderer processes) may be open
// at once. A single shared Chrome instance (see browser-instance.js) has no
// built-in limit on concurrent pages: a burst of requests can spin up enough
// renderer processes to exceed the container's memory/pids limits and crash
// the browser launch itself (posix_spawn: Resource temporarily unavailable).
// Requests beyond the cap simply wait their turn instead.
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

export class Worker {
  constructor() {
    this.pageUrl =
      process.env.KROKI_MERMAID_PAGE_URL ||
      `file://${path.join(__dirname, '..', 'assets', 'index.html')}`
    this.convertTimeout = process.env.KROKI_MERMAID_CONVERT_TIMEOUT || '10000'
    this.semaphore = new Semaphore(MAX_CONCURRENCY)
  }

  async convert(task, config) {
    const mermaidConfig = task.mermaidConfig
    // Reject oversized sources up front: mermaid would otherwise resolve with an
    // error *image* (HTTP 200) rather than failing. Done before spinning up a
    // page so a flood of huge payloads can't tie up the browser.
    const maxTextSize = mermaidConfig.maxTextSize
    if (maxTextSize && task.source.length > maxTextSize) {
      throw new MaxTextSizeError(task.source.length, maxTextSize)
    }
    await this.semaphore.acquire()
    const browser = await this._connect()
    const page = await newPage(browser)
    try {
      // Must run before the first navigation: mermaid.render() itself can
      // trigger a resource load (e.g. a flowchart image-shape node), not just
      // the later PNG screenshot step.
      await applyNetworkPolicy(page, { pageUrl: this.pageUrl, safeMode: task.safeMode })
      if (
        config !== null &&
        config !== undefined &&
        typeof config[Symbol.iterator] === 'function'
      ) {
        updateConfig(mermaidConfig, config)
      }
      await page.setViewport({ height: 800, width: 600 })
      await this._goto(page)
      const evalResult = await this._eval(page, task, mermaidConfig)
      if (evalResult?.error) {
        throw new SyntaxError(evalResult.error)
      }
      if (task.isPng) {
        return await toPNG(page, evalResult.svg)
      }
      return evalResult.svg
    } finally {
      try {
        await page.close()
      } catch (err) {
        logger.warn({ err }, 'Unable to close the page')
      }
      try {
        await browser.disconnect()
      } catch (err) {
        logger.warn({ err }, 'Unable to disconnect from the browser')
      }
      this.semaphore.release()
    }
  }

  /**
   * @param {Page} page
   * @param {Task} task
   * @param {{[key: string]: string|{}}} mermaidConfig
   * @returns {Promise<{svg: string|null, error: Error|null}>}
   * @private
   */
  async _eval(page, task, mermaidConfig) {
    return await Promise.race([
      page.evaluate(
        async (definition, mermaidConfig) => {
          window.mermaid.initialize(mermaidConfig)
          try {
            let { svg } = await window.mermaid.render('container', definition)
            // workaround: https://github.com/yuzutech/kroki/issues/1632
            // upstream issue: https://github.com/mermaid-js/mermaid/issues/1766
            // taken from: https://github.com/mermaid-js/mermaid-live-editor/blob/83382901cd7e15414b6f18b48b7dd9c4775f3a21/src/lib/components/Actions.svelte#L23-L26
            svg = svg
              .replaceAll('<br>', '<br/>')
              .replaceAll(/<img([^>]*)>/g, (_m, g) => `<img ${g} />`)
            return { svg, error: null }
          } catch (err) {
            return {
              svg: null,
              error: {
                name: 'name' in err && err.name,
                message: 'message' in err && err.message,
                stack: 'stack' in err && err.stack
              }
            }
          }
        },
        task.source,
        mermaidConfig
      ),
      new Promise((_resolve, reject) =>
        setTimeout(() => reject(new TimeoutError(this.convertTimeout)), this.convertTimeout)
      )
    ])
  }

  /**
   * @param {Page} page
   * @returns {Promise<HTTPResponse|null>}
   * @private
   */
  async _goto(page) {
    return await page.goto(this.pageUrl)
  }

  /**
   * @returns {Promise<Browser>}
   * @private
   */
  async _connect() {
    const browserWSEndpoint = await getBrowserWSEndpoint()
    return await puppeteer.connect({
      browserWSEndpoint,
      ignoreHTTPSErrors: true,
      // Bound CDP calls made outside the convert race (see browser-instance.js).
      protocolTimeout
    })
  }
}

/**
 * @param {Browser} browser
 * @returns {Promise<Page>}
 */
async function newPage(browser) {
  return await browser.newPage()
}

/**
 *
 * @param {Page} page
 * @param {string} svg
 * @returns {Promise<Buffer>}
 */
async function toPNG(page, svg) {
  await page.setContent(`<!DOCTYPE html>  
<html>
<head>  
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />  
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />  
</head>  
<body> 
${svg}
</body>
</html>`)
  const container = await page.$('#container')
  return Buffer.from(
    await container.screenshot({
      type: 'png',
      omitBackground: true
    })
  )
}
