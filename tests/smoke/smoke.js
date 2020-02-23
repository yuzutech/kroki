const tests = [
  { engine: 'graphviz', file: 'hello.dot' },
  { engine: 'blockdiag', file: 'kroki.diag' },
  { engine: 'seqdiag', file: 'sequence.diag' },
  { engine: 'actdiag', file: 'actions.diag'},
  { engine: 'nwdiag', file: 'network.diag'},
  { engine: 'c4plantuml', file: 'banking-system.puml'},
  { engine: 'ditaa', file: 'components.ditaa'},
  { engine: 'erd', file: 'schema.erd'},
  { engine: 'mermaid', file: 'contribute.mmd'},
  { engine: 'plantuml', file: 'architecture.puml'},
  { engine: 'svgbob', file: 'cloud.bob'},
  { engine: 'nomnoml', file: 'pirate.nomnoml'},
  { engine: 'packetdiag', file: 'packet.diag' },
  { engine: 'rackdiag', file: 'rack.diag' },
  { engine: 'vega', file: 'bar-chart.vega' },
]

const chai = require('chai')
const chaiHttp = require('chai-http')
const fs = require('fs')

chai.use(chaiHttp)

const expect = chai.expect

const sendRequest = async (testCase) => {
  try {
    return await chai.request('localhost:8000')
      .post(`/${testCase.engine}/svg`)
      .type('text/plain')
      .set('Content-Type', 'text/plain')
      .set('Accept', 'image/svg+xml')
      .send(fs.readFileSync(`${__dirname}/diagrams/${testCase.file}`))
  } catch (err) {
    console.error('error:', err)
    throw err
  }
}

tests.forEach((testCase) => {
  it(`${testCase.engine} should answer with HTTP 200`, async function() {
    const response = await sendRequest(testCase)
    try {
      expect(response.status).to.equal(200)
    } catch (err) {
      console.log('response:', response.text)
      throw err;
    }
  })
})
