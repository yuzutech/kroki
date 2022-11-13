import chai from 'chai'
import chaiHttp from 'chai-http'
import fs from 'node:fs'
import * as url from 'url'
const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const tests = [
  {engine: 'graphviz', file: 'hello.dot', outputFormat: ['svg', 'jpeg']},
  {engine: 'dot', file: 'hello.dot', outputFormat: ['svg', 'jpeg']},
  {engine: 'blockdiag', file: 'kroki.diag', outputFormat: ['svg']},
  {engine: 'seqdiag', file: 'sequence.diag', outputFormat: ['svg']},
  {engine: 'actdiag', file: 'actions.diag', outputFormat: ['svg']},
  {engine: 'nwdiag', file: 'network.diag', outputFormat: ['svg']},
  {engine: 'c4plantuml', file: 'banking-system.puml', outputFormat: ['svg']},
  {engine: 'ditaa', file: 'components.ditaa', outputFormat: ['svg']},
  {engine: 'erd', file: 'schema.erd', outputFormat: ['svg']},
  {engine: 'mermaid', file: 'contribute.mmd', outputFormat: ['svg']},
  {engine: 'bpmn', file: 'example.bpmn', outputFormat: ['svg']},
  {engine: 'plantuml', file: 'architecture.puml', outputFormat: ['svg']},
  {engine: 'svgbob', file: 'cloud.bob', outputFormat: ['svg']},
  {engine: 'nomnoml', file: 'pirate.nomnoml', outputFormat: ['svg']},
  {engine: 'packetdiag', file: 'packet.diag', outputFormat: ['svg']},
  {engine: 'rackdiag', file: 'rack.diag', outputFormat: ['svg']},
  {engine: 'vega', file: 'bar-chart.vega', outputFormat: ['svg', 'png', 'pdf']},
  {engine: 'vegalite', file: 'discretizing-scale.vlite', outputFormat: ['svg', 'png', 'pdf']},
  {engine: 'wavedrom', file: 'wavedrom.json5', outputFormat: ['svg']},
  {engine: 'wavedrom', file: 'bitfield.json5', outputFormat: ['svg']},
  {engine: 'bytefield', file: 'bytefield.bf', outputFormat: ['svg']},
  {engine: 'umlet', file: 'umlet.xml', outputFormat: ['svg']},
  {engine: 'excalidraw', file: 'venn.excalidraw', outputFormat: ['svg']},
  {engine: 'pikchr', file: 'sqlite-architecture.pikchr', outputFormat: ['svg']},
  {engine: 'structurizr', file: 'gettingstarted.structurizr', outputFormat: ['svg']},
  {engine: 'diagramsnet', file: 'diagramsnet-infography.xml', outputFormat: ['svg', 'png']},
  {engine: 'diagramsnet', file: 'diagramsnet-mindmap.xml', outputFormat: ['svg', 'png']},
  {engine: 'diagramsnet', file: 'diagramsnet-network.xml', outputFormat: ['svg', 'png']},
  {engine: 'diagramsnet', file: 'diagramsnet-ui.xml', outputFormat: ['svg', 'png']},
  {engine: 'diagramsnet', file: 'diagramsnet-venn.xml', outputFormat: ['svg', 'png']}
]

chai.use(chaiHttp)

const expect = chai.expect

const mimeType = {
  svg: 'image/svg+xml',
  png: 'image/png',
  pdf: 'application/pdf',
  jpeg: 'image/jpeg'
}

const sendRequest = async (testCase, outputFormat) => {
  try {
    return await chai.request('localhost:8000')
      .post(`/${testCase.engine}/${outputFormat}`)
      .type('text/plain')
      .set('Content-Type', 'text/plain')
      .set('Accept', mimeType[outputFormat])
      .timeout(10000)
      .send(fs.readFileSync(`${__dirname}/diagrams/${testCase.file}`))
  } catch (err) {
    console.error('error:', err)
    throw err
  }
}

describe('Diagrams', function () {
  this.timeout(15000)
  tests.forEach((testCase) => {
    testCase.outputFormat.forEach(outputFormat => {
      it(`${testCase.engine}/${outputFormat} should answer with HTTP 200`, async () => {
        const response = await sendRequest(testCase, outputFormat)
        try {
          expect(response.status).to.equal(200)
        } catch (err) {
          console.log('response:', response.text)
          throw err
        }
      })
    })
  })
})

describe('CJK font', function () {
  this.timeout(15000)
  it('plantuml should compute correct text length (issue#574)', async () => {
    const testCase = {engine: 'plantuml', file: 'chinese.puml'}
    const response = await sendRequest(testCase, 'svg')
    try {
      expect(response.body.toString('utf8')).to.include('textLength="56"')
    } catch (err) {
      console.log('response:', response.text)
      throw err
    }
  })
  it('mermaid should compute correct text length (issue#1167)', async () => {
    const testCase = {engine: 'mermaid', file: 'japanese.mermaid'}
    const response = await sendRequest(testCase, 'svg')
    try {
      const data = response.body.toString('utf8')
      const boxWidthRegex = /id="flowchart-B-5".*<foreignObject.*width="([0-9.]+)".*ううううううう<\/div><\/foreignObject>/
      expect(data).to.match(boxWidthRegex)
      const match = data.match(boxWidthRegex)
      expect(parseInt(match[1])).to.be.greaterThan(110)
    } catch (err) {
      console.log('response:', response.text)
      throw err
    }
  })
})


describe('Health', function () {
  this.timeout(15000)
  ;['/health', '/healthz', '/v1/health'].forEach((endpoint) => {
    it(`should return health status from ${endpoint}`, async () => {
      const response = await chai.request('localhost:8000')
        .get(endpoint)
        .set('Accept', 'application/health+json')
        .send()

      try {
        expect(response.status).to.equal(200)
        expect(response.body.status).to.equal('pass')
        const engines = Array.from(new Set(tests.map((it) => it.engine)))
        engines.push('kroki')
        expect(response.body.version).to.have.keys(engines)
      } catch (err) {
        console.log('response:', response.text)
        throw err
      }
    })
  })
})
