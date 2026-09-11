'use strict'

// Browserless worker tests: no Chromium, no Puppeteer. Requires
// `uvx --from mermaidx mermaidx` on PATH (or KROKI_MERMAID_USE_UVX=0 with a
// pre-installed `mermaidx` binary).
import { describe, it } from 'node:test'
import pngjs from 'pngjs'
import { Worker } from '../src/worker-mermaidx.js'
import Task from '../src/task.js'
import { deepEqual, fail, ok } from 'node:assert'

const PNG = pngjs.PNG

describe('#convert (mermaidx)', function () {
  it('should return an XML compatible SVG', async function () {
    const worker = new Worker()
    const result = await worker.convert(new Task('graph TD\n  A{{Hello<br>World}}'))
    ok(result.includes('<svg'), `output must include <svg but was: ${result.slice(0, 120)}`)
    deepEqual(result.includes('<br>'), false, 'output must not contain non-XML <br>')
  })

  it('should return a valid PNG', async function () {
    const worker = new Worker()
    const result = await worker.convert(new Task('graph TD\n  A --> B', true))
    const image = PNG.sync.read(result) // throws on invalid image
    ok(image.width > 0 && image.height > 0, `expected positive dimensions, got ${image.width}x${image.height}`)
  })

  it('should throw SyntaxError on invalid source', async function () {
    try {
      await new Worker().convert(new Task('not a valid mermaid code'))
      fail('Should throw a SyntaxError exception')
    } catch (err) {
      deepEqual(err.name, 'SyntaxError')
    }
  })

  it('should throw MaxTextSizeError when the source exceeds maxTextSize', async function () {
    const source = `graph TD\n${'A-->B\n'.repeat(10000)}` // > 50000 chars
    try {
      await new Worker().convert(new Task(source))
      fail('Should throw a MaxTextSizeError exception')
    } catch (err) {
      deepEqual(err.name, 'MaxTextSizeError')
    }
  })
})
