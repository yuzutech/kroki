import { extname } from "node:path";

export const DIAGRAM_ENGINES = [
  "mermaid",
  "plantuml",
  "c4plantuml",
  "graphviz",
  "dot",
  "d2",
] as const;

export const CANONICAL_DIAGRAM_ENGINES = [
  "mermaid",
  "plantuml",
  "graphviz",
  "d2",
] as const;

export const OUTPUT_FORMATS = ["svg", "png"] as const;
export const CACHE_MODES = ["default", "refresh", "no-store"] as const;

export type DiagramEngine = (typeof DIAGRAM_ENGINES)[number];
export type CanonicalDiagramEngine = (typeof CANONICAL_DIAGRAM_ENGINES)[number];
export type OutputFormat = (typeof OUTPUT_FORMATS)[number];
export type CacheMode = (typeof CACHE_MODES)[number];

export const DEFAULT_OUTPUT_FORMAT: OutputFormat = "svg";

const EXTENSION_TO_ENGINE: Readonly<Record<string, CanonicalDiagramEngine>> = {
  ".mmd": "mermaid",
  ".puml": "plantuml",
  ".plantuml": "plantuml",
  ".dot": "graphviz",
  ".d2": "d2",
};

export interface RenderOptions {
  theme?: string;
  [key: string]: boolean | number | string | undefined;
}

export interface RenderRequest {
  engine: DiagramEngine;
  format: OutputFormat;
  source: string;
  options?: RenderOptions;
  cache?: {
    mode?: CacheMode;
  };
}

export interface RenderProblem {
  type: string;
  title: string;
  status: number;
  code: string;
  message: string;
  requestId: string;
  engine?: string;
  line?: number;
  column?: number;
  retryAfterSeconds?: number;
}

export function detectDiagramEngine(filePath: string): CanonicalDiagramEngine | undefined {
  return EXTENSION_TO_ENGINE[extname(filePath).toLowerCase()];
}

export function canonicalDiagramEngine(engine: DiagramEngine): CanonicalDiagramEngine {
  if (engine === "dot") return "graphviz";
  if (engine === "c4plantuml") return "plantuml";
  return engine;
}

export function rendererDiagramEngine(engine: DiagramEngine): Exclude<DiagramEngine, "dot"> {
  return engine === "dot" ? "graphviz" : engine;
}

export function isDiagramEngine(value: unknown): value is DiagramEngine {
  return typeof value === "string" && DIAGRAM_ENGINES.includes(value as DiagramEngine);
}

export function isOutputFormat(value: unknown): value is OutputFormat {
  return typeof value === "string" && OUTPUT_FORMATS.includes(value as OutputFormat);
}

export function outputContentType(format: OutputFormat): "image/svg+xml" | "image/png" {
  return format === "svg" ? "image/svg+xml" : "image/png";
}
