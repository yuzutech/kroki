import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'
import { logger } from './logger.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export default class Worker {
  constructor (browserInstance) {
    this.browserWSEndpoint = browserInstance.wsEndpoint()
    this.pageUrl = process.env.KROKI_EXCALIDRAW_PAGE_URL || `file://${path.join(__dirname, '..', 'assets', 'index.html')}`
    this.assetPath = process.env.KROKI_EXCALIDRAW_ASSET_PATH || ''
  }

  async convert (task) {
    const browser = await puppeteer.connect({
      browserWSEndpoint: this.browserWSEndpoint,
      ignoreHTTPSErrors: true
    })
    const page = await browser.newPage()
    try {
      await page.setViewport({ height: 800, width: 600 })
      await page.goto(this.pageUrl)
      await page.addScriptTag({
        content: `window.EXCALIDRAW_ASSET_PATH="${this.assetPath}"`
      })
      // excalidraw.production.min.js is using the EXCALIDRAW_ASSET_PATH variable.
      await page.addScriptTag({
        path: `${path.join(__dirname, '..', 'assets', 'excalidraw', 'excalidraw.production.min.js')}`
      })
      // QUESTION: should we reuse the page for performance reason ?
      return await page.evaluate(async (definition) => {
        const svgElement = await window.ExcalidrawLib.exportToSvg(JSON.parse(definition))
        return svgElement.outerHTML
      }, task.source)
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
}
