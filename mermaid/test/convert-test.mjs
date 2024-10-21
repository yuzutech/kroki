'use strict'

// must be declared first
import { logger } from '../src/logger.js'

import { describe, it } from 'node:test'
import puppeteer from 'puppeteer'
import pngjs from 'pngjs'
import { Worker } from '../src/worker.js'
import Task from '../src/task.js'
import { deepEqual, fail } from 'node:assert'
import * as fs from 'node:fs/promises'

const PNG = pngjs.PNG

const svgTests = [
  { content: 'Hello<br/>World' },
  { content: 'Hello<br>World' },
  { content: 'Hello<br >World' },
  { content: 'Hello<br />World' },
  { content: 'Hello\\nWorld' }
]

const pngTests = [
  {
    type: 'graph', width: 178, height: 168, content: `graph TD
  A --> B
  C{{test}} --> D[(db)]
  A --> D`
  },
  {
    type: 'sequence', width: 504, height: 387, content: `sequenceDiagram
  Alice->>+John: Hello John, how are you?
  Alice->>+John: John, can you hear me?
  John-->>-Alice: Hi Alice, I can hear you!
  John-->>-Alice: I feel great!`
  }
]

const invalidSyntaxTests = [
  { endpoint: 'svg', isPng: false },
  { endpoint: 'png', isPng: true }
]

async function getBrowser () {
  return puppeteer.launch({
    args: [
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-initial-navigation',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--allow-file-access-from-files'
    ]
  })
}

describe('#convert', function () {
  svgTests.forEach((testCase) => {
    it(`should return an XML compatible SVG with content: ${testCase.content}`, async function () {
      const browser = await getBrowser()
      try {
        const worker = new Worker(browser)
        const result = await worker.convert(new Task(`graph TD
  A{{ ${testCase.content} }}`))
        deepEqual(result.includes('<span class="nodeLabel">Hello<br/>World</span>'), true, 'output must include XML compatible SVG')
      } finally {
        await browser.close()
      }
    })
  })

  pngTests.forEach((testCase) => {
    it(`should return a PNG for type ${testCase.type} with height=${testCase.height}, width=${testCase.width}`, async function () {
      const browser = await getBrowser()
      try {
        const worker = new Worker(browser)
        const result = await worker.convert(new Task(testCase.content, true))
        await fs.writeFile('./out.png', result)
        const image = PNG.sync.read(result) // this will fail on invalid image
        const expectedWidth = testCase.width
        const widthDelta = 30
        const actualWidth = image.width
        deepEqual(expectedWidth - widthDelta < actualWidth && actualWidth < expectedWidth + widthDelta, true, `width must be close to ${expectedWidth} +/- ${widthDelta} but was ${actualWidth}`)
        const expectedHeight = testCase.height
        const heightDelta = 50
        const actualHeight = image.height
        deepEqual(expectedHeight - heightDelta < actualHeight && actualHeight < expectedHeight + heightDelta, true, `height must be close to ${expectedHeight} +/- ${heightDelta}`)  // padding can make it vary more
      } finally {
        await browser.close()
      }
    })
  })

  invalidSyntaxTests.forEach((testCase) => {
    it(`should throw syntax error in endpoint /${testCase.endpoint}`, async function () {
      const browser = await getBrowser()
      try {
        await new Worker(browser).convert(new Task('not a valid mermaid code', testCase.isPng))
        fail('Should throw a SyntaxError exception')
      } catch (err) {
        deepEqual(err.message.startsWith('Syntax error in graph:'), true, 'error message should starts with \'Syntax error in graph:\'')
      } finally {
        await browser.close()
      }
    })
  })

  it('should properly handle <> characters', async () => {
    `sequenceDiagram
    rect rgba(200, 150, 255, 0.2)
    participant John
    Note over John: Text in <<note>>
    end`
    const browser = await getBrowser()
    try {
      const worker = new Worker(browser)
      const result = await worker.convert(new Task(`sequenceDiagram
  rect rgba(200, 150, 255, 0.2)
  participant John
  Note over John: Text in <<note>>
end`))
      deepEqual(result.includes('Text in &lt;&lt;note&gt;&gt;'), true, `result must include Text in &lt;&lt;note&gt;&gt; but was ${result}`)
    } finally {
      await browser.close()
    }
  })
})
