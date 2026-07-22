import { z } from "zod";

import { RENDER_SCOPE, apiKeyVerifier, type ApiKeyRecord } from "./auth.js";

export type AuthMode = "required" | "disabled";
export type DeploymentProfile = "local" | "production";

export interface GatewayConfig {
  authMode: AuthMode;
  apiKeyRecords: ApiKeyRecord[];
  deploymentProfile: DeploymentProfile;
  port: number;
  host: string;
  krokiBaseUrl: string;
  maxSourceBytes: number;
  maxOutputBytes: number;
  renderTimeoutMs: number;
  renderMaxConcurrent: number;
  renderMaxQueue: number;
  cacheMaxEntries: number;
  rendererVersion: string;
  sanitizerVersion: string;
  gatewayVersion: string;
  rateLimitPerMinute: number;
  rateLimitBurst: number;
  metricsEnabled: boolean;
  logLevel: "silent" | "fatal" | "error" | "warn" | "info" | "debug" | "trace";
}

const keyRecordSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/),
  verifier: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  scopes: z.array(z.string().min(1).max(64)).min(1),
  cachePartition: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/).optional(),
  status: z.enum(["active", "revoked"]).default("active"),
}).strict();

function integerInRange(
  value: string | undefined,
  fallback: number,
  name: string,
  minimum: number,
  maximum: number,
): number {
  if (value === undefined || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${name} must be an integer between ${minimum} and ${maximum}`);
  }
  return parsed;
}

function booleanValue(value: string | undefined, fallback: boolean, name: string): boolean {
  if (value === undefined || value === "") return fallback;
  if (value === "true") return true;
  if (value === "false") return false;
  throw new Error(`${name} must be either true or false`);
}

function isLoopbackHost(host: string): boolean {
  const normalized = host.trim().toLowerCase().replace(/^\[|\]$/g, "");
  return normalized === "localhost" || normalized === "127.0.0.1" || normalized === "::1";
}

function parseKeyRecords(env: NodeJS.ProcessEnv): ApiKeyRecord[] {
  let records: ApiKeyRecord[] = [];
  if (env.DIAGRAM_API_KEY_RECORDS) {
    let input: unknown;
    try {
      input = JSON.parse(env.DIAGRAM_API_KEY_RECORDS);
    } catch (error) {
      throw new Error("DIAGRAM_API_KEY_RECORDS must be valid JSON", { cause: error });
    }
    const parsed = z.array(keyRecordSchema).parse(input);
    records = parsed.map((record) => ({
      id: record.id,
      verifier: record.verifier,
      scopes: [...new Set(record.scopes)],
      cachePartition: record.cachePartition ?? record.id,
      status: record.status,
    }));
  } else {
    records = (env.DIAGRAM_API_KEYS ?? "")
      .split(",")
      .map((key) => key.trim())
      .filter(Boolean)
      .map((key, index) => ({
        id: `legacy-${index + 1}`,
        verifier: apiKeyVerifier(key),
        scopes: [RENDER_SCOPE],
        cachePartition: `legacy-${index + 1}`,
        status: "active" as const,
      }));
  }

  const ids = new Set<string>();
  const verifiers = new Set<string>();
  for (const record of records) {
    if (ids.has(record.id)) throw new Error(`Duplicate API key record id: ${record.id}`);
    if (verifiers.has(record.verifier)) throw new Error(`Duplicate API key verifier for record: ${record.id}`);
    ids.add(record.id);
    verifiers.add(record.verifier);
  }
  return records;
}

export function loadGatewayConfig(env: NodeJS.ProcessEnv = process.env): GatewayConfig {
  const authMode = env.AUTH_MODE ?? "required";
  if (authMode !== "required" && authMode !== "disabled") {
    throw new Error("AUTH_MODE must be either required or disabled");
  }
  const deploymentProfile = env.DEPLOYMENT_PROFILE ?? "local";
  if (deploymentProfile !== "local" && deploymentProfile !== "production") {
    throw new Error("DEPLOYMENT_PROFILE must be either local or production");
  }
  const host = env.HOST ?? "0.0.0.0";
  if (deploymentProfile === "production" && authMode === "disabled" && !isLoopbackHost(host)) {
    throw new Error("Production profile cannot disable authentication on a non-loopback host");
  }

  const apiKeyRecords = parseKeyRecords(env);
  if (authMode === "required" && !apiKeyRecords.some((record) => record.status === "active")) {
    throw new Error("At least one active API key record is required when AUTH_MODE=required");
  }

  const logLevel = env.LOG_LEVEL ?? "info";
  if (!["silent", "fatal", "error", "warn", "info", "debug", "trace"].includes(logLevel)) {
    throw new Error("LOG_LEVEL is invalid");
  }

  return {
    authMode,
    apiKeyRecords,
    deploymentProfile,
    port: integerInRange(env.PORT, 9000, "PORT", 1, 65_535),
    host,
    krokiBaseUrl: (env.KROKI_BASE_URL ?? "http://kroki:8000").replace(/\/$/, ""),
    maxSourceBytes: integerInRange(env.MAX_SOURCE_BYTES, 1_048_576, "MAX_SOURCE_BYTES", 1, 10_485_760),
    maxOutputBytes: integerInRange(env.MAX_OUTPUT_BYTES, 10_485_760, "MAX_OUTPUT_BYTES", 1, 52_428_800),
    renderTimeoutMs: integerInRange(env.RENDER_TIMEOUT_MS, 15_000, "RENDER_TIMEOUT_MS", 5_000, 60_000),
    renderMaxConcurrent: integerInRange(env.RENDER_MAX_CONCURRENT, 4, "RENDER_MAX_CONCURRENT", 1, 64),
    renderMaxQueue: integerInRange(env.RENDER_MAX_QUEUE, 20, "RENDER_MAX_QUEUE", 0, 1_000),
    cacheMaxEntries: integerInRange(env.CACHE_MAX_ENTRIES, 500, "CACHE_MAX_ENTRIES", 1, 100_000),
    rendererVersion: env.RENDERER_VERSION ?? "kroki-0.31.1",
    sanitizerVersion: env.SANITIZER_VERSION ?? "svg-sanitizer-1",
    gatewayVersion: env.GATEWAY_VERSION ?? "0.1.0",
    rateLimitPerMinute: integerInRange(env.RATE_LIMIT_PER_MINUTE, 60, "RATE_LIMIT_PER_MINUTE", 1, 1_000_000),
    rateLimitBurst: integerInRange(env.RATE_LIMIT_BURST, 10, "RATE_LIMIT_BURST", 1, 100_000),
    metricsEnabled: booleanValue(env.METRICS_ENABLED, true, "METRICS_ENABLED"),
    logLevel: logLevel as GatewayConfig["logLevel"],
  };
}
