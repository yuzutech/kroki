import path from "node:path";

import { minimatch } from "minimatch";
import { parse as parseYaml } from "yaml";
import { z } from "zod";

const renderValueSchema = z.union([z.string(), z.number(), z.boolean()]);
const outputFormatSchema = z.enum(["svg", "png"]);

function isSafeRelativePath(value: string): boolean {
  const normalized = value.replaceAll("\\", "/");
  return !path.posix.isAbsolute(normalized)
    && !/^[A-Za-z]:\//.test(normalized)
    && !normalized.split("/").includes("..");
}

const safeRelativePathSchema = z.string().min(1).refine(isSafeRelativePath, {
  message: "must be a repository-relative path without '..'",
});

const engineConfigSchema = z.object({
  format: outputFormatSchema.optional(),
  theme: z.string().min(1).max(64).optional(),
  options: z.record(z.string(), renderValueSchema).default({}),
}).strict();

export const diagramConfigSchema = z.object({
  version: z.literal(1),
  sources: z.array(safeRelativePathSchema).min(1),
  output: safeRelativePathSchema,
  defaults: z.object({
    format: outputFormatSchema.default("svg"),
    theme: z.string().min(1).max(64).default("default"),
  }).strict().default({ format: "svg", theme: "default" }),
  engines: z.object({
    mermaid: engineConfigSchema.optional(),
    plantuml: engineConfigSchema.optional(),
    c4plantuml: engineConfigSchema.optional(),
    graphviz: engineConfigSchema.optional(),
    d2: engineConfigSchema.optional(),
  }).strict().default({}),
  preview: z.object({
    debounceMs: z.number().int().min(200).max(2000).default(400),
  }).strict().default({ debounceMs: 400 }),
  render: z.object({
    onSave: z.boolean().default(false),
  }).strict().default({ onSave: false }),
}).strict();

export type DiagramConfig = z.infer<typeof diagramConfigSchema>;

export interface EffectiveRenderSettings {
  format: "svg" | "png";
  theme: string;
  options: Record<string, string | number | boolean>;
}

function normalize(filePath: string): string {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "");
}

function staticGlobRoot(pattern: string): string {
  const segments = normalize(pattern).split("/");
  const root: string[] = [];
  for (const segment of segments) {
    if (/[*?[\]{}()!]/.test(segment)) break;
    root.push(segment);
  }
  if (root.length > 0 && /\.[A-Za-z0-9]+$/.test(root[root.length - 1] ?? "")) {
    root.pop();
  }
  return root.join("/");
}

export function parseDiagramConfig(source: string): DiagramConfig {
  try {
    return diagramConfigSchema.parse(parseYaml(source));
  } catch (error) {
    const details = error instanceof Error ? ": " + error.message : "";
    throw new Error("Invalid diagram configuration" + details, { cause: error });
  }
}

export function effectiveRenderSettings(
  sourcePath: string,
  config: DiagramConfig,
): EffectiveRenderSettings {
  const extension = path.posix.extname(normalize(sourcePath)).toLowerCase();
  const engine = extension === ".mmd"
    ? "mermaid"
    : extension === ".puml" || extension === ".plantuml"
      ? "plantuml"
      : extension === ".dot"
        ? "graphviz"
        : extension === ".d2"
          ? "d2"
          : undefined;
  const override = engine ? config.engines[engine] : undefined;
  return {
    format: override?.format ?? config.defaults.format,
    theme: override?.theme ?? config.defaults.theme,
    options: { ...(override?.options ?? {}) },
  };
}

export function outputPathForSource(
  sourcePath: string,
  config: DiagramConfig,
  formatOverride?: "svg" | "png",
): string | undefined {
  const source = normalize(sourcePath);
  if (!isSafeRelativePath(source)) return undefined;

  const matchingRoots = config.sources
    .filter((pattern) => minimatch(source, normalize(pattern)))
    .map(staticGlobRoot)
    .sort((a, b) => b.length - a.length);
  const root = matchingRoots[0];
  if (root === undefined) return undefined;

  const relative = root === "" ? source : path.posix.relative(root, source);
  if (relative === "" || relative === ".." || relative.startsWith("../") || path.posix.isAbsolute(relative)) {
    return undefined;
  }
  const extension = path.posix.extname(relative);
  if (!extension) return undefined;

  const format = formatOverride ?? effectiveRenderSettings(source, config).format;
  const outputRoot = path.posix.normalize(normalize(config.output));
  const output = path.posix.join(outputRoot, `${relative.slice(0, -extension.length)}.${format}`);
  const relativeToOutput = path.posix.relative(outputRoot, output);
  if (relativeToOutput === ".." || relativeToOutput.startsWith("../") || path.posix.isAbsolute(relativeToOutput)) {
    throw new Error("Generated output escapes the configured output directory");
  }
  return output;
}
