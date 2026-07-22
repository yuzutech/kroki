import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const extensionSource = readFileSync(
  new URL("../src/extension.ts", import.meta.url),
  "utf8",
);

test("provides visible Preview and Export status bar actions", () => {
  assert.match(extensionSource, /\$\(eye\) Preview/);
  assert.match(extensionSource, /\$\(export\) Export/);
  assert.match(extensionSource, /previewItem\.command = "diagramAsCode\.preview"/);
  assert.match(extensionSource, /exportItem\.command = "diagramAsCode\.exportSvg"/);
});
