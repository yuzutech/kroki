import { createHash, timingSafeEqual } from "node:crypto";

export const RENDER_SCOPE = "diagram:render";

export interface Principal {
  subject: string;
  authMethod: "api-key" | "local";
  scopes: readonly string[];
  cachePartition: string;
}

export interface ApiKeyRecord {
  id: string;
  verifier: string;
  scopes: readonly string[];
  cachePartition: string;
  status: "active" | "revoked";
}

export function apiKeyVerifier(apiKey: string): string {
  return `sha256:${createHash("sha256").update(apiKey).digest("hex")}`;
}

function verifierDigest(verifier: string): Buffer {
  return Buffer.from(verifier.slice("sha256:".length), "hex");
}

export function authenticateApiKey(candidate: string, records: readonly ApiKeyRecord[]): Principal | undefined {
  const candidateDigest = verifierDigest(apiKeyVerifier(candidate));
  let matched: ApiKeyRecord | undefined;
  for (const record of records) {
    const expectedDigest = verifierDigest(record.verifier);
    if (expectedDigest.length === candidateDigest.length && timingSafeEqual(candidateDigest, expectedDigest)) {
      matched = record;
    }
  }
  if (!matched || matched.status !== "active") return undefined;
  return {
    subject: `api-key:${matched.id}`,
    authMethod: "api-key",
    scopes: [...matched.scopes],
    cachePartition: matched.cachePartition,
  };
}

export function localPrincipal(): Principal {
  return {
    subject: "local",
    authMethod: "local",
    scopes: [RENDER_SCOPE],
    cachePartition: "local",
  };
}

export function hasScope(principal: Principal, scope: string): boolean {
  return principal.scopes.includes(scope);
}
