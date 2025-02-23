import { fileURLToPath, URL } from 'node:url'
import path from 'node:path'
// eslint-disable-next-line
import puppeteer, { HTTPResponse, Page } from 'puppeteer'
import { logger } from './logger.js'
import { updateConfig } from './config.js'
import { getBrowserWSEndpoint } from './browser-instance.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export class TimeoutError extends Error {
  constructor (timeoutDurationMs, action = 'convert') {
    super(`Timeout error: ${action} took more than ${timeoutDurationMs}ms`)
  }
}

export class SyntaxError extends Error {
  constructor (err) {
    super('Syntax error in graph', { cause: err })
    logger.error(this)
    this.name = 'SyntaxError'
    this.message = err.message
  }
}

export class Worker {
  constructor () {
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
    return await Promise.race([
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
  }

  /**
   * @param {Page} page
   * @returns {Promise<HTTPResponse|null>}
   * @private
   */
  async _goto (page) {
    return await page.goto(this.pageUrl)
  }

  /**
   * @returns {Promise<Browser>}
   * @private
   */
  async _connect () {
    const browserWSEndpoint = await getBrowserWSEndpoint()
    return await puppeteer.connect({
      browserWSEndpoint,
      ignoreHTTPSErrors: true
    })
  }
}

/**
 * @param {Browser} browser
 * @returns {Promise<Page>}
 */
async function newPage (browser) {
  return await browser.newPage()
}

/**
 *
 * @param {Page} page
 * @param {string} svg
 * @returns {Promise<Buffer>}
 */
async function toPNG (page, svg) {
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
  return Buffer.from(await container.screenshot({
    type: 'png',
    omitBackground: true
  }))
}
