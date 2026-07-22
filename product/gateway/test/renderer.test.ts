import assert from "node:assert/strict";
import test from "node:test";

import { InvalidRenderOutput, RenderOutputTooLarge } from "../dist/output-validator.js";
import { KrokiRenderer, RendererUnavailable, readResponseBody } from "../dist/renderer.js";

test("rejects renderer response from Content-Length before buffering", async () => {
  const response = new Response("small", { headers: { "content-length": "100" } });
  await assert.rejects(readResponseBody(response, 10), RenderOutputTooLarge);
});

test("stops streaming when renderer response crosses the byte limit", async () => {
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new Uint8Array(6));
      controller.enqueue(new Uint8Array(6));
      controller.close();
    },
  });
  await assert.rejects(readResponseBody(new Response(stream), 10), RenderOutputTooLarge);
});

test("returns renderer response within the byte limit", async () => {
  const body = await readResponseBody(new Response("<svg/>"), 100);
  assert.equal(body.toString("utf8"), "<svg/>");
});

test("rejects a successful Kroki response with the wrong content type", async (context) => {
  context.mock.method(globalThis, "fetch", async () => new Response("<svg/>", {
    status: 200,
    headers: { "content-type": "text/html" },
  }));
  const renderer = new KrokiRenderer("http://kroki", 1_000, 1_000);
  await assert.rejects(
    renderer.render({ engine: "mermaid", format: "svg", source: "flowchart LR; A-->B" }),
    InvalidRenderOutput,
  );
});

test("maps a broken Kroki response stream to renderer unavailable", async (context) => {
  const stream = new ReadableStream<Uint8Array>({
    pull(controller) {
      controller.error(new Error("connection reset"));
    },
  });
  context.mock.method(globalThis, "fetch", async () => new Response(stream, {
    status: 200,
    headers: { "content-type": "image/svg+xml" },
  }));
  const renderer = new KrokiRenderer("http://kroki", 1_000, 1_000);
  await assert.rejects(
    renderer.render({ engine: "mermaid", format: "svg", source: "flowchart LR; A-->B" }),
    RendererUnavailable,
  );
});
