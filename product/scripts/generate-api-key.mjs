import { createHash, randomBytes } from "node:crypto";
import process from "node:process";

const id = process.argv[2] ?? "default";
if (!/^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/.test(id)) {
  throw new Error("Key ID must be 1-64 log-safe characters: letters, digits, dot, underscore, or hyphen");
}

const apiKey = `dg_${randomBytes(32).toString("base64url")}`;
const verifier = `sha256:${createHash("sha256").update(apiKey).digest("hex")}`;
const record = {
  id,
  verifier,
  scopes: ["diagram:render"],
  cachePartition: id,
  status: "active",
};

process.stdout.write("Store this plaintext key in the client secret store; it will not be shown again:\n");
process.stdout.write(`${apiKey}\n\n`);
process.stdout.write("Store this verifier record in DIAGRAM_API_KEY_RECORDS on the Gateway:\n");
process.stdout.write(`${JSON.stringify([record])}\n`);
