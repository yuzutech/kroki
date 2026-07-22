# Research: Gateway Production Baseline

## Decisions

| Topic | Decision | Reason |
|---|---|---|
| Credential verification | SHA-256 verifier records with constant-time comparison | Matches self-hosted secret configuration without storing plaintext in policy records. |
| SVG handling | DOM parse, deny active elements/attributes and external references, serialize | Structured processing is safer and more testable than regex rewriting. |
| Admission control | In-memory semaphore with bounded FIFO queue | Matches one-replica MVP and synchronous HTTP ADR. |
| Metrics | Minimal Prometheus exposition with low-cardinality labels | Avoids a telemetry backend dependency while meeting operational needs. |
| Logging | Allowlisted completion event, Pino/Fastify output, injectable sink | Prevents accidental source/header logging and enables deterministic tests. |
| Output errors | Structured 502 problems | Distinguishes invalid upstream output from user syntax and Gateway internal errors. |

## Deferred

- OIDC/JWKS and immutable GitHub repository policy
- Redis/shared cache/rate state
- Administrative credential API/UI
- Multi-backend load balancing
