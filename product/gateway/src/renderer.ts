import {
  outputContentType,
  rendererDiagramEngine,
  type RenderRequest,
} from "@diagram-as-code/contracts";

import { InvalidRenderOutput, RenderOutputTooLarge } from "./output-validator.js";

export interface RendererClient {
  render(request: RenderRequest): Promise<Buffer>;
  ready(): Promise<boolean>;
}

export class RendererFailure extends Error {
  readonly line: number | undefined;
  readonly column: number | undefined;

  constructor(message: string, location: { line?: number; column?: number } = {}) {
    super(message);
    this.name = "RendererFailure";
    this.line = location.line;
    this.column = location.column;
  }
}

export class RendererUnavailable extends Error {
  constructor(message = "Kroki renderer is unavailable", options: ErrorOptions = {}) {
    super(message, options);
    this.name = "RendererUnavailable";
  }
}

export class RendererTimeout extends Error {
  constructor(message = "Renderer did not complete before the deadline", options: ErrorOptions = {}) {
    super(message, options);
    this.name = "RendererTimeout";
  }
}

export async function readResponseBody(response: Response, maximumBytes: number): Promise<Buffer> {
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maximumBytes) {
    await response.body?.cancel();
    throw new RenderOutputTooLarge(contentLength, maximumBytes);
  }
  if (!response.body) return Buffer.alloc(0);

  const chunks: Buffer[] = [];
  let total = 0;
  const reader = response.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maximumBytes) {
        await reader.cancel();
        throw new RenderOutputTooLarge(total, maximumBytes);
      }
      chunks.push(Buffer.from(value));
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, total);
}

export class KrokiRenderer implements RendererClient {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number,
    private readonly maxOutputBytes = 10_485_760,
  ) {}

  async render(request: RenderRequest): Promise<Buffer> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(request.options ?? {}).sort(([a], [b]) => a.localeCompare(b))) {
      if (value !== undefined) query.set(key, String(value));
    }

    const suffix = query.size > 0 ? `?${query.toString()}` : "";
    const engine = rendererDiagramEngine(request.engine);
    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/${engine}/${request.format}${suffix}`, {
        method: "POST",
        headers: {
          accept: outputContentType(request.format),
          "content-type": "text/plain; charset=utf-8",
        },
        body: request.source,
        signal: AbortSignal.timeout(this.timeoutMs),
      });
    } catch (error) {
      if (error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError")) {
        throw new RendererTimeout(undefined, { cause: error });
      }
      throw new RendererUnavailable(undefined, { cause: error });
    }

    let responseBody: Buffer;
    try {
      responseBody = await readResponseBody(response, this.maxOutputBytes);
    } catch (error) {
      if (error instanceof RenderOutputTooLarge) throw error;
      throw new RendererUnavailable("Kroki response stream failed", { cause: error });
    }
    if (!response.ok) {
      const body = responseBody.toString("utf8").trim();
      if (response.status >= 500) {
        throw new RendererUnavailable(body || `Kroki returned HTTP ${response.status}`);
      }
      throw new RendererFailure(body || `Kroki returned HTTP ${response.status}`);
    }
    const contentType = response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
    const expectedContentType = outputContentType(request.format);
    if (contentType !== expectedContentType) {
      throw new InvalidRenderOutput(
        `Kroki returned content type '${contentType ?? "missing"}'; expected '${expectedContentType}'`,
      );
    }
    return responseBody;
  }

  async ready(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/health`, {
        signal: AbortSignal.timeout(this.timeoutMs),
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}
