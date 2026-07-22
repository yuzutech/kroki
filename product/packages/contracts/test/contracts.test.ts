import assert from "node:assert/strict";
import test from "node:test";

import {
  DEFAULT_OUTPUT_FORMAT,
  canonicalDiagramEngine,
  detectDiagramEngine,
  isDiagramEngine,
  outputContentType,
  rendererDiagramEngine,
} from "../src/index.ts";

test("maps supported source extensions to canonical engines", () => {
  assert.equal(detectDiagramEngine("payment-flow.mmd"), "mermaid");
  assert.equal(detectDiagramEngine("architecture.puml"), "plantuml");
  assert.equal(detectDiagramEngine("architecture.plantuml"), "plantuml");
  assert.equal(detectDiagramEngine("dependencies.dot"), "graphviz");
  assert.equal(detectDiagramEngine("system.d2"), "d2");
  assert.equal(detectDiagramEngine("README.md"), undefined);
});

test("recognizes OpenAPI engine aliases and canonicalizes them", () => {
  assert.equal(isDiagramEngine("c4plantuml"), true);
  assert.equal(isDiagramEngine("dot"), true);
  assert.equal(isDiagramEngine("bpmn"), false);
  assert.equal(canonicalDiagramEngine("c4plantuml"), "plantuml");
  assert.equal(canonicalDiagramEngine("dot"), "graphviz");
  assert.equal(rendererDiagramEngine("dot"), "graphviz");
});

test("exposes the output formats defined by the API contract", () => {
  assert.equal(DEFAULT_OUTPUT_FORMAT, "svg");
  assert.equal(outputContentType("svg"), "image/svg+xml");
  assert.equal(outputContentType("png"), "image/png");
});
