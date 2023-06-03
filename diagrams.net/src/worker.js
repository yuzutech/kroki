/* global XMLSerializer */
const path = require('node:path')
const puppeteer = require('puppeteer')

class SyntaxError extends Error {
  constructor (err) {
    console.log({ err })
    super(`Syntax error in graph: ${JSON.stringify(err)}`)
  }
}

class Worker {
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
      // QUESTION: should we reuse the page for performance reason ?

      const evalResult = await Promise.race([
        page.evaluate((source) => {
          /* global render */
          try {
            const svgRoot = render({
              xml: source,
              format: 'svg'
            }).getSvg()
            const s = new XMLSerializer()
            console.log({ s })
            return { svg: s.serializeToString(svgRoot), error: null }
          } catch (err) {
            console.log({ err })
            return { svg: null, error: err }
          }
        }, task.source),
        page.waitForTimeout(this.convertTimeout)
      ])

      if (evalResult && evalResult.error) {
        throw new SyntaxError(evalResult.error)
      }

      // const bounds = await page.mainFrame().$eval('#LoadingComplete', div => div.getAttribute('bounds'))
      // const pageId = await page.mainFrame().$eval('#LoadingComplete', div => div.getAttribute('page-id'))
      // const scale = await page.mainFrame().$eval('#LoadingComplete', div => div.getAttribute('scale'))
      // const pageCount = parseInt(await page.mainFrame().$eval('#LoadingComplete', div => div.getAttribute('pageCount')))

      if (task.isPng) {
        await page.setContent(evalResult.svg)
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

module.exports = {
  Worker,
  SyntaxError
}
