import http from 'node:http'
import path from 'node:path'
import fsp from 'node:fs/promises'
import micro from 'micro'

const MIME_TYPES = {
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

/**
 * Serves the Excalidraw page and its assets to Chrome, on a random loopback port.
 *
 * This is deliberately not the server handling the conversions, which stops
 * accepting connections on SIGTERM and then waits for the open ones to end
 * (see closeOnShutdown in @kroki/browser-instance). On that server, a connection
 * Chrome opened ahead of time and never used would hold the shutdown back until
 * its timeout, and a conversion still creating a page could no longer load it.
 * This one is therefore left open until the process exits.
 *
 * @returns {Promise<{pageUrl: string, server: http.Server}>}
 */
export async function startAssetsServer() {
  const assetsDir = path.join(process.cwd(), 'assets')
  const server = new http.Server(
    micro.serve(async (req, res) => {
      const url = new URL(req.url, 'http://localhost') // the base is not important here
      if (!url.pathname.startsWith('/public/')) {
        return micro.send(res, 404, 'Not Found')
      }
      const filePath = path.join(assetsDir, url.pathname.slice('/public/'.length))
      // prevent directory traversal
      if (!filePath.startsWith(assetsDir + path.sep)) {
        return micro.send(res, 403, 'Forbidden')
      }
      try {
        const content = await fsp.readFile(filePath)
        const mimeType = MIME_TYPES[path.extname(filePath).toLowerCase()]
        res.setHeader('Content-Type', mimeType || 'application/octet-stream')
        return micro.send(res, 200, content)
      } catch {
        return micro.send(res, 404, 'Not Found')
      }
    })
  )
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  return { pageUrl: `http://127.0.0.1:${server.address().port}/public/index.html`, server }
}
