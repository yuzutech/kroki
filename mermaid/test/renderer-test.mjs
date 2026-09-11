'use strict'

import { describe, it } from 'node:test'
import { deepEqual, ok } from 'node:assert'
import { resolveRenderer, createWorker } from '../src/renderer.js'
import { Worker as MermaidxWorker } from '../src/worker-mermaidx.js'
import { Worker as PuppeteerWorker } from '../src/worker.js'
import * as errors from '../src/errors.js'
import * as fromMermaidx from '../src/worker-mermaidx.js'
import * as fromPuppeteer from '../src/worker.js'

describe('resolveRenderer', function () {
  it('should default to puppeteer when unset', async function () {
    delete process.env.KROKI_MERMAID_RENDERER
    deepEqual(resolveRenderer(), 'puppeteer')
  })

  it('should select mermaidx (case-insensitive)', async function () {
    deepEqual(resolveRenderer('mermaidx'), 'mermaidx')
    deepEqual(resolveRenderer('Mermaidx'), 'mermaidx')
  })

  it('should fail closed to puppeteer on unrecognized values', async function () {
    deepEqual(resolveRenderer('bogus'), 'puppeteer')
    deepEqual(resolveRenderer(''), 'puppeteer')
  })
})

describe('createWorker', function () {
  it('should create the puppeteer worker by default', async function () {
    ok(createWorker('puppeteer') instanceof PuppeteerWorker)
  })

  it('should create the mermaidx worker when selected', async function () {
    ok(createWorker('mermaidx') instanceof MermaidxWorker)
  })

  it('should share error classes so index.js instanceof checks hold for both workers', async function () {
    deepEqual(fromMermaidx.SyntaxError, errors.SyntaxError)
    deepEqual(fromMermaidx.TimeoutError, errors.TimeoutError)
    deepEqual(fromMermaidx.MaxTextSizeError, errors.MaxTextSizeError)
    deepEqual(fromPuppeteer.SyntaxError, errors.SyntaxError)
    deepEqual(fromPuppeteer.TimeoutError, errors.TimeoutError)
    deepEqual(fromPuppeteer.MaxTextSizeError, errors.MaxTextSizeError)
  })
})
