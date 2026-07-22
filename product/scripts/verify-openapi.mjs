import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import YAML from "yaml";

const productRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const document = YAML.parse(await readFile(path.join(productRoot, "..", "docs", "openapi.yaml"), "utf8"));

if (document.openapi !== "3.2.0") throw new Error(`Expected OpenAPI 3.2.0, got ${document.openapi}`);

const operations = new Map([
  ["POST /api/v1/render", "renderDiagram"],
  ["POST /api/v1/render/{engine}/{format}", "renderDiagramText"],
  ["GET /api/v1/render/{engine}/{format}/{encodedSource}", "renderDiagramEncoded"],
  ["GET /api/v1/engines", "listSupportedDiagramTypes"],
  ["GET /health", "getHealth"],
  ["GET /health/live", "getLiveness"],
  ["GET /health/ready", "getReadiness"],
]);

for (const [route, operationId] of operations) {
  const [method, routePath] = route.split(" ");
  const operation = document.paths?.[routePath]?.[method.toLowerCase()];
  if (operation?.operationId !== operationId) {
    throw new Error(`${route} must define operationId ${operationId}`);
  }
}

const expectedEngines = ["mermaid", "plantuml", "c4plantuml", "graphviz", "dot", "d2"];
const engines = document.components?.schemas?.DiagramEngine?.enum;
if (JSON.stringify(engines) !== JSON.stringify(expectedEngines)) {
  throw new Error(`DiagramEngine enum drifted: ${JSON.stringify(engines)}`);
}

function resolveLocalRef(ref) {
  let current = document;
  for (const token of ref.slice(2).split("/")) {
    current = current?.[token.replaceAll("~1", "/").replaceAll("~0", "~")];
  }
  return current;
}

function visit(value) {
  if (Array.isArray(value)) {
    for (const item of value) visit(item);
    return;
  }
  if (!value || typeof value !== "object") return;
  if (typeof value.$ref === "string" && value.$ref.startsWith("#/") && !resolveLocalRef(value.$ref)) {
    throw new Error(`Unresolved local OpenAPI reference: ${value.$ref}`);
  }
  for (const child of Object.values(value)) visit(child);
}

visit(document);
process.stdout.write("OpenAPI contract check passed\n");
