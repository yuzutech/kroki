import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
// eslint-disable-next-line
import puppeteer, { Page, HTTPResponse } from 'puppeteer'
import { logger } from './logger.js'
import { updateConfig } from './config.js'
import { failureSpan, startSpan, successfulSpan } from './apm.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export class TimeoutError extends Error {
  constructor (timeoutDurationMs, action = 'convert') {
    super(`Timeout error: ${action} took more than ${timeoutDurationMs}ms`)
  }
}

export class SyntaxError extends Error {
  constructor (err) {
    super(`Syntax error in graph: ${err.message}`)
    this.name = err.name
    this.stack = err.stack
  }
}

export class Worker {
  constructor (browserInstance) {
    this.browserWSEndpoint = browserInstance.wsEndpoint()
    this.pageUrl = process.env.KROKI_MERMAID_PAGE_URL || `file://${path.join(__dirname, '..', 'assets', 'index.html')}`
    this.convertTimeout = process.env.KROKI_MERMAID_CONVERT_TIMEOUT || '10000'
  }

  async convert (task, config) {
    const browser = await this._connect()
    const page = await newPage(browser)
    try {
      const mermaidConfig = task.mermaidConfig
      if (config !== null && config !== undefined && typeof config[Symbol.iterator] === 'function') {
        updateConfig(mermaidConfig, config)
      }
      await page.setViewport({ height: 800, width: 600 })
      await this._goto(page)
      const evalResult = await this._eval(page, task, mermaidConfig)
      if (evalResult && evalResult.error) {
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
    }
  }

  /**
   * @param {Page} page
   * @param {Task} task
   * @param {{[key: string]: string|{}}} mermaidConfig
   * @returns {Promise<{svg: string|null, error: Error|null}>}
   * @private
   */
  async _eval (page, task, mermaidConfig) {
    const span = startSpan(
      'Evaluate Mermaid definition',
      'puppeteer',
      {
        mermaidConfig: JSON.stringify(mermaidConfig)
      }
    )
    try {
      const evalResult = await Promise.race([
        page.evaluate(async (definition, mermaidConfig) => {
          window.mermaid.initialize(mermaidConfig)
          try {
            let { svg } = await window.mermaid.render('container', definition)
            // workaround: https://github.com/yuzutech/kroki/issues/1632
            // upstream issue: https://github.com/mermaid-js/mermaid/issues/1766
            // taken from: https://github.com/mermaid-js/mermaid-live-editor/blob/83382901cd7e15414b6f18b48b7dd9c4775f3a21/src/lib/components/Actions.svelte#L23-L26
            svg = svg
              .replaceAll('<br>', '<br/>')
              .replaceAll(/<img([^>]*)>/g, (m, g) => `<img ${g} />`)
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
        }, task.source, mermaidConfig),
        new Promise((resolve, reject) => setTimeout(() => reject(new TimeoutError(this.convertTimeout)), this.convertTimeout))
      ])
      successfulSpan(span)
      return evalResult
    } catch (err) {
      if (span) {
        // add source to troubleshoot
        span.setLabel('source', task.source)
      }
      failureSpan(span, err)
      throw err
    }
  }

  /**
   * @param {Page} page
   * @returns {Promise<HTTPResponse|null>}
   * @private
   */
  async _goto (page) {
    const span = startSpan(
      'Navigate to URL',
      'puppeteer',
      {
        pageClosed: page.isClosed()
      }
    )
    try {
      const response = await page.goto(this.pageUrl)
      successfulSpan(span)
      return response
    } catch (err) {
      failureSpan(span, err)
      throw err
    }
  }

  /**
   * @returns {Promise<Browser>}
   * @private
   */
  async _connect () {
    const span = startSpan(
      'Attach Puppeteer to an existing browser instance',
      'puppeteer',
      {
        browserWSEndpoint: this.browserWSEndpoint
      }
    )
    try {
      const browser = await puppeteer.connect({
        browserWSEndpoint: this.browserWSEndpoint,
        ignoreHTTPSErrors: true
      })
      successfulSpan(span)
      return browser
    } catch (err) {
      failureSpan(span, err)
      throw err
    }
  }
}

/**
 * @param {Browser} browser
 * @returns {Promise<Page>}
 */
async function newPage (browser) {
  const span = startSpan(
    'Create a new Page in the browser',
    'puppeteer',
    {
      browserConnected: browser.isConnected()
    }
  )
  try {
    const page = await browser.newPage()
    successfulSpan(span)
    return page
  } catch (err) {
    failureSpan(span, err)
    throw err
  }
}

/**
 *
 * @param {Page} page
 * @param {string} svg
 * @returns {Promise<string|Buffer>}
 */
async function toPNG (page, svg) {
  const span = startSpan(
    'Convert SVG to PNG using screenshot',
    'puppeteer'
  )
  try {
    await page.setContent(svg)
    const container = await page.$('#container')
    const result = await container.screenshot({
      type: 'png',
      omitBackground: true
    })
    successfulSpan(span)
    return result
  } catch (err) {
    failureSpan(span, err)
    throw err
  }
}
