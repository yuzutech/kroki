import assert from "node:assert/strict";
import test from "node:test";

import { parseDiagramConfig } from "@diagram-as-code/diagram-config";

import { buildVerificationPlan, deterministicRequest, type FileChange } from "../src/core.ts";

const config = parseDiagramConfig(`
version: 1
sources:
  - docs/diagrams/**/*.mmd
  - docs/diagrams/**/*.puml
  - docs/diagrams/**/*.dot
  - docs/diagrams/**/*.d2
output: docs/generated
defaults:
  format: svg
  theme: default
`);

test("plans only changed supported diagrams in normal PRs", () => {
  const changes: FileChange[] = [
    { status: "M", path: "docs/diagrams/checkout.mmd" },
    { status: "M", path: "src/app.ts" },
  ];
  assert.deepEqual(buildVerificationPlan(changes, [], config, false), [
    { sourcePath: "docs/diagrams/checkout.mmd", outputPath: "docs/generated/checkout.svg", operation: "verify" },
  ]);
});

test("checks all sources when .diagram.yml changes", () => {
  const changes: FileChange[] = [{ status: "M", path: ".diagram.yml" }];
  const allSources = ["docs/diagrams/z.d2", "docs/diagrams/a.puml"];
  assert.deepEqual(buildVerificationPlan(changes, allSources, config, true), [
    { sourcePath: "docs/diagrams/a.puml", outputPath: "docs/generated/a.svg", operation: "verify" },
    { sourcePath: "docs/diagrams/z.d2", outputPath: "docs/generated/z.svg", operation: "verify" },
  ]);
});

test("removes generated output when a source is deleted", () => {
  assert.deepEqual(
    buildVerificationPlan([{ status: "D", path: "docs/diagrams/old.dot" }], [], config, false),
    [{ sourcePath: "docs/diagrams/old.dot", outputPath: "docs/generated/old.svg", operation: "remove" }],
  );
});

test("verifies the source when generated output changes directly", () => {
  assert.deepEqual(
    buildVerificationPlan(
      [{ status: "M", path: "docs/generated/checkout.svg" }],
      ["docs/diagrams/checkout.mmd"],
      config,
      false,
    ),
    [{ sourcePath: "docs/diagrams/checkout.mmd", outputPath: "docs/generated/checkout.svg", operation: "verify" }],
  );
});

test("builds deterministic OpenAPI render requests", () => {
  assert.deepEqual(deterministicRequest("docs/diagrams/a.mmd", "flowchart LR\nA-->B", config), {
    engine: "mermaid",
    format: "svg",
    source: "flowchart LR\nA-->B",
    options: { theme: "default", "deterministic-ids": true, "deterministic-id-seed": "docs/diagrams/a.mmd" },
  });
  assert.deepEqual(deterministicRequest("docs/diagrams/a.puml", "@startuml\n@enduml", config), {
    engine: "plantuml",
    format: "svg",
    source: "@startuml\n@enduml",
    options: { theme: "default", "no-metadata": true },
  });
});
