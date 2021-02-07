const tests = [
  {engine: 'graphviz', file: 'hello.dot', outputFormat: ['svg']},
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
  {engine: 'bytefield', file: 'bytefield.bf', outputFormat: ['svg']},
  {engine: 'umlet', file: 'umlet.xml', outputFormat: ['svg']},
  {engine: 'excalidraw', file: 'venn.excalidraw', outputFormat: ['svg']}
]

const chai = require('chai')
const chaiHttp = require('chai-http')
const fs = require('fs')

chai.use(chaiHttp)

const expect = chai.expect

const mimeType = {
  svg: 'image/svg+xml',
  png: 'image/png',
  pdf: 'application/pdf'
}

const sendRequest = async (testCase, outputFormat) => {
  try {
    return await chai.request('localhost:8000')
      .post(`/${testCase.engine}/${outputFormat}`)
      .type('text/plain')
      .set('Content-Type', 'text/plain')
      .set('Accept', mimeType[outputFormat])
      .send(fs.readFileSync(`${__dirname}/diagrams/${testCase.file}`))
  } catch (err) {
    console.error('error:', err)
    throw err
  }
}

describe('Diagrams', () => {
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

describe('Chinese font', () => {
  it(`plantuml should compute correct text length (issue#574)`, async () => {
    const testCase = {engine: 'plantuml', file: 'chinese.puml'}
    const response = await sendRequest(testCase, 'svg')
    try {
      expect(response.body.toString('utf8')).to.include('textLength="56"')
    } catch (err) {
      console.log('response:', response.text)
      throw err
    }
  })
})

describe('Health', () => {
  ['/health', '/healthz', '/v1/health'].forEach((endpoint) => {
    it(`should return health status from ${endpoint}`, async () => {
      const response = await chai.request('localhost:8000')
        .get(endpoint)
        .set('Accept', 'application/health+json')
        .send()

      try {
        expect(response.status).to.equal(200)
        expect(response.body.status).to.equal('pass')
        const engines = tests.map((it) => it.engine)
        engines.push('kroki')
        expect(response.body.version).to.have.keys(engines)
      } catch (err) {
        console.log('response:', response.text)
        throw err
      }
    })
  })
})
