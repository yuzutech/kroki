const path = require('path')
const puppeteer = require('puppeteer')
const PUPPETEER_DEFAULT_TIMEOUT = process.env['PUPPETEER_DEFAULT_TIMEOUT'] || '5000' // default 5seconds
const defaultTimeout = parseInt(PUPPETEER_DEFAULT_TIMEOUT, 10)

class Worker {
  constructor (browserInstance) {
    this.browserWSEndpoint = browserInstance.wsEndpoint()
    this.pageUrl = process.env.KROKI_EXCALIDRAW_PAGE_URL || `file://${path.join(__dirname, '..', 'assets', 'index.html')}`
  }

  async convert (task) {
    const browser = await puppeteer.connect({
      browserWSEndpoint: this.browserWSEndpoint,
      ignoreHTTPSErrors: true
    })
    const page = await browser.newPage()
    page.setDefaultTimeout(defaultTimeout)
    try {
      page.setViewport({ height: 800, width: 600 })
      await page.goto(this.pageUrl)
      // QUESTION: should we reuse the page for performance reason ?
      return await page.evaluate(async (definition) => {
        const svgElement = await window.ExcalidrawUtils.exportToSvg(JSON.parse(definition))
        return svgElement.outerHTML
      }, task.source)
    } catch (e) {
      console.error('Unable to convert the diagram', e)
      throw e
    } finally {
      try {
        await page.close()
      } catch (e) {
        console.warn('Unable to close the page', e)
      }
      try {
        await browser.disconnect()
      } catch (e) {
        console.warn('Unable to disconnect from the browser', e)
      }
    }
  }
}

module.exports = Worker
