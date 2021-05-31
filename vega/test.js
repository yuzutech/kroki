/* global describe, it */
'use strict'

const sinon = require('sinon')
const chai = require('chai')
const expect = chai.expect
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)

const { convert } = require('./convert.js')

describe('#convert', function () {
  it('should not output warning to stdout', async function () {
    sinon.stub(process.stdout, 'write')
    sinon.stub(process.stderr, 'write')
    try {
      const source = `{
  "mark": "rect",
  "encoding": {
    "x": {"value": 1},
    "text": {"value":"foo"}
  }
}`
      const result = await convert(source, {
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
