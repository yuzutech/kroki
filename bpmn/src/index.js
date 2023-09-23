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
      // TODO: add a /_status route (return bpmn version)
      // TODO: read the diagram source as plain text
      const diagramSource = await micro.text(req, { limit: '10mb', encoding: 'utf8' })
      if (diagramSource) {
        try {
          const svg = await worker.convert(new Task(diagramSource))
          res.setHeader('Content-Type', 'image/svg+xml')
          return micro.send(res, 200, svg)
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
    })
  )
  server.listen(8003)
})().catch(err => {
  logger.error({ err }, 'Unable to start the service')
  process.exit(1)
})
