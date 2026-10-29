// must be declared first
import { logger } from './logger.js'
import http from 'node:http'
import path from 'node:path'
import fsp from 'node:fs/promises'
import micro from 'micro'
import Worker, { QueueFullError, TimeoutError } from './worker.js'
import Task from './task.js'
import { closeOnShutdown, getBrowserWSEndpoint } from './browser-instance.js'

;(async () => {
  // Warm up Chrome so the service fails fast when it cannot launch; the
  // instance is re-created on demand if the process dies (see browser-instance.js).
  await getBrowserWSEndpoint()
  const worker = new Worker()
  const server = new http.Server(
    micro.serve(async (req, res) => {
      const url = new URL(req.url, 'http://localhost') // create a URL object. The base is not important here
      if (url.pathname.startsWith('/public/')) {
        const relativePath = url.pathname.slice('/public/'.length)
        const filePath = path.join(process.cwd(), 'assets', relativePath)
        // prevent directory traversal
        if (!filePath.startsWith(path.join(process.cwd(), 'assets'))) {
          return micro.send(res, 403, 'Forbidden')
        }
        try {
          const content = await fsp.readFile(filePath)
          const ext = path.extname(filePath).toLowerCase()
          const mimeTypes = {
            '.html': 'text/html',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.woff2': 'font/woff2',
            '.woff': 'font/woff',
            '.ttf': 'font/ttf',
            '.svg': 'image/svg+xml',
            '.png': 'image/png'
          }
          res.setHeader('Content-Type', mimeTypes[ext] || 'application/octet-stream')
          return micro.send(res, 200, content)
        } catch {
          return micro.send(res, 404, 'Not Found')
        }
      }
      // TODO: add a /_status route (return excalidraw version)
      // TODO: read the diagram source as plain text
      const diagramSource = await micro.text(req, {
        limit: process.env.KROKI_MAX_BODY_SIZE ?? '1mb',
        encoding: 'utf8'
      })
      if (diagramSource) {
        try {
          // Forwarded by the gateway (KROKI_EXCALIDRAW_SAFE_MODE/KROKI_SAFE_MODE).
          // Fail closed: an unrecognized or missing value is treated as 'secure'.
          const safeMode = url.searchParams.get('safeMode') === 'unsafe' ? 'unsafe' : 'secure'
          const svg = await worker.convert(new Task(diagramSource, safeMode))
          res.setHeader('Content-Type', 'image/svg+xml')
          return micro.send(res, 200, svg)
        } catch (err) {
          if (err instanceof QueueFullError) {
            logger.warn({ err }, 'Conversion rejected')
            return micro.send(res, 503, {
              error: {
                message: err.message,
                name: err.name,
                stacktrace: err.stack
              }
            })
          }
          if (err instanceof TimeoutError) {
            return micro.send(res, 408, {
              error: {
                message: `Request timeout: ${err.message}`,
                name: 'TimeoutError',
                stacktrace: err.stack
              }
            })
          }
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
  // Let in-flight conversions finish on SIGTERM (see @kroki/browser-instance).
  closeOnShutdown(server)
  server.listen(8004)
})().catch(err => {
  logger.error({ err }, 'Unable to start the service')
  process.exit(1)
})
