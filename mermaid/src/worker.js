const path = require('path')
const puppeteer = require('puppeteer')

class Worker {
  constructor (browserInstance) {
    this.browserWSEndpoint = browserInstance.wsEndpoint()
  }

  async convert (task) {
    const browser = await puppeteer.connect({
      browserWSEndpoint: this.browserWSEndpoint,
      ignoreHTTPSErrors: true
    })
    const page = await browser.newPage()
    try {
      page.setViewport({height: 800, width: 600})
      await page.goto(`file://${path.join(__dirname, 'index.html')}`)
      await page.$eval('#container', (container, definition, mermaidConfig) => {
        container.innerHTML = definition
        window.mermaid.initialize(mermaidConfig)
        window.mermaid.init(undefined, container)
      }, task.source, task.mermaidConfig)
      return await page.$eval('#container', container => container.innerHTML)
    } catch (e) {
      console.error('Unable to convert the diagram', e)
      throw e
    } finally {
      try {
        await page.close()
      } catch (e) {
        console.warn(`Unable to close the page`, e)
      }
      try {
        await browser.disconnect()
      } catch (e) {
        console.warn(`Unable to disconnect from the browser`, e)
      }
    }
  }
}

module.exports = Worker
