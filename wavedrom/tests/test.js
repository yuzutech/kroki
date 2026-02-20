const { describe, it } = require('node:test')
const fsp = require('node:fs/promises')
const assert = require('node:assert')
const { join } = require('node:path')
const { convert } = require('../convert.js')

describe('wavedrom', () => {
  it('should use narrow skin', async () => {
    const result = convert(`{"signal": [
  { "name": "clock",  "wave": "p.........." }
], "config":{"skin": "narrow"}}`)

    const narrowSkin = await fsp.readFile(join(__dirname, 'narrow.svg'), 'utf-8')
    assert.deepEqual(result, narrowSkin.trim())
  })

  it('should use default skin', async () => {
    const result = convert(`{"signal": [
  { "name": "clock",  "wave": "p.........." }
]}`)

    const defaultSkin = await fsp.readFile(join(__dirname, 'default.svg'), 'utf-8')
    assert.deepEqual(result, defaultSkin.trim())
  })
})
