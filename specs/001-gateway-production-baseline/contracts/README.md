# Contract Delta

Existing OpenAPI v1 routes and successful binary responses remain unchanged.

Phase 1 adds documented `502` problem responses:

- `INVALID_RENDER_OUTPUT`: renderer returned malformed or unsafe output for the requested media type.
- `RENDER_OUTPUT_TOO_LARGE`: renderer output exceeded the configured byte limit.

The existing `429` response also covers `RENDER_CAPACITY_EXCEEDED` when render concurrency and pending queue are full.

`/metrics` is an operational endpoint enabled by deployment configuration and is not part of the public rendering API contract.
