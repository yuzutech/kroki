import { URL, fileURLToPath } from 'node:url'
import path from 'node:path'
import puppeteer from 'puppeteer'
import { logger } from './logger.js'
import { updateConfig } from './config.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export class SyntaxError extends Error {
  constructor (err) {
    super(`Syntax error in graph: ${JSON.stringify(err)}`)
  }
}

export class Worker {
  constructor (browserInstance) {
    this.browserWSEndpoint = browserInstance.wsEndpoint()
    this.pageUrl = process.env.KROKI_MERMAID_PAGE_URL || `file://${path.join(__dirname, '..', 'assets', 'index.html')}`
  }

  async convert (task, config) {
    const browser = await puppeteer.connect({
      browserWSEndpoint: this.browserWSEndpoint,
      ignoreHTTPSErrors: true,
    })

    logger.info('Browser connected')

    const page = await browser.newPage()
    const mermaidConfig = task.mermaidConfig
    if (config !== null && config !== undefined && typeof config[Symbol.iterator] === 'function') {
      updateConfig(mermaidConfig, config)
    }
    try {
      await page.setViewport({ height: 800, width: 600 })
      await page.goto(this.pageUrl)
      // QUESTION: should we reuse the page for performance reason ?
      const evalResult = await page.evaluate(async (definition, mermaidConfig) => {
        window.mermaid.initialize(mermaidConfig)
        try {
          const { svg } = await window.mermaid.render('container', definition)
          return { svg, error: null }
        } catch (err) {
          return { svg: null, error: err }
        }
      }, task.source, mermaidConfig)

      if (evalResult && evalResult.error) {
        throw new SyntaxError(evalResult.error)
      }

      if (task.isPng) {
        await page.setContent(evalResult.svg)
        const container = await page.$('#container')
        return await container.screenshot({
          type: 'png',
          omitBackground: true
        })
      } else {
        return evalResult.svg
      }
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
