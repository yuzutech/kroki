import http from 'node:http'
import micro from 'micro'
import { logger } from './logger.js'
import { SyntaxError, Worker } from './worker.js'
import Task from './task.js'
import { create } from './browser-instance.js'

async function handleRender(browserPromise, res, diagramSource, url, outputType) {
  const isPng = outputType === 'png'
  const worker = new Worker(await browserPromise)

  const output = await worker.convert(new Task(diagramSource, isPng), url.searchParams)
  res.setHeader('Content-Type', isPng ? 'image/png' : 'image/svg+xml')
  return micro.send(res, 200, output)
}

async function startBrowser() {
  let browserPromise = create()

  browserPromise.then(browser => {
    logger.info(`Chrome accepting connections on endpoint ${browser.wsEndpoint()}`)
  })

  return browserPromise
}

(async () => {
  // QUESTION: should we create a pool of Chrome instances ?
  let browserPromise = startBrowser()

  const server = new http.Server(
    micro.serve(async (req, res) => {
      // Add a /health-check route that renders a sample diagram by calling the worker
      if (req.url === '/health-check') {
        await worker.convert(new Task('graph TD\nA-->B', false), new URLSearchParams())

        // We don't actually care about the output, we just want to make sure the worker is up and running
        return micro.send(res, 200, 'OK')
      }

      const url = new URL(req.url, 'http://localhost') // create a URL object. The base is not important here
      const outputType = url.pathname.match(/\/(png|svg)$/)?.[1]

      if (!outputType) {
        return micro.send(res, 400, 'Available endpoints are /svg and /png.')
      }

      const diagramSource = await micro.text(req, { limit: '1mb', encoding: 'utf8' })
      if (!diagramSource) {
        return micro.send(res, 400, 'Body must not be empty.')
      }

      let browser = await browserPromise
      try {
        // Don't even try to render if the browser is not connected
        if (!browser.isConnected()) {
          logger.info('Browser is not connected, restarting it')
          browserPromise = startBrowser()
        }

        return handleRender(browserPromise, res, diagramSource, url, outputType)
      } catch (err) {
        if (err instanceof SyntaxError) {
          logger.info({ err }, 'Syntax error during convert')
          return micro.send(res, 400, err.message)
        } else {
          logger.warn({ err }, 'Exception during convert')

          // Lets try to recover from this error by restarting the browser
          // Handles the case when the browser died during generation
          if (browser.isConnected()) {
            logger.error('Browser is still connected, but we got an error, bailing out')
            return micro.send(res, 500, 'An error occurred while converting the diagram')
          } else {
            logger.info('Browser is not connected, restarting it, will help new incoming requests + this one')
            browserPromise = startBrowser()

            return handleRender(browserPromise, res, diagramSource, url, outputType)
          }
        }
      }
    })
  )
  server.listen(8002)
})().catch(err => {
  logger.error({ err }, 'Unable to start the service')
  process.exit(1)
})

