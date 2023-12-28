/* global XMLSerializer */
import puppeteer from 'puppeteer'
import {logger} from './logger.js'

export class TimeoutError extends Error {
  constructor(timeoutDurationMs, action = 'convert') {
    super(`Timeout error: ${action} took more than ${timeoutDurationMs}ms`)
  }
}

export class SyntaxError extends Error {
  constructor(err) {
    logger.error({err})
    super(`Syntax error in graph: ${JSON.stringify(err)}`)
  }
}

export class Worker {
  constructor(browserInstance) {
    this.browserWSEndpoint = browserInstance.wsEndpoint()
    this.pageUrl = process.env.KROKI_ONLINEWARDLEYMAPS_PAGE_URL || `http://localhost:3000`
    this.convertTimeout = process.env.KROKI_ONLINEWARDLEYMAPS_CONVERT_TIMEOUT || '15000'
  }

  async convert(task) {
    console.debug("Connecting browser")
    const browser = await puppeteer.connect({
      browserWSEndpoint: this.browserWSEndpoint,
      ignoreHTTPSErrors: true
    })
    // https://github.com/damonsk/onlinewardleymaps/pull/75
    console.debug("Browser connected")
    const page = await browser.newPage()
    try {
      console.debug("Page loaded")
      let evalResult
      try {
        await page.setViewport({height: 1024, width: 800})
        await page.goto(this.pageUrl)
        console.debug("Page loaded")

        const editorSelector = '.ace_text-input';
        await page.waitForSelector(editorSelector);
        console.debug("Editor selector found")

        await page.$eval(
          editorSelector,
          (e, val) => {
            e.value = val;
            e.dispatchEvent(new Event('input', {bubbles: true}));
            e.dispatchEvent(new Event('change', {bubbles: true}));
          },
          task.source
        );
        console.debug("Editor Map content set")
        const mapFrameSelector = '.contentLoaded';
        await page.waitForSelector(mapFrameSelector);
        console.debug("image content loaded")

        const svgSelector = '#map';
        const elem = await page.waitForSelector(svgSelector);
        const svg = await elem.evaluate((e) => e.innerHTML.replaceAll("&nbsp;", " "));
        console.debug("svg loaded", svg)
        evalResult = {svg: svg, error: null}
      } catch (err) {
        logger.error({err}, 'Unable to load the map')
        evalResult = {svg: null, error: err}
      }

      if (evalResult && evalResult.error) {
        throw new SyntaxError(evalResult.error)
      }

      if (task.isPng) {
        console.debug("Converting to PNG")
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
        logger.warn({err}, 'Unable to close the page')
      }
      try {
        await browser.disconnect()
      } catch (err) {
        logger.warn({err}, 'Unable to disconnect from the browser')
      }
    }
  }
}
