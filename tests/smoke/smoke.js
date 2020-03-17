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
  {engine: 'plantuml', file: 'architecture.puml', outputFormat: ['svg']},
  {engine: 'svgbob', file: 'cloud.bob', outputFormat: ['svg']},
  {engine: 'nomnoml', file: 'pirate.nomnoml', outputFormat: ['svg']},
  {engine: 'packetdiag', file: 'packet.diag', outputFormat: ['svg']},
  {engine: 'rackdiag', file: 'rack.diag', outputFormat: ['svg']},
  {engine: 'vega', file: 'bar-chart.vega', outputFormat: ['svg', 'png', 'pdf']},
  {engine: 'vegalite', file: 'discretizing-scale.vlite', outputFormat: ['svg', 'png', 'pdf']},
  {engine: 'wavedrom', file: 'wavedrom.json5', outputFormat: ['svg']},
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

tests.forEach((testCase) => {
  testCase.outputFormat.forEach(outputFormat => {
    it(`${testCase.engine}/${outputFormat} should answer with HTTP 200`, async function() {
      const response = await sendRequest(testCase, outputFormat)
      try {
        expect(response.status).to.equal(200)
      } catch (err) {
        console.log('response:', response.text)
        throw err;
      }
    })
  })
})
