'use strict'

import { describe, it } from 'node:test'

import { convert } from '../src/convert.js'
import sinon from 'sinon'
import { promises as fs } from 'node:fs'
import ospath from 'node:path'
import { deepEqual, fail } from 'node:assert'

const __dirname = import.meta.dirname

describe('#convert', function () {
  it('should throw UnsafeIncludeError in secure mode when the Vega-Lite specification contains data.url', async function () {
    const input = `{
  "data": {"url": "data/cars.json"},
  "mark": "point",
  "encoding": {
    "x": {"field": "Horsepower", "type": "quantitative"},
    "y": {"field": "Miles_per_Gallon", "type": "quantitative"}
  }
}`
    try {
      await convert(input, {
        specFormat: 'lite',
        safeMode: 'secure',
        format: 'svg'
      })
      fail('', '', 'It should throw an error in secure mode when the Vega-Lite specification contains data.url')
    } catch (err) {
      deepEqual(err.name, 'UnsafeIncludeError')
    }
  })
  it('should throw IllegalArgumentError when output format is not supported', async function () {
    const input = `{
  "data": {
    "values": "a\\n1\\n2\\n3\\n4",
    "format": {
      "type": "csv"
    }
  },
  "mark": "point",
  "encoding": {
    "y": {"field": "a", "type": "quantitative"}
  }
}`
    try {
      await convert(input, {
        specFormat: 'lite',
        safeMode: 'safe',
        format: 'txt'
      })
      fail('', '', 'It should throw an error when output format is not supported')
    } catch (err) {
      deepEqual(err.name, 'IllegalArgumentError')
    }
  })
  it('should not output warning to stdout', async function () {
    sinon.stub(process.stdout, 'write')
    sinon.stub(process.stderr, 'write')
    try {
      const input = `{
  "mark": "rect",
  "encoding": {
    "x": {"value": 1},
    "text": {"value":"foo"}
  }
}`
      const result = await convert(input, {
        specFormat: 'lite',
        safeMode: 'safe',
        format: 'svg'
      })
      deepEqual(result.includes('<svg xmlns="http://www.w3.org/2000/svg"'), true, 'generated SVG must include <svg> start tag')
      deepEqual(result.includes('</svg>'), true, 'generated SVG must include <svg> end tag')
      const stdoutWriteCalls = process.stdout.write.getCalls()
      const stderrWriteCalls = process.stderr.write.getCalls()
      deepEqual(stdoutWriteCalls.length === 0, true, `It should not output warning messages to stdout but process.stdout.write('${stdoutWriteCalls && stdoutWriteCalls[0] && stdoutWriteCalls[0].args.join(' ')}') was called`)
      deepEqual(stderrWriteCalls.length === 0, true, `It should not output warning messages to stderr but process.stderr.write('${stderrWriteCalls && stderrWriteCalls[0] && stderrWriteCalls[0].args.join(' ')}') was called`)
    } finally {
      process.stdout.write.restore()
      process.stderr.write.restore()
    }
  })
  it('should convert a Vega-Lite definition to PNG', async function () {
    const input = await fs.readFile(ospath.join(__dirname, 'fixtures', 'diag.vlite'), 'utf8')
    const pngBuffer = await convert(input, {
      specFormat: 'lite',
      safeMode: 'safe',
      format: 'png'
    })
    deepEqual(Buffer.byteLength(pngBuffer) > 20000, true, 'generated PNG image must be greater than 20000 bytes')
  })
  it('should convert a Vega-Lite definition to PDF', async function () {
    const input = await fs.readFile(ospath.join(__dirname, 'fixtures', 'diag.vlite'), 'utf8')
    const pdfBuffer = await convert(input, {
      specFormat: 'lite',
      safeMode: 'safe',
      format: 'pdf'
    })
    deepEqual(Buffer.byteLength(pdfBuffer) > 10000, true, 'generated PDF file must be greater than 10000 bytes')
    // REMIND: unable to strictly compare the PDF because it contains metadata! (more specifically the creation date!)
  })
  it('should convert a Vega-Lite definition to SVG', async function () {
    const input = await fs.readFile(ospath.join(__dirname, 'fixtures', 'diag.vlite'), 'utf8')
    const svg = await convert(input, {
      specFormat: 'lite',
      safeMode: 'safe',
      format: 'svg'
    })
    deepEqual(svg.length > 20000, true, 'generated SVG image must be greater than 20000 bytes')
  })
})
