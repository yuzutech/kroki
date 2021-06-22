/* global describe, it */
'use strict'

const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)

const { convert } = require('../src/convert.js')

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
      expect.fail('', '', 'It should throw an error in secure mode when the Vega-Lite specification contains data.url')
    } catch (err) {
      expect(err.name).to.equal('UnsafeIncludeError')
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
      expect.fail('', '', 'It should throw an error when output format is not supported')
    } catch (err) {
      expect(err.name).to.equal('IllegalArgumentError')
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
      expect(result).to.includes('<svg xmlns="http://www.w3.org/2000/svg"')
      expect(result).to.includes('</svg>')
      const stdoutWriteCalls = process.stdout.write.getCalls()
      const stderrWriteCalls = process.stderr.write.getCalls()
      expect(stdoutWriteCalls).to.be.empty(`It should not output warning messages to stdout but process.stdout.write('${stdoutWriteCalls && stdoutWriteCalls[0] && stdoutWriteCalls[0].args.join(' ')}') was called`)
      expect(stderrWriteCalls).to.be.empty(`It should not output warning messages to stderr but process.stderr.write('${stderrWriteCalls && stderrWriteCalls[0] && stderrWriteCalls[0].args.join(' ')}') was called`)
    } finally {
      process.stdout.write.restore()
      process.stderr.write.restore()
    }
  })
})
