'use strict'

// must be declared first
import '../src/logger.js'

import { describe, it, before, after } from 'node:test'
import { deepEqual } from 'node:assert'
import http from 'node:http'
import { Worker } from '../src/worker.js'
import Task from '../src/task.js'

// A disposable local HTTP server standing in for an attacker-controlled or
// internal host. If the companion's Chromium process ever reaches it while
// rendering a diagram, that's an SSRF.
describe('#SSRF via embedded image URLs', function () {
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

  const vectors = [
    {
      name: 'image-shape node',
      source: () => `<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/>
<mxCell id="2" value="" style="shape=image;image=http://127.0.0.1:${markerPort}/image-shape.png;" vertex="1" parent="1">
<mxGeometry x="0" y="0" width="100" height="100" as="geometry"/></mxCell>
</root></mxGraphModel>`
    },
    {
      name: 'background image',
      source: () => `<mxGraphModel backgroundImage='{"src":"http://127.0.0.1:${markerPort}/background.png","width":100,"height":100,"x":0,"y":0}'>
<root><mxCell id="0"/><mxCell id="1" parent="0"/>
<mxCell id="2" value="A" style="rounded=0;" vertex="1" parent="1"><mxGeometry x="0" y="0" width="100" height="40" as="geometry"/></mxCell>
</root></mxGraphModel>`
    }
  ]

  const endpoints = [
    { name: 'svg', isPng: false },
    { name: 'png', isPng: true }
  ]

  for (const vector of vectors) {
    for (const { name, isPng } of endpoints) {
      it(`should not reach the marker host via a ${vector.name} in secure mode (default) on /${name}`, async () => {
        hitCount = 0
        await new Worker().convert(new Task(vector.source(), isPng))
        deepEqual(hitCount, 0, 'the marker host must not receive any request in secure mode')
      })

      it(`should reach the marker host via a ${vector.name} when safeMode=unsafe on /${name} (proves the block is the interception)`, async () => {
        hitCount = 0
        await new Worker().convert(new Task(vector.source(), isPng, 'unsafe'))
        deepEqual(hitCount > 0, true, 'the marker host must receive a request once safe mode is explicitly disabled')
      })
    }
  }

  it('should still render a diagram with no external resource in secure mode', async () => {
    const source =
      '<mxGraphModel><root><mxCell id="0"/><mxCell id="1" parent="0"/><mxCell id="2" value="Hello" style="rounded=1;" vertex="1" parent="1"><mxGeometry x="0" y="0" width="120" height="60" as="geometry"/></mxCell></root></mxGraphModel>'
    const result = await new Worker().convert(new Task(source))
    deepEqual(result.includes('<svg') && result.includes('Hello'), true, 'output must still be a valid SVG')
  })
})
