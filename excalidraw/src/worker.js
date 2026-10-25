import puppeteer from 'puppeteer'
import { createSemaphore, QueueFullError } from '@kroki/browser-instance'
import { logger } from './logger.js'
import { getBrowserWSEndpoint, protocolTimeout } from './browser-instance.js'

export class TimeoutError extends Error {
  constructor(timeoutDurationMs, action = 'convert') {
    super(`Timeout error: ${action} took more than ${timeoutDurationMs}ms`)
    this.name = 'TimeoutError'
  }
}

// Re-exported for index.js, which maps it to a 503.
export { QueueFullError }

// Recycle a page after this many conversions to bound memory growth in a
// long-lived renderer (fonts, detached nodes, JIT caches...).
const PAGE_MAX_USES = Number(process.env.KROKI_EXCALIDRAW_PAGE_MAX_USES) || 100

/**
 * Converts Excalidraw scenes using a pool of warm pages.
 *
 * Loading the Excalidraw bundle (~8MB with React) is by far the most expensive
 * part of a conversion: doing it on a fresh page for every request saturated
 * the CPU and the memory of the container under load, causing CDP timeouts
 * ("Runtime.callFunctionOn timed out") and renderer crashes ("Target crashed").
 * Pages are therefore initialized once and reused; a page is discarded (and
 * lazily re-created) whenever it crashes, times out or reaches PAGE_MAX_USES.
 */
export default class Worker {
  constructor() {
    this.pageUrl =
      process.env.KROKI_EXCALIDRAW_PAGE_URL || 'http://127.0.0.1:8004/public/index.html'
    this.assetPath = process.env.KROKI_EXCALIDRAW_ASSET_PATH || '/public'
    this.convertTimeout = Number(process.env.KROKI_EXCALIDRAW_CONVERT_TIMEOUT) || 15000
    // Caps concurrent conversions, and therefore the number of pages kept in the
    // pool: KROKI_EXCALIDRAW_MAX_CONCURRENCY (4), KROKI_EXCALIDRAW_MAX_QUEUE_SIZE
    // (100) and KROKI_EXCALIDRAW_QUEUE_TIMEOUT (30s), see Semaphore in
    // @kroki/browser-instance.
    this.semaphore = createSemaphore({ envPrefix: 'KROKI_EXCALIDRAW', maxConcurrency: 4 })
    this.idlePages = []
    this.browserPromise = undefined
  }

  async convert(task) {
    await this.semaphore.acquire()
    let pooledPage
    let reusable = false
    try {
      pooledPage = await this._acquirePage()
      const result = await this._eval(pooledPage.page, task)
      // The page made it through the render: an error raised by Excalidraw
      // itself (e.g. an invalid scene) leaves it in a reusable state.
      reusable = true
      if (result.error) {
        const err = new Error(result.error.message)
        err.name = result.error.name || 'Error'
        err.stack = result.error.stack
        throw err
      }
      return result.svg
    } finally {
      if (pooledPage) {
        await this._releasePage(pooledPage, reusable)
      }
      this.semaphore.release()
    }
  }

  async _eval(page, task) {
    let timer
    try {
      return await Promise.race([
        page.evaluate(async definition => {
          try {
            const svgElement = await window.ExcalidrawLib.exportToSvg(JSON.parse(definition))
            return { svg: svgElement.outerHTML, error: null }
          } catch (err) {
            return {
              svg: null,
              error: { name: err?.name, message: err?.message ?? String(err), stack: err?.stack }
            }
          }
        }, task.source),
        new Promise((_resolve, reject) => {
          timer = setTimeout(
            () => reject(new TimeoutError(this.convertTimeout)),
            this.convertTimeout
          )
        })
      ])
    } finally {
      clearTimeout(timer)
    }
  }

  async _acquirePage() {
    while (this.idlePages.length > 0) {
      const pooledPage = this.idlePages.pop()
      if (isHealthy(pooledPage)) {
        return pooledPage
      }
      await closePage(pooledPage)
    }
    return await this._createPage()
  }

  async _releasePage(pooledPage, reusable) {
    pooledPage.uses++
    if (reusable && pooledPage.uses < PAGE_MAX_USES && isHealthy(pooledPage)) {
      this.idlePages.push(pooledPage)
    } else {
      await closePage(pooledPage)
    }
  }

  async _createPage() {
    const browser = await this._getBrowser()
    const page = await browser.newPage()
    const pooledPage = { page, uses: 0, crashed: false }
    page.once('error', err => {
      logger.warn({ err }, 'Excalidraw page crashed')
      pooledPage.crashed = true
    })
    try {
      await page.setViewport({ height: 800, width: 600 })
      await page.goto(this.pageUrl)
      if (this.assetPath) {
        await page.addScriptTag({
          content: `window.EXCALIDRAW_ASSET_PATH="${this.assetPath}"`
        })
      }
      // index.bundle.js is using the EXCALIDRAW_ASSET_PATH variable.
      await page.addScriptTag({
        url: 'http://127.0.0.1:8004/public/index.bundle.js'
      })
      return pooledPage
    } catch (err) {
      await closePage(pooledPage)
      throw err
    }
  }

  // A single connection is kept open for the lifetime of the Chrome instance
  // (pooled pages are tied to it). When Chrome exits, browser-instance.js
  // launches a new one on demand: drop the stale connection and its pages.
  async _getBrowser() {
    if (this.browserPromise === undefined) {
      const browserPromise = (async () => {
        const browser = await puppeteer.connect({
          browserWSEndpoint: await getBrowserWSEndpoint(),
          ignoreHTTPSErrors: true,
          // Bound CDP calls so a wedged Chrome fails fast instead of stalling 180s.
          protocolTimeout
        })
        browser.once('disconnected', () => {
          logger.warn('Disconnected from Chrome, discarding the Excalidraw page pool')
          if (this.browserPromise === browserPromise) {
            this.browserPromise = undefined
          }
          this.idlePages = this.idlePages.filter(isHealthy)
        })
        return browser
      })()
      this.browserPromise = browserPromise
      // If the connection fails, let the next request retry.
      browserPromise.catch(() => {
        if (this.browserPromise === browserPromise) {
          this.browserPromise = undefined
        }
      })
    }
    return await this.browserPromise
  }
}

function isHealthy({ page, crashed }) {
  return !crashed && !page.isClosed() && page.browser().connected
}

async function closePage({ page }) {
  if (page.isClosed() || !page.browser().connected) {
    return
  }
  try {
    await page.close()
  } catch (err) {
    logger.warn({ err }, 'Unable to close the page')
  }
}
