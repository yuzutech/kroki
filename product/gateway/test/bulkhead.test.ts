import assert from "node:assert/strict";
import test from "node:test";

import { RenderBulkhead, RenderCapacityExceeded } from "../dist/bulkhead.js";

test("bounds active renders and pending queue", async () => {
  const bulkhead = new RenderBulkhead(1, 1);
  let releaseFirst: (() => void) | undefined;
  const gate = new Promise<void>((resolve) => { releaseFirst = resolve; });
  const first = bulkhead.run(async () => { await gate; return "first"; });
  const second = bulkhead.run(async () => "second");
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(bulkhead.active, 1);
  assert.equal(bulkhead.queued, 1);
  await assert.rejects(bulkhead.run(async () => "third"), RenderCapacityExceeded);

  releaseFirst?.();
  assert.equal(await first, "first");
  assert.equal(await second, "second");
  assert.equal(bulkhead.active, 0);
  assert.equal(bulkhead.queued, 0);
});

test("releases permits after operation failure", async () => {
  const bulkhead = new RenderBulkhead(1, 0);
  await assert.rejects(bulkhead.run(async () => { throw new Error("failed"); }), /failed/);
  assert.equal(bulkhead.active, 0);
  assert.equal(await bulkhead.run(async () => "recovered"), "recovered");
});
