import process from "node:process";
import { deflateRawSync } from "node:zlib";

const baseUrl = (process.env.DIAGRAM_GATEWAY_URL ?? "http://localhost:9000").replace(/\/$/, "");
const apiKey = process.env.DIAGRAM_API_KEY;
if (!apiKey) throw new Error("Set DIAGRAM_API_KEY to the key configured for the Gateway");

const examples = [
  ["mermaid", "flowchart LR\n  A --> B"],
  ["plantuml", "@startuml\nAlice -> Bob: hello\n@enduml"],
  ["graphviz", "digraph G { A -> B }"],
  ["d2", "A -> B"],
];
const authorization = `Bearer ${apiKey}`;

async function waitUntilReady() {
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health/ready`);
      if (response.ok) return;
    } catch {
      // The stack may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 2_000));
  }
  throw new Error(`Gateway did not become ready at ${baseUrl}`);
}

function assertSvg(response, body, label) {
  if (!response.ok || !body.includes("<svg")) {
    throw new Error(`${label} failed (${response.status}): ${body}`);
  }
  for (const header of ["etag", "x-cache", "x-diagram-engine", "x-renderer-version", "x-request-id"]) {
    if (!response.headers.get(header)) throw new Error(`${label} omitted required response header ${header}`);
  }
}

await waitUntilReady();
const engines = await fetch(`${baseUrl}/api/v1/engines`);
if (!engines.ok || (await engines.json()).engines.length < 4) throw new Error("Engine discovery failed");

for (const [engine, source] of examples) {
  const response = await fetch(`${baseUrl}/api/v1/render`, {
    method: "POST",
    headers: { authorization, "content-type": "application/json" },
    body: JSON.stringify({ engine, format: "svg", source }),
  });
  const body = await response.text();
  assertSvg(response, body, `JSON ${engine}`);
  process.stdout.write(`ok JSON ${engine} (${response.headers.get("x-cache")})\n`);
}

const textResponse = await fetch(`${baseUrl}/api/v1/render/mermaid/svg`, {
  method: "POST",
  headers: { authorization, "content-type": "text/plain" },
  body: examples[0][1],
});
assertSvg(textResponse, await textResponse.text(), "text/plain Mermaid");

const encoded = deflateRawSync(Buffer.from(examples[2][1], "utf8")).toString("base64url");
const getResponse = await fetch(`${baseUrl}/api/v1/render/dot/svg/${encoded}`, {
  headers: { authorization },
});
assertSvg(getResponse, await getResponse.text(), "encoded Graphviz");
process.stdout.write("ok SVG vertical slice\n");
