/* global describe, it */
'use strict'

const puppeteer = require('puppeteer')
const chai = require('chai')
const expect = chai.expect
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)

const Worker = require('../src/worker.js')
const Task = require('../src/task.js')

const tests = [
  {content: 'Hello<br/>World'},
  {content: 'Hello<br>World'},
  {content: 'Hello<br >World'},
  {content: 'Hello<br />World'},
]

describe('#convert', function () {

  // Puppeteer can take some time to start
  this.timeout(10000)

  tests.forEach((testCase) => {
    it(`should return an XML compatible SVG with content: ${testCase.content}`, async function () {
      const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
      try {
        const worker = new Worker(browser)
        const result = await worker.convert(new Task(`graph TD
  A{{ ${testCase.content} }}`))
        expect(result).to.contains('<div xmlns="http://www.w3.org/1999/xhtml" style="display: inline-block; white-space: nowrap;">Hello<br />World</div>')
      } finally {
        await browser.close()
      }
    })
  })
})
