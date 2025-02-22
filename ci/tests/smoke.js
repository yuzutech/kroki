import { describe, it } from 'node:test'
import { deepEqual } from 'node:assert'
import fs from 'node:fs/promises'
import * as url from 'node:url'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const tests = [
  { engine: 'graphviz', file: 'hello.dot', options: {}, outputFormat: ['svg', 'jpeg'] },
  { engine: 'dot', file: 'hello.dot', options: {}, outputFormat: ['svg', 'jpeg'] },
  { engine: 'blockdiag', file: 'kroki.diag', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'seqdiag', file: 'sequence.diag', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'actdiag', file: 'actions.diag', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'nwdiag', file: 'network.diag', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'c4plantuml', file: 'banking-system.puml', options: {}, outputFormat: ['svg', 'pdf', 'png', 'txt'] },
  { engine: 'dbml', file: 'dbml.dbml', options: {}, outputFormat: ['svg'] },
  { engine: 'ditaa', file: 'components.ditaa', options: {}, outputFormat: ['svg'] },
  { engine: 'ditaa', file: 'components.ditaa', options: {scale: '0.7'}, outputFormat: ['svg'] },
  { engine: 'symbolator', file: 'component.sv', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'erd', file: 'schema.erd', options: {}, outputFormat: ['svg'] },
  { engine: 'mermaid', file: 'contribute.mmd', options: {}, outputFormat: ['svg'] },
  { engine: 'mermaid', file: 'empty-message.mmd', options: {}, outputFormat: ['svg'] },
  { engine: 'bpmn', file: 'example.bpmn', options: {}, outputFormat: ['svg'] },
  { engine: 'plantuml', file: 'architecture.puml', options: {}, outputFormat: ['svg', 'pdf', 'png', 'txt'] },
  { engine: 'plantuml', file: 'architecture.puml', options: { 'no-metadata': 'true' }, outputFormat: ['svg', 'png'] },
  { engine: 'svgbob', file: 'cloud.bob', options: {}, outputFormat: ['svg'] },
  { engine: 'nomnoml', file: 'pirate.nomnoml', options: {}, outputFormat: ['svg'] },
  { engine: 'packetdiag', file: 'packet.diag', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'rackdiag', file: 'rack.diag', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'vega', file: 'bar-chart.vega', options: {}, outputFormat: ['svg', 'png', 'pdf'] },
  { engine: 'vegalite', file: 'discretizing-scale.vlite', options: {}, outputFormat: ['svg', 'png', 'pdf'] },
  { engine: 'wavedrom', file: 'wavedrom.json5', options: {}, outputFormat: ['svg'] },
  { engine: 'wavedrom', file: 'bitfield.json5', options: {}, outputFormat: ['svg'] },
  { engine: 'bytefield', file: 'bytefield.bf', options: {}, outputFormat: ['svg'] },
  { engine: 'umlet', file: 'umlet.xml', options: {}, outputFormat: ['svg'] },
  { engine: 'excalidraw', file: 'venn.excalidraw', options: {}, outputFormat: ['svg'] },
  { engine: 'pikchr', file: 'sqlite-architecture.pikchr', options: {}, outputFormat: ['svg'] },
  { engine: 'structurizr', file: 'gettingstarted.structurizr', options: {}, outputFormat: ['svg'] },
  { engine: 'structurizr', file: 'gettingstarted.structurizr', options: { output: 'legend' }, outputFormat: ['svg'] },
  { engine: 'diagramsnet', file: 'diagramsnet-infography.xml', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'diagramsnet', file: 'diagramsnet-mindmap.xml', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'diagramsnet', file: 'diagramsnet-network.xml', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'diagramsnet', file: 'diagramsnet-ui.xml', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'diagramsnet', file: 'diagramsnet-venn.xml', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'diagramsnet', file: 'diagramsnet-infography.xml', options: { id: 'foo' }, outputFormat: ['svg', 'png'] },
  { engine: 'd2', file: 'connections.d2', options: {}, outputFormat: ['svg'] },
  { engine: 'd2', file: 'connections.d2', options: { layout: 'elk' }, outputFormat: ['svg'] },
  { engine: 'd2', file: 'connections.d2', options: { theme: '200' }, outputFormat: ['svg'] },
  { engine: 'd2', file: 'connections.d2', options: { pad: '50' }, outputFormat: ['svg'] },
  { engine: 'd2', file: 'connections.d2', options: { 'animate-interval': '50' }, outputFormat: ['svg'] },
  { engine: 'd2', file: 'connections.d2', options: { sketch: 'true' }, outputFormat: ['svg'] },
  { engine: 'd2', file: 'connections.d2', options: { scale: '1' }, outputFormat: ['svg'] },
  { engine: 'wireviz', file: 'wireviz.yaml', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'tikz', file: 'periodic-table.tex', options: {}, outputFormat: ['jpeg', 'pdf', 'png', 'svg'] }
]

