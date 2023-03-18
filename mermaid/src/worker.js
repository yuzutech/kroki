/* global XMLSerializer */
const { logger } = require('./logger')
const { updateConfig } = require('./config')
const path = require('path')
const puppeteer = require('puppeteer')

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

  async convert (task, config) {
    const browser = await puppeteer.connect({
      browserWSEndpoint: this.browserWSEndpoint,
      ignoreHTTPSErrors: true
    })
    const page = await browser.newPage()
    const mermaidConfig = task.mermaidConfig
    if (config !== null && config !== undefined && typeof config[Symbol.iterator] === 'function') {
      updateConfig(mermaidConfig, config)
    }
    try {
      page.setViewport({ height: 800, width: 600 })
      await page.goto(this.pageUrl)
      // QUESTION: should we reuse the page for performance reason ?
      await page.$eval('#container', (container, definition, mermaidConfig) => {
        container.textContent = definition
        window.mermaid.initialize(mermaidConfig)
        window.mermaid.init(undefined, container)
      }, task.source, mermaidConfig)

      // diagrams are directly under #containers, while the SVG generated upon syntax error is wrapped in a div
      const svg = await page.$('#container > svg')
      if (!svg) {
        throw new SyntaxError()
      }

      function serializeSvg () {
        return page.$eval('#container', container => {
          const xmlSerializer = new XMLSerializer()
          const nodes = []
          for (let i = 0; i < container.childNodes.length; i++) {
            nodes.push(xmlSerializer.serializeToString(container.childNodes[i]))
          }
          return nodes.join('')
        })
      }

      const mode = task.mode
      if (mode === 'png') {
        return svg.screenshot({
          type: 'png',
          omitBackground: true
        })
      }
      if (mode === 'pdf') {
        const box = await svg.boundingBox()
        return page.pdf({
          width: box.width + box.x * 2,
          height: box.height + box.y * 2,
          pageRanges: '1',
          omitBackground: true
        })
      }
      return serializeSvg()
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

module.exports = {
  Worker,
  SyntaxError
}
