import assert from "node:assert/strict";
import test from "node:test";

import {
  InvalidRenderOutput,
  RenderOutputTooLarge,
  validateRenderOutput,
} from "../dist/output-validator.js";

test("removes active SVG elements, event handlers, and external references", () => {
  const unsafe = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" onload="steal()">
    <script>alert(1)</script>
    <a href="https://private.example/source"><text>safe</text></a>
    <rect style="fill:url(https://private.example/a)" onclick="steal()" />
    <style>.external { fill: url('https://private.example/b') }</style>
    <animate attributeName="x" from="0" to="10" />
  </svg>`);
  const output = validateRenderOutput(unsafe, "svg", 10_000).toString("utf8");
  assert.match(output, /<svg/);
  assert.match(output, /<text>safe<\/text>/);
  assert.doesNotMatch(output, /script|animate|onload|onclick|private\.example|url\(/i);
});

test("preserves safe internal SVG references and CSS", () => {
  const source = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="gradient"><stop offset="1" /></linearGradient></defs>
    <style>.node { fill: url(#gradient); font-weight: 600 }</style>
    <rect class="node" style="stroke:url('#gradient')" />
  </svg>`);
  const output = validateRenderOutput(source, "svg", 10_000).toString("utf8");
  assert.match(output, /fill: url\(#gradient\)/);
  assert.match(output, /stroke:url\('#gradient'\)/);
});

test("rejects entity declarations and non-SVG XML", () => {
  assert.throws(
    () => validateRenderOutput(Buffer.from('<!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]><svg>&xxe;</svg>'), "svg", 10_000),
    InvalidRenderOutput,
  );
  assert.throws(() => validateRenderOutput(Buffer.from("<html/>"), "svg", 10_000), InvalidRenderOutput);
});

test("accepts renderer SVG with a public doctype without preserving it", () => {
  const graphviz = Buffer.from('<?xml version="1.0"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg><text>graph</text></svg>');
  const output = validateRenderOutput(graphviz, "svg", 10_000).toString("utf8");
  assert.match(output, /<svg/);
  assert.doesNotMatch(output, /DOCTYPE|w3\.org\/Graphics/);
});

test("validates PNG signature and output size", () => {
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
  assert.equal(validateRenderOutput(png, "png", png.length), png);
  assert.throws(() => validateRenderOutput(Buffer.from("not-png"), "png", 100), InvalidRenderOutput);
  assert.throws(() => validateRenderOutput(png, "png", 8), RenderOutputTooLarge);
});
