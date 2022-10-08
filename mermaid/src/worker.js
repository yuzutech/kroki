/* global XMLSerializer */
const path = require('path')
const puppeteer = require('puppeteer')
const { logger } = require('./logger')

class SyntaxError extends Error {
  constructor () {
    super('Syntax error in graph')
  }
}

class Worker {
  constructor (browserInstance) {
    this.browserWSEndpoint = browserInstance.wsEndpoint()
    this.pageUrl = process.env.KROKI_MERMAID_PAGE_URL || `file://${path.join(__dirname, '..', 'assets', 'index.html')}`
  }

  async convert (task) {
    const browser = await puppeteer.connect({
      browserWSEndpoint: this.browserWSEndpoint,
      ignoreHTTPSErrors: true
    })
    const page = await browser.newPage()
    try {
      page.setViewport({ height: 800, width: 600 })
      await page.goto(this.pageUrl)
      // QUESTION: should we reuse the page for performance reason ?
      await page.$eval('#container', (container, definition, mermaidConfig) => {
        container.textContent = definition
        window.mermaid.initialize(mermaidConfig)
        window.mermaid.init(undefined, container)
      }, task.source, task.mermaidConfig)

      // diagrams are directly under #containers, while the SVG generated upon syntax error is wrapped in a div
      const svg = await page.$('#container > svg')
      if (!svg) {
        throw new SyntaxError()
      }

      if (task.isPng) {
        return await svg.screenshot({
          type: 'png',
          omitBackground: true
        })
      } else {
        return await page.$eval('#container', container => {
          const xmlSerializer = new XMLSerializer()
          const nodes = []
          for (let i = 0; i < container.childNodes.length; i++) {
            nodes.push(xmlSerializer.serializeToString(container.childNodes[i]))
          }
          return nodes.join('')
        })
      }
    } finally {
      try {
        await page.close()
      } catch (e) {
        logger.warn('Unable to close the page', e)
      }
      try {
        await browser.disconnect()
      } catch (e) {
        logger.warn('Unable to disconnect from the browser', e)
      }
    }
  }
}

module.exports = {
  Worker,
  SyntaxError
}
