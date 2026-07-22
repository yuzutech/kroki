import { createHash } from "node:crypto";
import { inflateRawSync } from "node:zlib";

import {
  CACHE_MODES,
  DIAGRAM_ENGINES,
  OUTPUT_FORMATS,
  canonicalDiagramEngine,
  isDiagramEngine,
  isOutputFormat,
  outputContentType,
  type CacheMode,
  type DiagramEngine,
  type RenderOptions,
  type RenderProblem,
  type RenderRequest,
} from "@diagram-as-code/contracts";
import Fastify, { LogController, type FastifyReply, type FastifyRequest } from "fastify";
import { z } from "zod";

import type { GatewayConfig } from "./config.js";
import {
  RENDER_SCOPE,
  authenticateApiKey,
  hasScope,
  localPrincipal,
  type Principal,
} from "./auth.js";
import { RenderCapacityExceeded } from "./bulkhead.js";
import { GatewayMetrics } from "./metrics.js";
import { InvalidRenderOutput, RenderOutputTooLarge } from "./output-validator.js";
import { RenderService } from "./render-service.js";
import { TokenBucketRateLimiter } from "./rate-limiter.js";
import {
  RendererFailure,
  RendererTimeout,
  RendererUnavailable,
  type RendererClient,
} from "./renderer.js";

const renderValueSchema = z.union([z.string(), z.number(), z.boolean()]);
const renderRequestSchema = z.object({
  engine: z.enum(DIAGRAM_ENGINES),
  format: z.enum(OUTPUT_FORMATS),
  source: z.string().min(1),
  options: z.record(z.string(), renderValueSchema).optional(),
  cache: z.object({
    mode: z.enum(CACHE_MODES).optional(),
  }).strict().optional(),
}).strict();

const OPTION_ALLOWLIST: Readonly<Record<DiagramEngine, ReadonlySet<string>>> = {
  mermaid: new Set(["theme", "deterministic-ids", "deterministic-id-seed"]),
  plantuml: new Set(["theme", "no-metadata"]),
  c4plantuml: new Set(["theme", "no-metadata"]),
  graphviz: new Set(["theme", "layout"]),
  dot: new Set(["theme", "layout"]),
  d2: new Set(["theme", "layout"]),
};

interface CreateGatewayOptions {
  config: GatewayConfig;
  renderer: RendererClient;
  eventSink?: (event: GatewayRenderEvent) => void;
}

export interface GatewayRenderEvent {
  event: "render_request_completed";
  requestId: string;
  principalSubject: string;
  engine: string;
  format: string;
  durationMs: number;
  statusCode: number;
  cache?: "HIT" | "MISS" | "BYPASS";
  errorCode?: string;
}

interface RequestState {
  startedAt: number;
  principal?: Principal;
  engine?: string;
  format?: string;
  cache?: "HIT" | "MISS" | "BYPASS";
  errorCode?: string;
}

const requestStates = new WeakMap<FastifyRequest, RequestState>();

interface ProblemDetails {
  engine?: string;
  line?: number;
  column?: number;
  retryAfterSeconds?: number;
}

class EncodedSourceTooLarge extends Error {}

function problemType(code: string): string {
  return `/problems/${code.toLowerCase().replaceAll("_", "-")}`;
}

function sendProblem(
  request: FastifyRequest,
  reply: FastifyReply,
  status: number,
  code: string,
  title: string,
  message: string,
  details: ProblemDetails = {},
) {
  const state = requestStates.get(request);
  if (state) state.errorCode = code;
  const body: RenderProblem = {
    type: problemType(code),
    title,
    status,
    code,
    message,
    requestId: request.id,
    ...details,
  };
  if (details.retryAfterSeconds !== undefined) {
    void reply.header("Retry-After", details.retryAfterSeconds);
  }
  return reply.code(status).type("application/problem+json").send(body);
}

function supportsFormat(engine: DiagramEngine, format: string): boolean {
  return format === "svg" || (format === "png" && canonicalDiagramEngine(engine) !== "d2");
}

function sourceByteLength(source: string): number {
  return Buffer.byteLength(source, "utf8");
}

