/* global XMLSerializer */
import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'
// eslint-disable-next-line
import puppeteer, { Page } from 'puppeteer'
import { logger } from './logger.js'
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
    this.pageUrl = process.env.KROKI_DIAGRAMSNET_PAGE_URL || `file://${path.join(__dirname, '..', 'assets', 'index.html')}`
    this.convertTimeout = process.env.KROKI_DIAGRAMSNET_CONVERT_TIMEOUT || '15000'
  }

  /**
   * @param task
   * @returns {Promise<string|Buffer>}
   */
  async convert (task) {
    const browser = await this._connect()
    const page = await newPage(browser)
    try {
      await page.setViewport({ height: 800, width: 600 })
      await this._goto(page)
      const evalResult = await this._eval(page, task)
      if (task.isPng) {
        return await toPNG(page, evalResult)
      }
      return evalResult
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
   * @returns {Promise<string>}
   * @private
   */
  async _eval (page, task) {
    return await Promise.race([
      page.evaluate(async (source, unsafe) => {
        const resolveImage = async function (svg) {
          for (const img of await svg.querySelectorAll('image')) {
            if (img.attributes['xlink:href'].value.startsWith('data:')) {
              continue
            }
            const imgBase64 = await fetch(img.attributes['xlink:href'].value).then(async (value) => {
              const mimeType = value.headers.get('content-type')
              const b64img = btoa(String.fromCharCode(...new Uint8Array(await value.arrayBuffer())))
              return `data:${mimeType};base64,${b64img}`
            })
            img.setAttribute('xlink:href', imgBase64)
            img.removeAttribute('pointer-events')
          }
          return svg
        }
        const s = new XMLSerializer()
        let svgRoot = render({ // eslint-disable-line no-undef
          xml: source,
          format: 'svg'
        }).getSvg()
        svgRoot = unsafe ? await resolveImage(svgRoot) : svgRoot
        return s.serializeToString(svgRoot)
      }, task.source, task.isUnsafe).catch((err) => {
        throw new SyntaxError(err)
      }),
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
  const container = await page.$('svg')
  return Buffer.from(await container.screenshot({
    type: 'png',
    omitBackground: true
  }))
}

/**
 * @param {Browser} browser
 * @returns {Promise<Page>}
 */
async function newPage (browser) {
  return await browser.newPage()
}
