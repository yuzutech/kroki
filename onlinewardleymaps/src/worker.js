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
    logger.debug("Connecting browser")
    const browser = await puppeteer.connect({
      browserWSEndpoint: this.browserWSEndpoint,
      ignoreHTTPSErrors: true
    })
    // https://github.com/damonsk/onlinewardleymaps/pull/75
    logger.debug("Browser connected")
    const page = await browser.newPage()
    page.setDefaultTimeout(parseInt(this.convertTimeout))

    const editorSelector = '.ace_text-input';
    const mapFrameSelector = '.contentLoaded';
    const fullScreenButtonSelector = 'html body div#__next div#main.MuiGrid-root.MuiGrid-container.MuiGrid-spacing-xs-2.css-16divny div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-sm-8.map-view.css-1klpxdq div.noText div.plain button.MuiButtonBase-root.MuiIconButton-root.MuiIconButton-colorBlack.MuiIconButton-sizeMedium.css-y7xizo';
    const footerSelector = "html body div#__next div.MuiGrid-root.MuiGrid-container.css-3iorlj";
    const inputSelector = 'html body div#__next div#main.MuiGrid-root.MuiGrid-container.MuiGrid-spacing-xs-2.css-16divny div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-sm-4.css-owsoks div#htmPane div#htmEditor.ace_editor.ace_hidpi.ace_dark.ace-dracula';
    const mapContentSelector = '#main > div.MuiGrid-root.MuiGrid-item.MuiGrid-grid-xs-12.MuiGrid-grid-sm-8.map-view.css-1klpxdq > div' // set position absolute, top:0, left:0, max-width:100%, max-height:100%, width:100%, height:100%
    const bodySelector = 'body' // set background-color:transparent
    const titleSvgSelector = '#title' // set display:none, if shoTitle is false
    const helperSelector = "html body div.ace_editor.ace_hidpi.ace_autocomplete.ace_dark.ace-dracula div.ace_scroller div.ace_content"

    try {
      let evalResult
      try {
        await page.goto(this.pageUrl)
        await page.setViewport({height: task.height, width: task.width})
        logger.debug("Page loaded")

        logger.debug("Prepare page")
        await (await page.waitForSelector(fullScreenButtonSelector)).evaluate((e) => {
          e.click();
          e.style.display = 'none'
        });
        logger.debug(("Click and hide full screen button"))


        if (!task.showTitle) {
          await (await page.waitForSelector(titleSvgSelector)).evaluate((e) => e.style.display = 'none');
          logger.debug("Delete title")
        }

        logger.debug("Hide input")
        await (await page.waitForSelector(mapContentSelector)).evaluate((e) => {
        });
        logger.debug("Set map content position")
        logger.debug("Preparation done")

        await page.waitForSelector(editorSelector);
        logger.debug("Editor selector found")

        await page.$eval(
          editorSelector,
          (e, val) => {
            e.value = val + "\n";
            e.dispatchEvent(new Event('input', {bubbles: true}));
            e.dispatchEvent(new Event('change', {bubbles: true}));
          },
          task.source
        );
        logger.debug("Editor Map content set")
        await (await page.waitForSelector(mapFrameSelector)).evaluate((e) => {
          e.style.position = 'absolute';
          e.style.top = '0';
          e.style.left = '0';
          e.style.maxWidth = '100%';
          e.style.width = '101%';
          e.style.backgroundColor = "white"
          e.style.zIndex = '1000';
        })
        logger.debug("image content loaded")

        await (await page.waitForSelector(inputSelector)).evaluate((e) => {
          e.style.display = 'none';
        })
        await (await page.waitForSelector(bodySelector)).evaluate((e) => {
          e.style.backgroundColor = "white"
        })
        await (await page.waitForSelector(footerSelector)).evaluate((e) => {
          e.style.display = 'none';
        })
        logger.debug("Hide input and footer, set background transparent")

        await page.setViewport({height: task.height + 1, width: task.width})
        await page.waitForTimeout(1500)

        const svgSelector = '#map';
        const elem = await page.waitForSelector(svgSelector);
        const svg = await elem.evaluate((e) => e.innerHTML.replaceAll("&nbsp;", " "));
        logger.debug("svg loaded", svg)
        evalResult = {svg: svg, error: null}
      } catch (err) {
        logger.error({err}, 'Unable to load the map')
        evalResult = {svg: null, error: err}
      }

      if (evalResult && evalResult.error) {
        throw new SyntaxError(evalResult.error)
      }

      if (task.isPng) {
        logger.debug("Converting to PNG")
        const container = await page.$('body')
        return await container.screenshot({
          type: 'png',
          omitBackground: true,
          clip: {
            x: 0,
            y: 0,
            width: task.width,
            height: task.height - 10,
            scale: 1
          }
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