function queryValue(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function requestFromPath(
  engineValue: string,
  formatValue: string,
  source: string,
  query: unknown,
): RenderRequest | { error: "engine" | "format" } {
  if (!isDiagramEngine(engineValue)) return { error: "engine" };
  if (!isOutputFormat(formatValue) || !supportsFormat(engineValue, formatValue)) return { error: "format" };

  const entries = query !== null && typeof query === "object"
    ? Object.entries(query as Record<string, unknown>)
    : [];
  const options: RenderOptions = {};
  let cacheMode: CacheMode | undefined;
  for (const [key, rawValue] of entries) {
    const value = queryValue(rawValue);
    if (value === undefined) continue;
    if (key === "theme") options.theme = value;
    else if (key === "cache" && CACHE_MODES.includes(value as CacheMode)) cacheMode = value as CacheMode;
    else if (key.startsWith("option.") && key.length > 7) options[key.slice(7)] = value;
  }

  return {
    engine: engineValue,
    format: formatValue,
    source,
    ...(Object.keys(options).length === 0 ? {} : { options }),
    ...(cacheMode === undefined ? {} : { cache: { mode: cacheMode } }),
  };
}

function decodeSource(encodedSource: string, maxSourceBytes: number): string {
  if (!/^[A-Za-z0-9_-]+$/.test(encodedSource)) {
    throw new Error("Encoded source is not Base64 URL-safe");
  }
  try {
    const output = inflateRawSync(Buffer.from(encodedSource, "base64url"), {
      maxOutputLength: maxSourceBytes + 1,
    });
    if (output.byteLength > maxSourceBytes) throw new EncodedSourceTooLarge();
    return output.toString("utf8");
  } catch (error) {
    if (error instanceof EncodedSourceTooLarge) throw error;
    if (error instanceof Error && /larger than|maxOutputLength/i.test(error.message)) {
      throw new EncodedSourceTooLarge();
    }
    throw new Error("Cannot Base64 URL-decode or deflate source", { cause: error });
  }
}

export function createGateway({ config, renderer, eventSink }: CreateGatewayOptions) {
  const app = Fastify({
    logger: config.logLevel === "silent" ? false : {
      level: config.logLevel,
      redact: ["req.headers.authorization", "headers.authorization"],
    },
    bodyLimit: config.maxSourceBytes + 65_536,
    requestIdHeader: "x-request-id",
    logController: new LogController({ disableRequestLogging: true }),
  });
  const renderService = new RenderService(renderer, {
    maxEntries: config.cacheMaxEntries,
    rendererVersion: config.rendererVersion,
    sanitizerVersion: config.sanitizerVersion,
    maxOutputBytes: config.maxOutputBytes,
    maxConcurrent: config.renderMaxConcurrent,
    maxQueue: config.renderMaxQueue,
  });
  const rateLimiter = new TokenBucketRateLimiter(config.rateLimitPerMinute, config.rateLimitBurst);
  const metrics = new GatewayMetrics();

  app.addHook("onRequest", async (request, reply) => {
    requestStates.set(request, { startedAt: Date.now() });
    void reply.header("X-Request-Id", request.id);
  });

  app.addHook("onResponse", async (request, reply) => {
    if (!request.url.startsWith("/api/v1/render")) return;
    const state = requestStates.get(request);
    if (!state) return;
    const event: GatewayRenderEvent = {
      event: "render_request_completed",
      requestId: request.id,
      principalSubject: state.principal?.subject ?? "anonymous",
      engine: state.engine ?? "unknown",
      format: state.format ?? "unknown",
      durationMs: Math.max(0, Date.now() - state.startedAt),
      statusCode: reply.statusCode,
      ...(state.cache === undefined ? {} : { cache: state.cache }),
      ...(state.errorCode === undefined ? {} : { errorCode: state.errorCode }),
    };
    metrics.record(event);
    eventSink?.(event);
    request.log.info(event, event.event);
  });

  app.setErrorHandler(async (error, request, reply) => {
    const statusCode = error instanceof Error && "statusCode" in error
      ? (error as Error & { statusCode?: number }).statusCode
      : undefined;
    if (statusCode === 413) {
      await sendProblem(request, reply, 413, "PAYLOAD_TOO_LARGE", "Payload quá lớn", "Diagram source vượt giới hạn cấu hình.");
      return;
    }
    if (statusCode !== undefined && statusCode >= 400 && statusCode < 500) {
      const message = error instanceof Error ? error.message : "Request validation failed";
      await sendProblem(request, reply, 400, "INVALID_REQUEST", "Request không hợp lệ", message);
      return;
    }
    request.log.error(error);
    await sendProblem(
      request,
      reply,
      500,
      "INTERNAL_ERROR",
      "Lỗi nội bộ",
      "Không thể hoàn tất request. Hãy cung cấp requestId khi liên hệ vận hành.",
    );
  });

  function captureRequestDimensions(request: FastifyRequest): void {
    const state = requestStates.get(request);
    if (!state) return;
    const body = request.body !== null && typeof request.body === "object"
      ? request.body as Record<string, unknown>
      : undefined;
    const params = request.params !== null && typeof request.params === "object"
      ? request.params as Record<string, unknown>
      : undefined;
    const engine = body?.engine ?? params?.engine;
    const format = body?.format ?? params?.format;
    if (isDiagramEngine(engine)) state.engine = engine;
    if (isOutputFormat(format)) state.format = format;
  }

  async function authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    captureRequestDimensions(request);
    const state = requestStates.get(request);
    if (config.authMode === "disabled") {
      if (state) state.principal = localPrincipal();
      return;
    }
    const authorization = request.headers.authorization ?? "";
    const candidate = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
    const principal = candidate ? authenticateApiKey(candidate, config.apiKeyRecords) : undefined;
    if (!principal) {
      void reply.header("WWW-Authenticate", 'Bearer realm="diagram-gateway"');
      await sendProblem(
        request,
        reply,
        401,
        "UNAUTHENTICATED",
        "Chưa xác thực",
        "Bearer credential bị thiếu hoặc không hợp lệ.",
      );
      return;
    }
    if (state) state.principal = principal;
    if (!hasScope(principal, RENDER_SCOPE)) {
      await sendProblem(
        request,
        reply,
        403,
        "FORBIDDEN",
        "Không đủ quyền",
        `Principal không có scope '${RENDER_SCOPE}'.`,
      );
    }
  }

  async function enforceRateLimit(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    if (reply.sent) return;
    const principal = requestStates.get(request)?.principal;
    if (!principal) return;
    const decision = rateLimiter.consume(principal.subject);
    if (!decision.allowed) {
      await sendProblem(
        request,
        reply,
        429,
        "RATE_LIMITED",
        "Rate limit exceeded",
        "Render request rate exceeded. Retry after the indicated delay.",
        { retryAfterSeconds: decision.retryAfterSeconds },
      );
    }
  }

  function validateRequest(
    request: FastifyRequest,
    reply: FastifyReply,
    candidate: unknown,
  ): RenderRequest | undefined {
    const parsed = renderRequestSchema.safeParse(candidate);
    if (!parsed.success) {
      void sendProblem(request, reply, 400, "INVALID_REQUEST", "Request không hợp lệ", "Render request không đúng schema.");
      return undefined;
    }
    const state = requestStates.get(request);
    if (state) {
      state.engine = parsed.data.engine;
      state.format = parsed.data.format;
    }
    if (!supportsFormat(parsed.data.engine, parsed.data.format)) {
      void sendProblem(
        request,
        reply,
        400,
        "UNSUPPORTED_FORMAT",
        "Format không được hỗ trợ",
        `Format '${parsed.data.format}' không được hỗ trợ cho engine ${parsed.data.engine}.`,
        { engine: parsed.data.engine },
      );
      return undefined;
    }
    const unsupportedOption = Object.keys(parsed.data.options ?? {})
      .find((option) => !OPTION_ALLOWLIST[parsed.data.engine].has(option));
    if (unsupportedOption) {
      void sendProblem(
        request,
        reply,
        400,
        "UNSUPPORTED_OPTION",
        "Render option is not supported",
        `Option '${unsupportedOption}' is not allowed for engine ${parsed.data.engine}.`,
        { engine: parsed.data.engine },
      );
      return undefined;
    }
    if (sourceByteLength(parsed.data.source) > config.maxSourceBytes) {
      void sendProblem(
        request,
        reply,
        413,
        "PAYLOAD_TOO_LARGE",
        "Payload quá lớn",
        "Diagram source vượt giới hạn sau decode.",
        { engine: parsed.data.engine },
      );
      return undefined;
    }
    return {
      engine: parsed.data.engine,
      format: parsed.data.format,
      source: parsed.data.source,
      ...(parsed.data.options === undefined ? {} : { options: parsed.data.options }),
      ...(parsed.data.cache?.mode === undefined ? {} : { cache: { mode: parsed.data.cache.mode } }),
    };
  }

  async function renderOrReply(
    request: FastifyRequest,
    reply: FastifyReply,
    candidate: unknown,
  ): Promise<void> {
    const renderRequest = validateRequest(request, reply, candidate);
    if (!renderRequest) return;

    try {
      const state = requestStates.get(request);
      const result = await renderService.render(renderRequest, state?.principal?.cachePartition ?? "anonymous");
      if (state) state.cache = result.cache;
      const outputHash = createHash("sha256").update(result.body).digest("hex");
      await reply
        .header("ETag", `"sha256-${outputHash}"`)
        .header("Cache-Control", renderRequest.cache?.mode === "no-store" ? "no-store" : "private, max-age=3600")
        .header("X-Cache", result.cache)
        .header("X-Diagram-Engine", canonicalDiagramEngine(renderRequest.engine))
        .header("X-Renderer-Version", config.rendererVersion)
        .type(outputContentType(renderRequest.format))
        .send(result.body);
    } catch (error) {
      if (error instanceof RendererFailure) {
        await sendProblem(
          request,
          reply,
          422,
          "DIAGRAM_SYNTAX_ERROR",
          "Diagram source không hợp lệ",
          error.message,
          {
            engine: renderRequest.engine,
            ...(error.line === undefined ? {} : { line: error.line }),
            ...(error.column === undefined ? {} : { column: error.column }),
          },
        );
        return;
      }
      if (error instanceof RenderCapacityExceeded) {
        await sendProblem(
          request,
          reply,
          429,
          "RENDER_CAPACITY_EXCEEDED",
          "Render capacity exceeded",
          "Renderer concurrency and pending queue are full. Retry later.",
          { engine: renderRequest.engine, retryAfterSeconds: 1 },
        );
        return;
      }
      if (error instanceof RenderOutputTooLarge) {
        await sendProblem(
          request,
          reply,
          502,
          "RENDER_OUTPUT_TOO_LARGE",
          "Renderer output too large",
          "Renderer output exceeded the configured response size limit.",
          { engine: renderRequest.engine },
        );
        return;
      }
      if (error instanceof InvalidRenderOutput) {
        await sendProblem(
          request,
          reply,
          502,
          "INVALID_RENDER_OUTPUT",
          "Invalid renderer output",
          error.message,
          { engine: renderRequest.engine },
        );
        return;
      }
      if (error instanceof RendererTimeout) {
        await sendProblem(
          request,
          reply,
          504,
          "RENDER_TIMEOUT",
          "Render quá thời gian",
          "Renderer không hoàn tất trước deadline.",
          { engine: renderRequest.engine },
        );
        return;
      }
      if (error instanceof RendererUnavailable) {
        await sendProblem(
          request,
          reply,
          503,
          "RENDERER_UNAVAILABLE",
          "Renderer không khả dụng",
          error.message,
          { engine: renderRequest.engine, retryAfterSeconds: 5 },
        );
        return;
      }
      request.log.error(error);
      await sendProblem(
        request,
        reply,
        500,
        "INTERNAL_ERROR",
        "Lỗi nội bộ",
        "Không thể hoàn tất request. Hãy cung cấp requestId khi liên hệ vận hành.",
        { engine: renderRequest.engine },
      );
    }
  }

  async function readiness(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const started = Date.now();
    const ready = await renderer.ready();
    const statusCode = ready ? 200 : 503;
    await reply.code(statusCode).send({
      status: ready ? "up" : "down",
      service: "diagram-gateway",
      version: config.gatewayVersion,
      timestamp: new Date().toISOString(),
      checks: [{
        name: "kroki-core",
        status: ready ? "up" : "down",
        latencyMs: Date.now() - started,
        ...(ready ? {} : { detail: "Kroki backend is not ready" }),
      }],
    });
  }

  app.get("/health/live", async () => ({
    status: "up",
    service: "diagram-gateway",
    version: config.gatewayVersion,
    timestamp: new Date().toISOString(),
    checks: [],
  }));
  app.get("/health/ready", readiness);
  app.get("/health", readiness);

  if (config.metricsEnabled) {
    app.get("/metrics", async (_request, reply) => {
      await reply
        .type("text/plain; version=0.0.4; charset=utf-8")
        .send(metrics.render(renderService.bulkhead.active, renderService.bulkhead.queued));
    });
  }

  app.get("/api/v1/engines", async () => {
    const available = await renderer.ready();
    return {
      apiVersion: "v1",
      generatedAt: new Date().toISOString(),
      engines: [
        { id: "mermaid", aliases: [], version: config.rendererVersion, formats: ["svg", "png"], available },
        { id: "plantuml", aliases: ["c4plantuml"], version: config.rendererVersion, formats: ["svg", "png"], available },
        { id: "graphviz", aliases: ["dot"], version: config.rendererVersion, formats: ["svg", "png"], available },
        { id: "d2", aliases: [], version: config.rendererVersion, formats: ["svg"], available },
      ].map((engine) => available ? engine : { ...engine, unavailableReason: "Kroki backend is not ready" }),
    };
  });

  const renderGuards = [authenticate, enforceRateLimit];

  app.post("/api/v1/render", { preHandler: renderGuards }, async (request, reply) => {
    await renderOrReply(request, reply, request.body);
  });

  app.post<{
    Params: { engine: string; format: string };
  }>("/api/v1/render/:engine/:format", { preHandler: renderGuards }, async (request, reply) => {
    if (typeof request.body !== "string") {
      await sendProblem(request, reply, 400, "INVALID_REQUEST", "Request không hợp lệ", "Body phải là text/plain UTF-8.");
      return;
    }
    const candidate = requestFromPath(
      request.params.engine,
      request.params.format,
      request.body,
      request.query,
    );
    if ("error" in candidate) {
      const engineError = candidate.error === "engine";
      await sendProblem(
        request,
        reply,
        400,
        engineError ? "UNSUPPORTED_ENGINE" : "UNSUPPORTED_FORMAT",
        engineError ? "Engine không được hỗ trợ" : "Format không được hỗ trợ",
        engineError
          ? `Engine '${request.params.engine}' không được hỗ trợ.`
          : `Format '${request.params.format}' không được hỗ trợ.`,
        { engine: request.params.engine },
      );
      return;
    }
    await renderOrReply(request, reply, candidate);
  });

  app.get<{
    Params: { engine: string; format: string; encodedSource: string };
  }>("/api/v1/render/:engine/:format/:encodedSource", { preHandler: renderGuards }, async (request, reply) => {
    if (request.params.encodedSource.length > 8192) {
      await sendProblem(
        request,
        reply,
        414,
        "URI_TOO_LONG",
        "URI quá dài",
        "Hãy sử dụng POST cho diagram source lớn.",
      );
      return;
    }

    let source: string;
    try {
      source = decodeSource(request.params.encodedSource, config.maxSourceBytes);
    } catch (error) {
      if (error instanceof EncodedSourceTooLarge) {
        await sendProblem(request, reply, 413, "PAYLOAD_TOO_LARGE", "Payload quá lớn", "Diagram source vượt giới hạn sau decode.");
      } else {
        await sendProblem(
          request,
          reply,
          400,
          "INVALID_ENCODED_SOURCE",
          "Encoded source không hợp lệ",
          "Không thể Base64 URL-decode hoặc zlib-inflate source.",
          { engine: request.params.engine },
        );
      }
      return;
    }

    const candidate = requestFromPath(
      request.params.engine,
      request.params.format,
      source,
      request.query,
    );
    if ("error" in candidate) {
      const engineError = candidate.error === "engine";
      await sendProblem(
        request,
        reply,
        400,
        engineError ? "UNSUPPORTED_ENGINE" : "UNSUPPORTED_FORMAT",
        engineError ? "Engine không được hỗ trợ" : "Format không được hỗ trợ",
        "Engine hoặc format trong URL không được hỗ trợ.",
        { engine: request.params.engine },
      );
      return;
    }
    await renderOrReply(request, reply, candidate);
  });

  return app;
}
