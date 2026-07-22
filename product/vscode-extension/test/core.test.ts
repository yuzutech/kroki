import assert from "node:assert/strict";
import test from "node:test";

import { GatewayClient, RenderCoordinator } from "../src/core.ts";

test("Gateway client sends auth using the OpenAPI render route", async () => {
  let received: { url: string; init: RequestInit } | undefined;
  const client = new GatewayClient("http://localhost:9000/", "secret", async (input, init) => {
    received = { url: String(input), init: init ?? {} };
    return new Response("<svg>ok</svg>", { status: 200, headers: { "content-type": "image/svg+xml" } });
  });
  const svg = await client.render({ engine: "mermaid", format: "svg", source: "A-->B" });
  assert.equal(svg, "<svg>ok</svg>");
  assert.equal(received?.url, "http://localhost:9000/api/v1/render");
  assert.equal(new Headers(received?.init.headers).get("authorization"), "Bearer secret");
});

test("Gateway client exposes structured problem details", async () => {
  const client = new GatewayClient("http://localhost:9000", "secret", async () =>
    new Response(JSON.stringify({
      type: "/problems/diagram-syntax-error",
      title: "Invalid diagram",
      status: 422,
      code: "DIAGRAM_SYNTAX_ERROR",
      message: "bad arrow",
      line: 2,
      requestId: "r1",
    }), { status: 422, headers: { "content-type": "application/problem+json" } }),
  );
  await assert.rejects(
    client.render({ engine: "d2", format: "svg", source: "bad" }),
    (error: Error & { line?: number; requestId?: string }) =>
      error.message === "bad arrow" && error.line === 2 && error.requestId === "r1",
  );
});

test("coordinator aborts an older render and caches the latest result", async () => {
  const signals: AbortSignal[] = [];
  const resolvers: Array<(svg: string) => void> = [];
  const coordinator = new RenderCoordinator(async (_request, signal) => {
    signals.push(signal);
    return new Promise<string>((resolve) => resolvers.push(resolve));
  });
  const first = coordinator.render("file:///a.mmd", { engine: "mermaid", format: "svg", source: "A" });
  const second = coordinator.render("file:///a.mmd", { engine: "mermaid", format: "svg", source: "B" });
  assert.equal(signals[0]?.aborted, true);
  resolvers[0]?.("<svg>A</svg>");
  resolvers[1]?.("<svg>B</svg>");
  await assert.rejects(first, /superseded/);
  assert.equal(await second, "<svg>B</svg>");
  assert.equal(await coordinator.render("file:///a.mmd", { engine: "mermaid", format: "svg", source: "B" }), "<svg>B</svg>");
  assert.equal(signals.length, 2);
});

test("coordinator shares an in-flight render for identical source", async () => {
  let calls = 0;
  let release: ((svg: string) => void) | undefined;
  const coordinator = new RenderCoordinator(async () => {
    calls += 1;
    return new Promise<string>((resolve) => { release = resolve; });
  });
  const request = { engine: "graphviz" as const, format: "svg" as const, source: "digraph { A -> B }" };
  const preview = coordinator.render("file:///a.dot", request);
  const exportRender = coordinator.render("file:///a.dot", request);
  release?.("<svg>shared</svg>");
  assert.equal(await preview, "<svg>shared</svg>");
  assert.equal(await exportRender, "<svg>shared</svg>");
  assert.equal(calls, 1);
});
