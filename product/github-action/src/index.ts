import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import * as core from "@actions/core";
import { parseDiagramConfig } from "@diagram-as-code/diagram-config";
import fastGlob from "fast-glob";

import {
  buildVerificationPlan,
  deterministicRequest,
  parseNameStatus,
  type FileChange,
} from "./core.js";

interface StaleDiagram {
  sourcePath: string;
  outputPath: string;
  reason: "missing" | "stale" | "orphaned";
}

function readChanges(): FileChange[] | undefined {
  const baseRef = process.env.GITHUB_BASE_REF;
  const range = baseRef ? `origin/${baseRef}...HEAD` : "HEAD^...HEAD";
  try {
    const output = execFileSync("git", ["diff", "--name-status", "-M", range], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    return parseNameStatus(output);
  } catch {
    core.warning(`Could not diff ${range}; checking all diagram sources instead.`);
    return undefined;
  }
}

async function render(baseUrl: string, apiKey: string, request: ReturnType<typeof deterministicRequest>): Promise<Buffer> {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/render`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(request),
  });
  const body = Buffer.from(await response.arrayBuffer());
  if (!response.ok) {
    throw new Error(`Gateway render failed (${response.status}): ${body.toString("utf8")}`);
  }
  return body;
}

function pullRequestFilesUrl(): string | undefined {
  const repository = process.env.GITHUB_REPOSITORY;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!repository || !eventPath || !existsSync(eventPath)) return undefined;
  try {
    const event = JSON.parse(readFileSync(eventPath, "utf8")) as { pull_request?: { number?: number } };
    const number = event.pull_request?.number;
    return number ? `${process.env.GITHUB_SERVER_URL ?? "https://github.com"}/${repository}/pull/${number}/files` : undefined;
  } catch {
    return undefined;
  }
}

async function run(): Promise<void> {
  const root = process.env.GITHUB_WORKSPACE ?? process.cwd();
  const configPath = core.getInput("config-path") || ".diagram.yml";
  const config = parseDiagramConfig(readFileSync(path.join(root, configPath), "utf8"));
  const gatewayUrl = core.getInput("gateway-url", { required: true });
  const apiKey = core.getInput("api-key", { required: true });
  const changedOnly = (core.getInput("changed-only") || "true").toLowerCase() === "true";

  const allSources = (await fastGlob(config.sources, {
    cwd: root,
    onlyFiles: true,
    dot: false,
  })).map((file) => file.replaceAll("\\", "/"));
  const changes = changedOnly ? readChanges() : undefined;
  const renderingInputsChanged = changes?.some((change) =>
    change.path === configPath || change.path === ".diagram-renderer.lock",
  ) ?? true;
  const plan = buildVerificationPlan(changes ?? [], allSources, config, !changedOnly || renderingInputsChanged);
  const stale: StaleDiagram[] = [];

  for (const item of plan) {
    const absoluteOutput = path.join(root, item.outputPath);
    if (item.operation === "remove") {
      if (existsSync(absoluteOutput)) stale.push({ ...item, reason: "orphaned" });
      continue;
    }

    const source = readFileSync(path.join(root, item.sourcePath), "utf8");
    const output = await render(gatewayUrl, apiKey, deterministicRequest(item.sourcePath, source, config));
    if (!existsSync(absoluteOutput)) {
      stale.push({ ...item, reason: "missing" });
    } else if (!readFileSync(absoluteOutput).equals(output)) {
      stale.push({ ...item, reason: "stale" });
    }
  }

  core.setOutput("checked-count", plan.filter((item) => item.operation === "verify").length);
  core.setOutput("stale-count", stale.length);
  await core.summary.addHeading("Diagram as Code").addRaw(
    stale.length === 0
      ? `All ${plan.length} planned diagram artifact(s) are current.\n`
      : `${stale.length} generated SVG artifact(s) need attention.\n`,
  ).write();

  if (stale.length > 0) {
    const filesUrl = pullRequestFilesUrl();
    const rows = stale.map((item) => [item.reason, `\`${item.sourcePath}\``, `\`${item.outputPath}\``]);
    await core.summary
      .addTable([[{ data: "Status", header: true }, { data: "Source", header: true }, { data: "Generated SVG", header: true }], ...rows])
      .addRaw(filesUrl ? `\n[Open the pull request image diff](${filesUrl})\n` : "")
      .write();
    core.setFailed("Generated diagrams are missing, stale, or should be removed. Export the SVGs in VS Code and commit them.");
  }
}

run().catch((error: unknown) => {
  core.setFailed(error instanceof Error ? error.message : String(error));
});
