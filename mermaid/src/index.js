// must be declared first
import { logger } from './logger.js'

import http from 'node:http'
import micro from 'micro'
import { SyntaxError, TimeoutError, Worker } from './worker.js'
import Task from './task.js'
import { create } from './browser-instance.js'

(async () => {
  // QUESTION: should we create a pool of Chrome instances ?
  const browser = await create()
  logger.info(`Chrome accepting connections on endpoint ${browser.wsEndpoint()}`)
  const worker = new Worker(browser)
  const server = new http.Server(
    micro.serve(async (req, res) => {
      // Add a /health route that renders a sample diagram by calling the worker
      if (req.url === '/health') {
        await worker.convert(new Task('graph TD\nA-->B', false), new URLSearchParams())

        // We don't actually care about the output, we just want to make sure the worker is up and running
        return micro.send(res, 200, 'OK')
      }

      // TODO: add a /_status route (return mermaid version)
      // TODO: read the diagram source as plain text
      const url = new URL(req.url, 'http://localhost') // create a URL object. The base is not important here
      const outputType = url.pathname.match(/\/(png|svg)$/)?.[1]
      if (outputType) {
        const diagramSource = await micro.text(req, { limit: (process.env.KROKI_MAX_BODY_SIZE ?? '1mb'), encoding: 'utf8' })
        if (diagramSource) {
          try {
            const isPng = outputType === 'png'
            const output = await worker.convert(new Task(diagramSource, isPng), url.searchParams)
            res.setHeader('Content-Type', isPng ? 'image/png' : 'image/svg+xml')
            return micro.send(res, 200, output)
          } catch (err) {
            if (err instanceof TimeoutError) {
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
                  message: 'An error occurred while converting the diagram',
                  name: err.name || 'Error',
                  stacktrace: err.stack || ''
                }
              })
            }
          }
        }
        return micro.send(res, 400, {
          error: {
            message: 'Body must not be empty.',
            name: 'Error',
            stacktrace: ''
          }
        })
      }
      return micro.send(res, 400, {
        error: {
          message: 'Available endpoints are /svg and /png.',
          name: 'Error',
          stacktrace: ''
        }
      })
    })
  )
  server.listen(8002)
})().catch(err => {
  logger.error({ err }, 'Unable to start the service')
  process.exit(1)
})
