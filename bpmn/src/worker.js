const path = require('path')
const puppeteer = require('puppeteer')
const PUPPETEER_DEFAULT_TIMEOUT = process.env['PUPPETEER_DEFAULT_TIMEOUT'] || '5000' // default 5seconds
const defaultTimeout = parseInt(PUPPETEER_DEFAULT_TIMEOUT, 10)

class Worker {
  constructor (browserInstance) {
    this.browserWSEndpoint = browserInstance.wsEndpoint()
    this.pageUrl = process.env.KROKI_BPMN_PAGE_URL || `file://${path.join(__dirname, '..', 'assets', 'index.html')}`
  }

  async convert (task) {
    const browser = await puppeteer.connect({
      browserWSEndpoint: this.browserWSEndpoint,
      ignoreHTTPSErrors: true
    })
    const page = await browser.newPage()
    page.setDefaultTimeout(defaultTimeout)
    try {
      page.setViewport({ height: 800, width: 600 })
      await page.goto(this.pageUrl)
      return await page.$eval('#container', (container, bpmnXML, options) => {
        container.innerHTML = bpmnXML
        /* global BpmnJS */
        const viewer = new BpmnJS({ container: container })

        function loadDiagram () {
          return new Promise((resolve, reject) => {
            viewer.importXML(bpmnXML, function (err) {
              if (err) {
                reject(err)
              } else {
                resolve()
              }
            })
          })
        }

        function exportSVG () {
          return new Promise((resolve, reject) => {
            viewer.saveSVG((err, svg) => {
              if (err) {
                console.log('Failed to export', err)
                reject(err)
              } else {
                resolve(svg)
              }
            })
          })
        }

        return loadDiagram().then(() => {
          return exportSVG()
        }).catch((err) => {
          throw err
        })
      }, task.source, task.bpmnConfig)
    } catch (e) {
      console.error('Unable to convert the diagram', e)
      throw e
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

module.exports = Worker
