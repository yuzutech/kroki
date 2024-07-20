// must be declared first
import { logger } from './logger.js'
import http from 'node:http'
import micro from 'micro'
import Worker from './worker.js'
import Task from './task.js'
import { create } from './browser-instance.js'

(async () => {
  // QUESTION: should we create a pool of Chrome instances ?
  const browser = await create()
  logger.info(`Chrome accepting connections on endpoint ${browser.wsEndpoint()}`)
  const worker = new Worker(browser)
  const server = new http.Server(
    micro.serve(async (req, res) => {
      // TODO: add a /_status route (return excalidraw version)
      // TODO: read the diagram source as plain text
      const diagramSource = await micro.text(req, { limit: (process.env.KROKI_MAX_BODY_SIZE ?? '1mb'), encoding: 'utf8' })
      if (diagramSource) {
        try {
          const svg = await worker.convert(new Task(diagramSource))
          res.setHeader('Content-Type', 'image/svg+xml')
          return micro.send(res, 200, svg)
        } catch (err) {
          logger.warn({ err }, 'Exception during convert')
          return micro.send(res, 400, {
            error: {
              message: `Unable to convert the diagram: ${err.message}`,
              name: err.name || '',
              stacktrace: err.stack || ''
            }
          })
        }
      }
      micro.send(res, 400, {
        error: {
          message: 'Body must not be empty.',
          name: '',
          stacktrace: ''
        }
      })
    })
  )
  server.listen(8004)
})().catch(err => {
  logger.error({ err }, 'Unable to start the service')
  process.exit(1)
})
