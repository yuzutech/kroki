// must be declared first
import { logger } from './logger.js'
import http from 'node:http'
import {TimeoutError as PuppeteerTimeoutError} from 'puppeteer'
import micro from 'micro'
import Task from './task.js'
import { create } from './browser-instance.js'
import { SyntaxError, TimeoutError, Worker } from './worker.js'

(async () => {
  // QUESTION: should we create a pool of Chrome instances ?
  const browser = await create()
  logger.info(`Chrome accepting connections on endpoint ${browser.wsEndpoint()}`)
  const worker = new Worker(browser)
  const server = new http.Server(
    micro.serve(async (req, res) => {
      // TODO: add a /_status route (return diagrams.net version)
      // TODO: read the diagram source as plain text
      const url = new URL(req.url, 'http://localhost') // create a URL object. The base is not important here
      const outputType = url.pathname.match(/\/(png|svg)$/)?.[1]
      if (outputType) {
        const diagramSource = await micro.text(req, { limit: (process.env.KROKI_MAX_BODY_SIZE ?? '1mb'), encoding: 'utf8' })
        if (diagramSource) {
          try {
            const isPng = outputType === 'png'
            const output = await worker.convert(new Task(diagramSource, isPng))
            res.setHeader('Content-Type', isPng ? 'image/png' : 'image/svg+xml')
            return micro.send(res, 200, output)
          } catch (err) {
            if (err instanceof PuppeteerTimeoutError || err instanceof TimeoutError) {
              return micro.send(res, 408, {
                error: {
                  message: `Request timeout: ${err.message}`,
                  name: 'TimeoutError',
                  stacktrace: err.stack
                }
              })
            } else if (err instanceof SyntaxError) {
              return micro.send(res, 400, {
                error: {
                  message: err.message,
                  name: err.name,
                  stacktrace: err.stack
                }
              })
            } else {
              logger.warn({ err }, 'Exception during convert')
              return micro.send(res, 500, {
                error: {
                  message: `An error occurred while converting the diagram: ${err.message}`,
                  name: err.name || '',
                  stacktrace: err.stack || ''
                }
              })
            }
          }
        }
        return micro.send(res, 400, {
          error: {
            message: 'Body must not be empty.',
            name: '',
            stacktrace: ''
          }
        })
      }
      return micro.send(res, 400, {
        error: {
          message: 'Available endpoints are /svg and /png.',
          name: '',
          stacktrace: ''
        }
      })
    })
  )
  server.listen(8005)
})().catch(err => {
  logger.error({ err }, 'Unable to start the service')
  process.exit(1)
})
