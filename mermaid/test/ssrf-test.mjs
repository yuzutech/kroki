'use strict'

// must be declared first
import { logger } from '../src/logger.js'

import { describe, it, before, after } from 'node:test'
import { deepEqual } from 'node:assert'
import http from 'node:http'
import { Worker } from '../src/worker.js'
import Task from '../src/task.js'

// A disposable local HTTP server standing in for an attacker-controlled or
// internal host. If the companion's Chromium process ever reaches it while
// rendering a diagram, that's an SSRF: see https://github.com/yuzutech/kroki
// safe mode documentation, which promises SECURE prevents network reads.
describe('#SSRF via flowchart image-shape node', function () {
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

  const endpoints = [
    { name: 'svg', isPng: false },
    { name: 'png', isPng: true }
  ]

  // Mermaid fails the whole render (SyntaxError) when a flowchart image node
  // can't be decoded, which is exactly what blocking the request causes. That
  // fail-closed behavior is fine; what matters here is that the marker was
  // never reached, so these two helpers swallow that expected error.
  async function convertExpectingBlock(worker, task) {
    try {
      await worker.convert(task)
    } catch (err) {
      deepEqual(err.name, 'SyntaxError', `expected the image load to fail safely, got: ${err.stack || err}`)
    }
  }

  endpoints.forEach(({ name, isPng }) => {
    it(`should not reach the marker host in secure mode (default) on /${name}`, async () => {
      hitCount = 0
      const source = `flowchart LR\n  N@{ img: "http://127.0.0.1:${markerPort}/marker.png", label: "marker" }`
      const worker = new Worker()
      await convertExpectingBlock(worker, new Task(source, isPng))
      deepEqual(hitCount, 0, 'the marker host must not receive any request in secure mode')
    })

    it(`should not reach the marker host when safeMode=secure is explicit on /${name}`, async () => {
      hitCount = 0
      const source = `flowchart LR\n  N@{ img: "http://127.0.0.1:${markerPort}/marker.png", label: "marker" }`
      const worker = new Worker()
      await convertExpectingBlock(worker, new Task(source, isPng, 'secure'))
      deepEqual(hitCount, 0, 'the marker host must not receive any request in secure mode')
    })

    it(`should reach the marker host when safeMode=unsafe on /${name} (proves the block is the interception, not mermaid rejecting the syntax)`, async () => {
      hitCount = 0
      const source = `flowchart LR\n  N@{ img: "http://127.0.0.1:${markerPort}/marker.png", label: "marker" }`
      const worker = new Worker()
      await worker.convert(new Task(source, isPng, 'unsafe'))
      deepEqual(hitCount > 0, true, 'the marker host must receive a request once safe mode is explicitly disabled')
    })
  })

  it('should still render a plain flowchart with no image node in secure mode', async () => {
    const worker = new Worker()
    const result = await worker.convert(new Task('flowchart LR\n  A --> B'))
    deepEqual(result.includes('<svg'), true, 'output must still be a valid SVG')
  })
})