'use strict'

import { describe, it, before, after } from 'node:test'
import { deepEqual } from 'node:assert'
import http from 'node:http'
import { Worker } from '../src/worker-mermaidx.js'
import Task from '../src/task.js'

// Same marker-host setup as ssrf-test.mjs (Chromium worker). Unlike Chromium,
// the embedded mermaidx engine never issues outbound requests at all —
// verified by the hit counter — so the marker must stay at zero in every
// mode, and the render fails closed (SyntaxError) because mermaid cannot
// decode the unloaded image. Known delta vs puppeteer+unsafe, which loads it.
describe('#SSRF via flowchart image-shape node (mermaidx)', function () {
  let marker
  let markerPort
  let hitCount

  before(async () => {
    hitCount = 0
    marker = http.createServer((req, res) => {
      hitCount++
      res.setHeader('Content-Type', 'image/png')
      res.end(
        Buffer.from(
          'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
          'base64'
        )
      )
    })
    await new Promise(resolve => marker.listen(0, '127.0.0.1', resolve))
    markerPort = marker.address().port
  })

  after(async () => {
    await new Promise(resolve => marker.close(resolve))
  })

  const cases = [
    { name: 'svg', isPng: false, safeMode: 'secure' },
    { name: 'svg', isPng: false, safeMode: 'unsafe' },
    { name: 'png', isPng: true, safeMode: 'secure' },
    { name: 'png', isPng: true, safeMode: 'unsafe' }
  ]

  cases.forEach(({ name, isPng, safeMode }) => {
    it(`should never reach the marker host on /${name} with safeMode=${safeMode}`, async () => {
      hitCount = 0
      const source = `flowchart LR\n  N@{ img: "http://127.0.0.1:${markerPort}/marker.png", label: "marker" }`
      try {
        await new Worker().convert(new Task(source, isPng, safeMode))
      } catch (err) {
        deepEqual(err.name, 'SyntaxError', `expected the image load to fail safely, got: ${err.stack || err}`)
      }
      deepEqual(hitCount, 0, 'the marker host must not receive any request in any mode')
    })
  })

  it('should still render a plain flowchart with no image node in secure mode', async () => {
    const worker = new Worker()
    const result = await worker.convert(new Task('flowchart LR\n  A --> B'))
    deepEqual(result.includes('<svg'), true, 'output must still be a valid SVG')
  })
})
