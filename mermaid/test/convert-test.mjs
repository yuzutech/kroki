'use strict'

// must be declared first
import { logger } from '../src/logger.js'

import { describe, it, after } from 'node:test'
import puppeteer from 'puppeteer'
import pngjs from 'pngjs'
import { Worker } from '../src/worker.js'
import Task from '../src/task.js'
import { deepEqual, fail } from 'node:assert'

const PNG = pngjs.PNG

const svgTests = [
  { content: 'Hello<br/>World' },
  { content: 'Hello<br>World' },
  { content: 'Hello<br >World' },
  { content: 'Hello<br />World' },
  { content: `Hello\nWorld`}
]

const pngTests = [
  {
    type: 'graph', width: 210, height: 170, content: `graph TD
  A --> B
  C{{test}} --> D[(db)]
  A --> D`
  },
  {
    type: 'sequence', width: 480, height: 355, content: `sequenceDiagram
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
        const source = `graph TD
  A{{ ${testCase.content} }}`
        const result = await worker.convert(new Task(source))
        deepEqual(result.includes('<span class="nodeLabel"><p>Hello<br/>World</p></span>'), true, `output must include XML compatible SVG but was: ${result}`)
      } finally {
        await browser.close()
      }
    })
  })

  it(`should accept sequence diagram with an empty message`, async function () {
    const browser = await getBrowser()
    try {
      const worker = new Worker(browser)
      const source = `sequenceDiagram
    Alice->>John: Hello
    John-->>Alice: 
`
      const result = await worker.convert(new Task(source))
      deepEqual(result.includes('<tspan x="75" dy="0">Alice</tspan>'), true, `output must include Alice but was: ${result}`)
    } finally {
      await browser.close()
    }
  })

  pngTests.forEach((testCase) => {
    it(`should return a PNG for type ${testCase.type} with height=${testCase.height}, width=${testCase.width}`, async function () {
      const browser = await getBrowser()
      try {
        const worker = new Worker(browser)
        const result = await worker.convert(new Task(testCase.content, true))
        const image = PNG.sync.read(result) // this will fail on invalid image
        const expectedWidth = testCase.width
        const widthDelta = 20
        const actualWidth = image.width
        deepEqual(expectedWidth - widthDelta < actualWidth && actualWidth < expectedWidth + widthDelta, true, `width must be close to ${expectedWidth} +/- ${widthDelta} but was ${actualWidth}`)
        const expectedHeight = testCase.height
        const heightDelta = 20
        const actualHeight = image.height
        deepEqual(expectedHeight - heightDelta < actualHeight && actualHeight < expectedHeight + heightDelta, true, `height must be close to ${expectedHeight} +/- ${heightDelta} but was ${actualHeight}`)  // padding can make it vary more
      } finally {
        await browser.close()
      }
    })
  })

  const alternateLayouts = ['elk', 'tidy-tree']
  alternateLayouts.forEach((layout) => {
    it(`should render a flowchart with the ${layout} layout`, async function () {
      const browser = await getBrowser()
      try {
        const worker = new Worker(browser)
        const source = `graph TD
  A --> B
  A --> C
  B --> D
  C --> D`
        const defaultSvg = await worker.convert(new Task(source))
        const layoutSvg = await worker.convert(new Task(`---
config:
  layout: ${layout}
---
${source}`))
        // when a layout is not registered, mermaid silently falls back to dagre
        // and produces the same SVG as the default layout
        deepEqual(layoutSvg !== defaultSvg, true, `the ${layout} layout must produce a different SVG than the default layout (dagre), the layout loader is probably not registered`)
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
        deepEqual(err.name, 'SyntaxError')
      } finally {
        await browser.close()
      }
    })
  })

  it('should throw MaxTextSizeError when the source exceeds maxTextSize', async function () {
    // Oversized source is rejected up front, before connecting to a browser:
    // mermaid would otherwise resolve with an error *image* (HTTP 200).
    const source = `graph TD\n${'A-->B\n'.repeat(10000)}` // > 50000 chars
    try {
      await new Worker().convert(new Task(source))
      fail('Should throw a MaxTextSizeError exception')
    } catch (err) {
      deepEqual(err.name, 'MaxTextSizeError')
    }
  })

  invalidSyntaxTests.forEach((testCase) => {
    it(`should throw syntax error when exceeding the edge limit in endpoint /${testCase.endpoint}`, async function () {
      // The default maxEdges is 500 and cannot be raised per request (see config.js).
      // mermaid throws on this one (unlike maxTextSize), so it surfaces as a SyntaxError.
      const edges = Array.from({ length: 600 }, (_, i) => `n${i}-->n${i + 1}`).join('\n')
      const source = `graph TD\n${edges}`
      const browser = await getBrowser()
      try {
        await new Worker(browser).convert(new Task(source, testCase.isPng))
        fail('Should throw a SyntaxError exception')
      } catch (err) {
        deepEqual(err.name, 'SyntaxError')
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
