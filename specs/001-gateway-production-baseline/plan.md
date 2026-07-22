# Implementation Plan: Gateway Production Baseline

**Branch**: `current-worktree` | **Date**: 2026-07-22 | **Spec**: [spec.md](spec.md)

## Summary

Harden the existing Fastify Gateway with principal-based authorization/cache isolation, bounded render admission, output size/type validation, SVG sanitization, structured redacted events, aggregate metrics and safe runtime configuration while preserving the OpenAPI v1 rendering contract.

## Technical Context

**Language/Version**: TypeScript 5.9 on Node.js 24

**Primary Dependencies**: Fastify 5, Zod 4, `@xmldom/xmldom`

**Storage**: In-memory LRU/cache, token buckets, metrics and configured key records

**Testing**: Node test runner with Fastify injection; Docker Compose SVG smoke

**Target Platform**: Linux containers; local development on Windows/Linux

**Project Type**: HTTP service inside the product npm workspace

**Performance Goals**: Concurrency 4 and queue 20 by default; 15-second render deadline; 1 MiB input; 10 MiB output

**Constraints**: Keep Kroki internal; no message queue, Redis, database, OIDC or admin UI in this feature

**Scale/Scope**: One Gateway replica for MVP, four renderer families, API-key/local principal

## Constitution Check

The constitution file is an unfilled template, so governance checks defer to `AGENTS.md`, SRS and SDD. The plan passes all applicable architecture guardrails: Gateway owns policy, Kroki remains rendering-only, communication stays synchronous HTTP, and no deep fork change is introduced.

## Design Decisions

- API key records use `sha256:<hex>` verifiers. Legacy `DIAGRAM_API_KEYS` remains a compatibility path that is hashed immediately in memory and documented as deprecated.
- `Principal` is attached to request-scoped state and raw credentials are never included in downstream service inputs.
- Cache and single-flight keys include cache partition, renderer version and sanitizer version.
- Bulkhead wraps actual backend calls inside `RenderService`, so cache hits and coalesced requests do not consume extra permits.
- Output processing order is raw size guard, SVG parse/sanitize or PNG signature validation, sanitized size guard, then cache write.
- Invalid/oversized renderer output maps to `502 INVALID_RENDER_OUTPUT` or `502 RENDER_OUTPUT_TOO_LARGE`.
- Metrics are aggregate and low-cardinality. Principal/source are excluded from labels.
- Completion events are constructed from an allowlisted schema and emitted through Fastify logger plus an injectable test sink.

## Project Structure

```text
product/gateway/
├── src/
│   ├── app.ts
│   ├── auth.ts
│   ├── bulkhead.ts
│   ├── config.ts
│   ├── metrics.ts
│   ├── output-validator.ts
│   ├── rate-limiter.ts
│   ├── render-service.ts
│   └── renderer.ts
└── test/
    ├── app.test.ts
    ├── auth.test.ts
    ├── bulkhead.test.ts
    ├── config.test.ts
    ├── output-validator.test.ts
    └── render-service.test.ts
```

**Structure Decision**: Keep the current Gateway package and extract focused trust-boundary services; no new deployable component.

## Verification

1. Gateway-focused typecheck and tests.
2. Full product contract/typecheck/test/build.
3. Dependency audit.
4. Compose SVG smoke for four engines and operational endpoints.
5. Documentation maintenance against SRS, SDD, OpenAPI, Test Plan and deployment docs.
