const path = require('path')
const puppeteer = require('puppeteer')
const chrome = require('./chrome')

module.exports = {
  convert: async (input) => {
    const mermaidConfig = { theme: 'default' }
    const browserWSEndpoint = chrome.browserWSEndpoint()
    const browser = await puppeteer.connect({
      browserWSEndpoint: browserWSEndpoint,
      ignoreHTTPSErrors: true
    })
    const page = await browser.newPage()
    try {
      page.setViewport({ height: 800, width: 600 })
      await page.goto(`file://${path.join(__dirname, 'index.html')}`)
      await page.$eval('#container', (container, definition, mermaidConfig) => {
        container.innerHTML = definition
        window.mermaid.initialize(mermaidConfig)
        window.mermaid.init(undefined, container)
      }, input, mermaidConfig)
      return await page.$eval('#container', container => container.innerHTML)
    } catch (e) {
      console.error('Unable to convert diagram', e)
      throw e
    } finally {
      await page.close()
      await browser.disconnect()
    }
  }
}
