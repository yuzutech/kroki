import {
  detectDiagramEngine,
  type RenderRequest,
} from "@diagram-as-code/contracts";
import {
  effectiveRenderSettings,
  outputPathForSource,
  type DiagramConfig,
} from "@diagram-as-code/diagram-config";

export interface FileChange {
  status: "A" | "M" | "D" | "R";
  path: string;
  oldPath?: string;
}

export interface VerificationItem {
  sourcePath: string;
  outputPath: string;
  operation: "verify" | "remove";
}

function normalize(filePath: string): string {
  return filePath.replaceAll("\\", "/").replace(/^\.\//, "");
}

export function buildVerificationPlan(
  changes: FileChange[],
  allSources: string[],
  config: DiagramConfig,
  forceAll: boolean,
): VerificationItem[] {
  const items = new Map<string, VerificationItem>();
  const sourceByOutput = new Map<string, string>();
  for (const source of allSources) {
    const generated = outputPathForSource(source, config);
    if (generated) sourceByOutput.set(generated, normalize(source));
  }

  const add = (sourcePath: string, operation: VerificationItem["operation"]): void => {
    const generated = outputPathForSource(sourcePath, config);
    if (!generated) return;
    items.set(`${operation}:${normalize(sourcePath)}`, {
      sourcePath: normalize(sourcePath),
      outputPath: generated,
      operation,
    });
  };

  if (forceAll) {
    for (const source of allSources) add(source, "verify");
  } else {
    for (const change of changes) {
      if (change.status === "D") add(change.path, "remove");
      else if (change.status === "R") {
        if (change.oldPath) add(change.oldPath, "remove");
        add(change.path, "verify");
      } else {
        add(change.path, "verify");
      }
      const sourceForGenerated = sourceByOutput.get(normalize(change.path));
      if (sourceForGenerated) add(sourceForGenerated, "verify");
    }
  }

  return [...items.values()].sort((a, b) => a.sourcePath.localeCompare(b.sourcePath));
}

export function deterministicRequest(
  sourcePath: string,
  source: string,
  config: DiagramConfig,
): RenderRequest {
  const engine = detectDiagramEngine(sourcePath);
  if (!engine) throw new Error(`Unsupported diagram source: ${sourcePath}`);

  const settings = effectiveRenderSettings(sourcePath, config);
  const options: NonNullable<RenderRequest["options"]> = {
    theme: settings.theme,
    ...settings.options,
  };
  if (engine === "mermaid") {
    options["deterministic-ids"] = true;
    options["deterministic-id-seed"] = normalize(sourcePath);
  } else if (engine === "plantuml") {
    options["no-metadata"] = true;
  }

  return {
    engine,
    format: settings.format,
    source,
    options,
  };
}

export function parseNameStatus(output: string): FileChange[] {
  const changes: FileChange[] = [];
  for (const line of output.split(/\r?\n/).filter(Boolean)) {
    const [rawStatus, firstPath, secondPath] = line.split("\t");
    if (!rawStatus || !firstPath) continue;
    const status = rawStatus[0];
    if (status === "R" && secondPath) {
      changes.push({ status: "R", oldPath: firstPath, path: secondPath });
    } else if (status === "A" || status === "M" || status === "D") {
      changes.push({ status, path: firstPath });
    }
  }
  return changes;
}
