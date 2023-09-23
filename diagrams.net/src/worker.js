/* global XMLSerializer */
import path from 'node:path'
import { URL, fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'

import { logger } from './logger.js'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

export class TimeoutError extends Error {
  constructor (timeoutDurationMs, action = 'convert') {
    super(`Timeout error: ${action} took more than ${timeoutDurationMs}ms`)
  }
}

export class SyntaxError extends Error {
  constructor (err) {
    logger.error({ err })
    super(`Syntax error in graph: ${JSON.stringify(err)}`)
  }
}

export class Worker {
  constructor (browserInstance) {
    this.browserWSEndpoint = browserInstance.wsEndpoint()
    this.pageUrl = process.env.KROKI_DIAGRAMSNET_PAGE_URL || `file://${path.join(__dirname, '..', 'assets', 'index.html')}`
    this.convertTimeout = process.env.KROKI_DIAGRAMSNET_CONVERT_TIMEOUT || '15000'
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
      const evalResult = await Promise.race([
        page.evaluate((source) => {
          /* global render */
          try {
            const svgRoot = render({
              xml: source,
              format: 'svg'
            }).getSvg()
            const s = new XMLSerializer()
            return { svg: s.serializeToString(svgRoot), error: null }
          } catch (err) {
            logger.log({ err })
            return { svg: null, error: err }
          }
        }, task.source),
        new Promise((resolve, reject) => setTimeout(() => reject(new TimeoutError(this.convertTimeout)), this.convertTimeout))
      ])

      if (evalResult && evalResult.error) {
        throw new SyntaxError(evalResult.error)
      }

      // const bounds = await page.mainFrame().$eval('#LoadingComplete', div => div.getAttribute('bounds'))
      // const pageId = await page.mainFrame().$eval('#LoadingComplete', div => div.getAttribute('page-id'))
      // const scale = await page.mainFrame().$eval('#LoadingComplete', div => div.getAttribute('scale'))
      // const pageCount = parseInt(await page.mainFrame().$eval('#LoadingComplete', div => div.getAttribute('pageCount')))

      if (task.isPng) {
        await page.setContent(`<!DOCTYPE html>  
<html>
<head>  
<meta name="viewport" content="initial-scale=1.0, user-scalable=no" />  
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />  
</head>  
<body> 
${evalResult.svg}
</body>
</html>`)
        const container = await page.$('svg')
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
