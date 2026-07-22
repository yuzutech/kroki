import assert from "node:assert/strict";
import test from "node:test";

import { apiKeyVerifier } from "../dist/auth.js";
import { loadGatewayConfig } from "../dist/config.js";

test("requires at least one active key when authentication is required", () => {
  assert.throws(
    () => loadGatewayConfig({ AUTH_MODE: "required", DIAGRAM_API_KEYS: "" }),
    /At least one active API key record/,
  );
  assert.throws(
    () => loadGatewayConfig({
      AUTH_MODE: "required",
      DIAGRAM_API_KEY_RECORDS: JSON.stringify([{ id: "old", verifier: apiKeyVerifier("old"), scopes: ["diagram:render"], status: "revoked" }]),
    }),
    /At least one active API key record/,
  );
});

test("hashes legacy plaintext keys immediately for compatibility", () => {
  const config = loadGatewayConfig({ AUTH_MODE: "required", DIAGRAM_API_KEYS: " first, second " });
  assert.equal(config.apiKeyRecords.length, 2);
  assert.equal(config.apiKeyRecords[0]?.verifier, apiKeyVerifier("first"));
  assert.equal(JSON.stringify(config).includes('"first"'), false);
});

test("parses verifier records with scopes, partition, and lifecycle status", () => {
  const config = loadGatewayConfig({
    AUTH_MODE: "required",
    DIAGRAM_API_KEY_RECORDS: JSON.stringify([{
      id: "repo-ci",
      verifier: apiKeyVerifier("secret"),
      scopes: ["diagram:render", "diagram:render"],
      cachePartition: "repo-42",
      status: "active",
    }]),
  });
  assert.deepEqual(config.apiKeyRecords[0], {
    id: "repo-ci",
    verifier: apiKeyVerifier("secret"),
    scopes: ["diagram:render"],
    cachePartition: "repo-42",
    status: "active",
  });
});

test("rejects duplicate key IDs and verifiers", () => {
  const first = { id: "first", verifier: apiKeyVerifier("same"), scopes: ["diagram:render"], status: "active" };
  assert.throws(
    () => loadGatewayConfig({ AUTH_MODE: "required", DIAGRAM_API_KEY_RECORDS: JSON.stringify([first, { ...first }]) }),
    /Duplicate API key record id/,
  );
  assert.throws(
    () => loadGatewayConfig({ AUTH_MODE: "required", DIAGRAM_API_KEY_RECORDS: JSON.stringify([first, { ...first, id: "second" }]) }),
    /Duplicate API key verifier/,
  );
});

test("allows local no-auth but rejects unsafe production no-auth", () => {
  const local = loadGatewayConfig({ AUTH_MODE: "disabled" });
  assert.equal(local.authMode, "disabled");
  assert.equal(local.port, 9000);
  assert.throws(
    () => loadGatewayConfig({ AUTH_MODE: "disabled", DEPLOYMENT_PROFILE: "production", HOST: "0.0.0.0" }),
    /cannot disable authentication/,
  );
  assert.equal(
    loadGatewayConfig({ AUTH_MODE: "disabled", DEPLOYMENT_PROFILE: "production", HOST: "127.0.0.1" }).host,
    "127.0.0.1",
  );
});

test("parses bounded operational limits", () => {
  const config = loadGatewayConfig({
    AUTH_MODE: "required",
    DIAGRAM_API_KEYS: "secret",
    PORT: "9100",
    MAX_SOURCE_BYTES: "2048",
    MAX_OUTPUT_BYTES: "4096",
    RENDER_TIMEOUT_MS: "5000",
    RENDER_MAX_CONCURRENT: "3",
    RENDER_MAX_QUEUE: "0",
    CACHE_MAX_ENTRIES: "10",
    RATE_LIMIT_PER_MINUTE: "120",
    RATE_LIMIT_BURST: "20",
    METRICS_ENABLED: "false",
    LOG_LEVEL: "warn",
  });
  assert.equal(config.port, 9100);
  assert.equal(config.maxSourceBytes, 2048);
  assert.equal(config.maxOutputBytes, 4096);
  assert.equal(config.renderTimeoutMs, 5000);
  assert.equal(config.renderMaxConcurrent, 3);
  assert.equal(config.renderMaxQueue, 0);
  assert.equal(config.cacheMaxEntries, 10);
  assert.equal(config.rateLimitPerMinute, 120);
  assert.equal(config.rateLimitBurst, 20);
  assert.equal(config.metricsEnabled, false);
  assert.equal(config.logLevel, "warn");
});

test("rejects operational values outside safety bounds", () => {
  const base = { AUTH_MODE: "required", DIAGRAM_API_KEYS: "secret" };
  assert.throws(() => loadGatewayConfig({ ...base, RENDER_TIMEOUT_MS: "4999" }), /RENDER_TIMEOUT_MS/);
  assert.throws(() => loadGatewayConfig({ ...base, RENDER_TIMEOUT_MS: "60001" }), /RENDER_TIMEOUT_MS/);
  assert.throws(() => loadGatewayConfig({ ...base, RENDER_MAX_CONCURRENT: "0" }), /RENDER_MAX_CONCURRENT/);
  assert.throws(() => loadGatewayConfig({ ...base, MAX_OUTPUT_BYTES: "0" }), /MAX_OUTPUT_BYTES/);
});
