import assert from "node:assert/strict";
import test from "node:test";

import { RENDER_SCOPE, apiKeyVerifier, authenticateApiKey, hasScope, localPrincipal } from "../dist/auth.js";

const activeRecord = {
  id: "docs-ci",
  verifier: apiKeyVerifier("secret"),
  scopes: [RENDER_SCOPE],
  cachePartition: "repo-42",
  status: "active" as const,
};

test("authenticates an active key into a non-secret principal", () => {
  const principal = authenticateApiKey("secret", [activeRecord]);
  assert.deepEqual(principal, {
    subject: "api-key:docs-ci",
    authMethod: "api-key",
    scopes: [RENDER_SCOPE],
    cachePartition: "repo-42",
  });
  assert.equal(JSON.stringify(principal).includes("secret"), false);
});

test("rejects invalid and revoked keys", () => {
  assert.equal(authenticateApiKey("wrong", [activeRecord]), undefined);
  assert.equal(authenticateApiKey("secret", [{ ...activeRecord, status: "revoked" }]), undefined);
});

test("checks scopes and creates a stable local principal", () => {
  assert.equal(hasScope({ ...localPrincipal(), scopes: [] }, RENDER_SCOPE), false);
  assert.equal(hasScope(localPrincipal(), RENDER_SCOPE), true);
  assert.equal(localPrincipal().cachePartition, "local");
});
