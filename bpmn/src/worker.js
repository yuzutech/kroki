import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

import { logger } from './logger.js'
import { getBrowserWSEndpoint, protocolTimeout } from './browser-instance.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export class TimeoutError extends Error {
  constructor(timeoutDurationMs, action = 'convert') {
    super(`Timeout error: ${action} took more than ${timeoutDurationMs}ms`)
  }
}

export class SyntaxError extends Error {
  constructor(err) {
    logger.error({ err })
    super(`Syntax error in graph: ${JSON.stringify(err)}`)
  }
}

export class Worker {
  constructor() {
    this.pageUrl =
      process.env.KROKI_BPMN_PAGE_URL ||
      `file://${path.join(__dirname, '..', 'assets', 'index.html')}`
    this.convertTimeout = process.env.KROKI_BPMN_CONVERT_TIMEOUT || '15000'
  }

  async convert(task) {
    const browser = await puppeteer.connect({
      browserWSEndpoint: await getBrowserWSEndpoint(),
      ignoreHTTPSErrors: true,
      // Bound CDP calls so a wedged Chrome fails fast instead of stalling 180s.
      protocolTimeout
    })
    const page = await browser.newPage()
    try {
      await page.setViewport({ height: 800, width: 600 })
      await page.goto(this.pageUrl)
      const evalResult = await Promise.race([
        page.evaluate(
          async (bpmnXML, _options) => {
            try {
              const container = document.getElementById('container')
              container.textContent = ''
              /* global BpmnJS */
              const viewer = new BpmnJS({ container })
              await viewer.importXML(bpmnXML)
              const { svg, err } = await viewer.saveSVG()
              return { svg, error: err }
            } catch (err) {
              return { svg: null, error: err }
            }
          },
          task.source,
          task.bpmnConfig
        ),
        new Promise((_resolve, reject) =>
          setTimeout(() => reject(new TimeoutError(this.convertTimeout)), this.convertTimeout)
        )
      ])
      if (evalResult?.error) {
        throw new SyntaxError(evalResult.error)
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
}
