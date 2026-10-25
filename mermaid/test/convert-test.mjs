'use strict'

// must be declared first
import { logger } from '../src/logger.js'

import { describe, it } from 'node:test'
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
    type: 'graph', width: 436, height: 228, content: `graph TD
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

  // ELK is now bundled with mermaid and is the default layout algorithm.
  const alternateLayouts = ['dagre', 'tidy-tree']
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
        // when a layout is not registered, mermaid silently falls back to the default layout
        // and produces the same SVG
        deepEqual(layoutSvg.toString('utf8') !== defaultSvg.toString('utf8'), true, `the ${layout} layout must produce a different SVG than the default layout (elk), the layout loader is probably not registered`)
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

describe('#convert with the flatten-svg option', function () {
  async function convertWith (source, { isPng = false, option, flattenSvg = false } = {}) {
    const browser = await getBrowser()
    try {
      const worker = new Worker(browser)
      // KROKI_MERMAID_FLATTEN_SVG default
      worker.flattenSvg = flattenSvg
      const config = new URLSearchParams()
      if (option !== undefined) config.set('flatten-svg', option)
      return await worker.convert(new Task(source, isPng), config)
    } finally {
      await browser.close()
    }
  }

  function convertFlat (source, isPng = false) {
    return convertWith(source, { isPng, option: 'true' })
  }

  it('should return SVG without HTML labels, style sheets or em units', async function () {
    const result = await convertFlat(`graph TD
  A[Hello] -->|link| B{World}`)
    deepEqual(result.includes('<foreignObject'), false, `output must not include <foreignObject> but was: ${result}`)
    deepEqual(result.includes('<style'), false, `output must not include <style> but was: ${result}`)
    deepEqual(/hsl\(/.test(result), false, `output must not include hsl() colors but was: ${result}`)
    deepEqual(/="[-\d.]+em"/.test(result), false, `output must not include em units but was: ${result}`)
    deepEqual(/<text[^>]*>(<tspan[^>]*>)*Hello</.test(result), true, `output must include Hello as SVG text but was: ${result}`)
  })

  it('should inline computed colors as presentation attributes', async function () {
    const result = await convertFlat(`graph TD
  A[Start]:::red
  classDef red fill:#f96,stroke:#c00`)
    deepEqual(result.includes('fill="#ff9966"'), true, `output must include fill="#ff9966" but was: ${result}`)
    deepEqual(result.includes('stroke="#cc0000"'), true, `output must include stroke="#cc0000" but was: ${result}`)
  })

  it('should merge per-word tspans so words are not anchored separately', async function () {
    const result = await convertFlat(`stateDiagram-v2
  A --> B : valid signature`)
    deepEqual(result.includes('>valid signature<'), true, `output must include the label as one run but was: ${result}`)
  })

  it('should leave PNG output unchanged', async function () {
    const result = await convertFlat('graph TD\n  A --> B', true)
    deepEqual(result.subarray(1, 4).toString(), 'PNG', 'output must be a PNG')
  })

  it('should flatten when the option is an empty flag', async function () {
    const result = await convertWith('graph TD\n  A --> B', { option: '' })
    deepEqual(result.includes('<style'), false, `output must not include <style> but was: ${result}`)
  })

  it('should not flatten without the option', async function () {
    const result = await convertWith('graph TD\n  A --> B')
    deepEqual(result.includes('<style'), true, `output must include <style> but was: ${result}`)
  })

  it('should use KROKI_MERMAID_FLATTEN_SVG as the default', async function () {
    const result = await convertWith('graph TD\n  A --> B', { flattenSvg: true })
    deepEqual(result.includes('<style'), false, `output must not include <style> but was: ${result}`)
  })

  it('should not flatten when the option is false, whatever the default', async function () {
    const result = await convertWith('graph TD\n  A --> B', { option: 'false', flattenSvg: true })
    deepEqual(result.includes('<style'), true, `output must include <style> but was: ${result}`)
  })
})
