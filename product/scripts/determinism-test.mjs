import process from "node:process";

const directUrl = process.env.KROKI_DIRECT_URL?.replace(/\/$/, "");
if (!directUrl) throw new Error("Set KROKI_DIRECT_URL to the internal Kroki URL");

const examples = [
  ["mermaid", "flowchart LR\n  A --> B", { "deterministic-ids": true, "deterministic-id-seed": "contract-test" }],
  ["plantuml", "@startuml\nAlice -> Bob: hello\n@enduml", { "no-metadata": true }],
  ["graphviz", "digraph G { A -> B }", {}],
  ["d2", "A -> B", {}],
];

for (const [type, source, options] of examples) {
  const query = new URLSearchParams(Object.entries(options).map(([key, value]) => [key, String(value)]));
  const url = `${directUrl}/${type}/svg${query.size ? `?${query}` : ""}`;
  const outputs = [];
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "text/plain; charset=utf-8" },
      body: source,
    });
    const body = await response.text();
    if (!response.ok) throw new Error(`${type} deterministic render failed: ${body}`);
    outputs.push(body);
  }
  if (outputs[0] !== outputs[1]) throw new Error(`${type} produced different SVG for identical source`);
  process.stdout.write(`deterministic ${type}\n`);
}
