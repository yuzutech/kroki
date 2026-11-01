import { after, before, describe, it } from 'node:test'
import { deepEqual, match } from 'node:assert'
import http from 'node:http'
import { startAssetsServer } from '../src/assets-server.js'

// fetch() normalizes the path, so a traversal attempt has to be sent as is.
function rawGet(port, path) {
  return new Promise((resolve, reject) => {
    http.get({ host: '127.0.0.1', port, path }, res => {
      res.resume()
      resolve(res.statusCode)
    }).on('error', reject)
  })
}

describe('#assets server', () => {
  let pageUrl
  let server

  before(async () => {
    ;({ pageUrl, server } = await startAssetsServer())
  })

  after(() => {
    server.closeAllConnections()
    server.close()
  })

  it('should listen on a random loopback port', () => {
    deepEqual(server.address().address, '127.0.0.1')
    match(pageUrl, /^http:\/\/127\.0\.0\.1:\d+\/public\/index\.html$/)
  })

  it('should serve the page', async () => {
    const response = await fetch(pageUrl)
    deepEqual(response.status, 200)
    deepEqual(response.headers.get('content-type'), 'text/html')
  })

  it('should return a 404 for an unknown asset or outside of /public', async () => {
    deepEqual((await fetch(new URL('unknown.js', pageUrl))).status, 404)
    deepEqual((await fetch(new URL('/index.html', pageUrl))).status, 404)
  })

  it('should not serve a file outside of the assets directory', async () => {
    const { port } = server.address()
    deepEqual(await rawGet(port, '/public/%2e%2e/package.json'), 404)
    deepEqual(await rawGet(port, '/public/../package.json'), 404)
  })
})
