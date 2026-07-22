import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { effectiveRenderSettings, outputPathForSource, parseDiagramConfig } from "../src/index.ts";

const minimal = `
version: 1
sources:
  - docs/diagrams/**/*.mmd
  - docs/diagrams/**/*.puml
  - docs/diagrams/**/*.dot
output: docs/generated
`;

test("applies shared defaults without embedding endpoint or credentials", () => {
  const config = parseDiagramConfig(minimal);
  assert.deepEqual(config.defaults, { format: "svg", theme: "default" });
  assert.deepEqual(config.preview, { debounceMs: 400 });
  assert.deepEqual(config.render, { onSave: false });
  assert.equal("server" in config, false);
});

test("maps nested sources to one stable output path", () => {
  const config = parseDiagramConfig(minimal);
  assert.equal(
    outputPathForSource("docs/diagrams/payments/refund.mmd", config),
    "docs/generated/payments/refund.svg",
  );
  assert.equal(outputPathForSource("README.mmd", config), undefined);
  const rootOutput = parseDiagramConfig(minimal.replace("output: docs/generated", "output: ."));
  assert.equal(outputPathForSource("docs/diagrams/refund.mmd", rootOutput), "refund.svg");
});

test("applies per-engine format, theme, and renderer options", () => {
  const config = parseDiagramConfig(`${minimal}
engines:
  graphviz:
    format: png
    theme: dark
    options:
      layout: neato
`);
  assert.deepEqual(effectiveRenderSettings("docs/diagrams/a.dot", config), {
    format: "png",
    theme: "dark",
    options: { layout: "neato" },
  });
  assert.equal(outputPathForSource("docs/diagrams/a.dot", config), "docs/generated/a.png");
});

test("rejects endpoint fields, path traversal, and unsupported versions", () => {
  assert.throws(() => parseDiagramConfig(`${minimal}\nserver:\n  url: http://localhost:9000`), /Invalid diagram configuration/);
  assert.throws(() => parseDiagramConfig(`${minimal.replace("docs/generated", "../generated")}`), /Invalid diagram configuration/);
  assert.throws(() => parseDiagramConfig(`${minimal.replace("version: 1", "version: 2")}`), /Invalid diagram configuration/);
});

test("ships a Draft 2020-12 JSON schema for editor and CI validation", () => {
  const schema = JSON.parse(readFileSync(new URL("../schema/diagram-config.schema.json", import.meta.url), "utf8"));
  assert.equal(schema.$schema, "https://json-schema.org/draft/2020-12/schema");
  assert.deepEqual(schema.required, ["version", "sources", "output"]);
  assert.equal(schema.additionalProperties, false);
});
