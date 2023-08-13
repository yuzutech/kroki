import chai from 'chai'
import chaiHttp from 'chai-http'
import fs from 'node:fs'
import * as url from 'url'
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
  { engine: 'symbolator', file: 'component.sv', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'erd', file: 'schema.erd', options: {}, outputFormat: ['svg'] },
  { engine: 'mermaid', file: 'contribute.mmd', options: {}, outputFormat: ['svg'] },
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
  { engine: 'diagramsnet', file: 'diagramsnet-infography.xml', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'diagramsnet', file: 'diagramsnet-mindmap.xml', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'diagramsnet', file: 'diagramsnet-network.xml', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'diagramsnet', file: 'diagramsnet-ui.xml', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'diagramsnet', file: 'diagramsnet-venn.xml', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'diagramsnet', file: 'diagramsnet-infography.xml', options: { id: 'foo' }, outputFormat: ['svg', 'png'] },
  { engine: 'd2', file: 'connections.d2', options: {}, outputFormat: ['svg'] },
  { engine: 'd2', file: 'connections.d2', options: { layout: 'elk' }, outputFormat: ['svg'] },
  { engine: 'd2', file: 'connections.d2', options: { sketch: 'true' }, outputFormat: ['svg'] },
  { engine: 'wireviz', file: 'wireviz.yaml', options: {}, outputFormat: ['svg', 'png'] },
  { engine: 'tikz', file: 'periodic-table.tex', options: {}, outputFormat: ['jpeg', 'pdf', 'png', 'svg'] }
]

chai.use(chaiHttp)

const expect = chai.expect

const mimeType = {
  svg: 'image/svg+xml',
  png: 'image/png',
  pdf: 'application/pdf',
  jpeg: 'image/jpeg',
  txt: 'text/plain'
}

const sendRequest = async (testCase, outputFormat) => {
  try {
    let request = chai.request('localhost:8000')
      .post(`/${testCase.engine}/${outputFormat}`)
      .type('text/plain')
      .set('Content-Type', 'text/plain')
      .set('Accept', mimeType[outputFormat])
      .timeout(10000)
      .send(fs.readFileSync(`${__dirname}/diagrams/${testCase.file}`))

    for (var key in testCase.options) {
      request = request.set(`Kroki-Diagram-Options-${key}`, testCase.options[key])
    }

    return await request
  } catch (err) {
    console.error('error:', err)
    throw err
  }
}

describe('Diagrams', function () {
  this.timeout(15000)
  tests.forEach((testCase) => {
    testCase.outputFormat.forEach(outputFormat => {
      it(`${testCase.engine}/${outputFormat} with options ${JSON.stringify(testCase.options)} should answer with HTTP 200`, async () => {
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

describe('PlantUML native image', function () {
  this.timeout(15000)
  it('plantuml (native image) should convert class diagram (issue#1546)', async () => {
    const testCase = { engine: 'plantuml', file: 'class.puml' }
    const response = await sendRequest(testCase, 'svg')
    try {
      expect(response.status).to.equal(200)
    } catch (err) {
      console.log('response:', response.text)
      throw err
    }
  })
})

describe('CJK font', function () {
  this.timeout(15000)
  it('plantuml should compute correct text length (issue#574)', async () => {
    const testCase = { engine: 'plantuml', file: 'chinese.puml' }
    const response = await sendRequest(testCase, 'svg')
    try {
      expect(response.body.toString('utf8')).to.include('textLength="56"')
    } catch (err) {
      console.log('response:', response.text)
      throw err
    }
  })
  it('mermaid should compute correct text length (issue#1167)', async () => {
    const testCase = { engine: 'mermaid', file: 'japanese.mermaid' }
    const response = await sendRequest(testCase, 'svg')
    try {
      const data = response.body.toString('utf8')
      const boxWidthRegex = /(?<=<foreignObject.*?width="([0-9.]+)".*?)<span class="nodeLabel">ううううううう<\/span>/
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