const mimeType = {
  svg: 'image/svg+xml',
  png: 'image/png',
  pdf: 'application/pdf',
  jpeg: 'image/jpeg',
  txt: 'text/plain'
}

async function sendRequest (testCase, outputFormat) {
  try {
    const headers = {
      'Content-Type': 'text/plain',
      'Accept': mimeType[outputFormat]
    }
    for (const key in testCase.options) {
      headers[`Kroki-Diagram-Options-${key}`] = testCase.options[key]
    }
    const body = await fs.readFile(`${__dirname}/diagrams/${testCase.file}`, 'utf8')
    return fetch(`http://localhost:8000/${testCase.engine}/${outputFormat}`, {
      body: body,
      method: 'POST',
      headers: headers
    })
  } catch (err) {
    console.error('error:', err)
    throw err
  }
}

describe('Diagrams', function () {
  tests.forEach((testCase) => {
    testCase.outputFormat.forEach(outputFormat => {
      it(`${testCase.engine}/${outputFormat} with options ${JSON.stringify(testCase.options)} should answer with HTTP 200`, async () => {
        const response = await sendRequest(testCase, outputFormat)
        try {
          deepEqual(response.status, 200, `status code must be 200 but was: ${response.status}`)
        } catch (err) {
          const textResponse = await response.text()
          const textResponseOutput = outputFormat !== 'svg'
            ? textResponse.substring(0, 50) + '[truncated...]'
            : textResponse
          console.log('response:', textResponseOutput)
          throw err
        }
      })
    })
  })
})

describe('PlantUML native image', function () {
  it('plantuml (native image) should convert class diagram (issue#1546)', async () => {
    const testCase = { engine: 'plantuml', file: 'class.puml' }
    const response = await sendRequest(testCase, 'svg')
    try {
      deepEqual(response.status, 200, `status code must be 200 but was: ${response.status}`)
    } catch (err) {
      const textResponse = await response.text()
      console.log('response:', textResponse)
      throw err
    }
  })
})

describe('CJK font', function () {
  it('plantuml should compute correct text length (issue#574)', async () => {
    const testCase = { engine: 'plantuml', file: 'chinese.puml' }
    const response = await sendRequest(testCase, 'svg')
    const textResponse = await response.text()
    try {
      deepEqual(textResponse.includes('textLength="55.9'), true, `text response must include textLength="55.9 in: ${textResponse}`)
    } catch (err) {
      console.log('response:', textResponse)
      throw err
    }
  })
  it('mermaid should compute correct text length (issue#1167)', async () => {
    const testCase = { engine: 'mermaid', file: 'japanese.mermaid' }
    const response = await sendRequest(testCase, 'svg')
    const textResponse = await response.text()
    try {
      const boxWidthRegex = /(?<=<foreignObject.*?width="([0-9.]+)".*?)<span class="nodeLabel"><p>ううううううう<\/p><\/span>/
      deepEqual(boxWidthRegex.test(textResponse), true, `text response must include <foreignObject> tag with a width attribute but could not find this tag in: ${textResponse}`)
      const match = textResponse.match(boxWidthRegex)
      deepEqual(parseInt(match[1]) > 110, true, 'width must be greater than 110')
    } catch (err) {
      console.log('response:', textResponse)
      throw err
    }
  })
})

describe('Health', function () {
  ;['/health', '/healthz', '/v1/health'].forEach((endpoint) => {
    it(`should return health status from ${endpoint}`, async () => {
      const response = await fetch(`http://localhost:8000/${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/health+json'
        }
      })
      const jsonResponse = await response.json()
      try {
        deepEqual(response.status, 200, `status code must be 200 but was: ${response.status}`)
        deepEqual(jsonResponse.status, 'pass', `JSON response must have a status attribute with the value pass but was: ${JSON.stringify(jsonResponse)}`)
        const engines = Array.from(new Set(tests.map((it) => it.engine)))
        engines.push('kroki')
        engines.sort()
        const actual = Object.keys(jsonResponse.version).sort()
        deepEqual(actual, engines, `JSON response must include all engines`)
      } catch (err) {
        console.log('response:', jsonResponse)
        throw err
      }
    })
  })
})
