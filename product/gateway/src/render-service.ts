import { createHash } from "node:crypto";

import type { RenderRequest } from "@diagram-as-code/contracts";

import { RenderBulkhead } from "./bulkhead.js";
import { validateRenderOutput } from "./output-validator.js";
import type { RendererClient } from "./renderer.js";

export interface RenderResult {
  body: Buffer;
  cache: "HIT" | "MISS" | "BYPASS";
}

export interface RenderServiceOptions {
  maxEntries: number;
  rendererVersion: string;
  sanitizerVersion: string;
  maxOutputBytes: number;
  maxConcurrent: number;
  maxQueue: number;
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, entry]) => [key, stableValue(entry)]),
    );
  }
  return value;
}

export function renderKey(
  request: RenderRequest,
  rendererVersion: string,
  sanitizerVersion: string,
  cachePartition: string,
): string {
  const { cache: _cachePolicy, ...renderInput } = request;
  return createHash("sha256")
    .update(JSON.stringify(stableValue({ rendererVersion, sanitizerVersion, cachePartition, request: renderInput })))
    .digest("hex");
}

export class RenderService {
  private readonly cache = new Map<string, Buffer>();
  private readonly inFlight = new Map<string, Promise<Buffer>>();
  readonly bulkhead: RenderBulkhead;

  constructor(
    private readonly renderer: RendererClient,
    private readonly options: RenderServiceOptions,
  ) {
    this.bulkhead = new RenderBulkhead(options.maxConcurrent, options.maxQueue);
  }

  async render(request: RenderRequest, cachePartition: string): Promise<RenderResult> {
    const mode = request.cache?.mode ?? "default";
    if (mode === "no-store") {
      return { body: await this.renderAndValidate(request), cache: "BYPASS" };
    }

    const key = renderKey(
      request,
      this.options.rendererVersion,
      this.options.sanitizerVersion,
      cachePartition,
    );
    if (mode !== "refresh") {
      const cached = this.cache.get(key);
      if (cached !== undefined) {
        this.cache.delete(key);
        this.cache.set(key, cached);
        return { body: cached, cache: "HIT" };
      }

      const pending = this.inFlight.get(key);
      if (pending) return { body: await pending, cache: "HIT" };
    }

    const renderPromise = this.renderAndValidate(request);
    this.inFlight.set(key, renderPromise);
    try {
      const body = await renderPromise;
      this.cache.set(key, body);
      while (this.cache.size > this.options.maxEntries) {
        const oldest = this.cache.keys().next().value as string | undefined;
        if (oldest === undefined) break;
        this.cache.delete(oldest);
      }
      return { body, cache: "MISS" };
    } finally {
      if (this.inFlight.get(key) === renderPromise) this.inFlight.delete(key);
    }
  }

  private async renderAndValidate(request: RenderRequest): Promise<Buffer> {
    return this.bulkhead.run(async () => {
      const body = await this.renderer.render(request);
      return validateRenderOutput(body, request.format, this.options.maxOutputBytes);
    });
  }
}
