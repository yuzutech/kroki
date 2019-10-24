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
  // { engine: 'nomnoml', file: 'pirate.nomnoml'},
];

const chai = require('chai');
const chaiHttp = require('chai-http');
const fs = require('fs');
const assert = require('assert');

chai.use(chaiHttp);

var expect = chai.expect;

tests.forEach((testCase) => {
  it(`${testCase.engine} should answer with HTTP 200`, function(done) {
    chai.request('localhost:8000')
      .post(`/${testCase.engine}/svg`)
      .type('text/plain')
      .set('Content-Type', 'text/plain')
      .set('Accept', 'image/svg+xml')
      .send(fs.readFileSync(`${__dirname}/diagrams/${testCase.file}`))
      .end((error, response) => {
        expect(error).to.be.null;
        expect(response).to.have.status(200);
        done(); 
      });
  });
});
