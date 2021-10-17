/* global describe, it */
'use strict'

const puppeteer = require('puppeteer')
const chai = require('chai')
const expect = chai.expect
const dirtyChai = require('dirty-chai')
chai.use(dirtyChai)

// image comparison
const fs = require('fs')
const PNG = require('pngjs').PNG
const pixelmatch = require('pixelmatch')

const Worker = require('../src/worker.js')
const Task = require('../src/task.js')

const svgTests = [
  {content: 'Hello<br/>World'},
  {content: 'Hello<br>World'},
  {content: 'Hello<br >World'},
  {content: 'Hello<br />World'},
]

const pngTests = [
  {img: 'graph.png', content: `graph TD
  A --> B
  C{{test}} --> D[(db)]
  A --> D`},
  {img: 'seq.png', content: `sequenceDiagram
  Alice->>+John: Hello John, how are you?
  Alice->>+John: John, can you hear me?
  John-->>-Alice: Hi Alice, I can hear you!
  John-->>-Alice: I feel great!`}
]

describe('#convert', function () {

  // Puppeteer can take some time to start
  this.timeout(10000)

  svgTests.forEach((testCase) => {
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

  pngTests.forEach((testCase) => {
    it(`should return a PNG equal to: ${testCase.img}`, async function () {
      const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
      try {
        const worker = new Worker(browser)
        const resultImage = await worker.convert(new Task(testCase.content, true)).then(PNG.sync.read);
        const {width, height} = resultImage;

        const expectedImage = PNG.sync.read(fs.readFileSync(`tests/${testCase.img}`));
        
        expect(width).to.eq(expectedImage.width);
        expect(height).to.eq(expectedImage.height);

        const diffImage = new PNG({width, height}); // new image with the pixels set to the difference
        const numOfDifferentPixels = pixelmatch(resultImage.data, expectedImage.data, diffImage.data, width, height, {threshold: 0.1})

        expect(numOfDifferentPixels).to.eq(0);
      } finally {
        await browser.close()
      }
    })
  })
})
