# Data Model: Gateway Production Baseline

## Principal

| Field | Type | Rule |
|---|---|---|
| `subject` | string | Stable non-secret identity, e.g. `api-key:key-id` or `local`. |
| `authMethod` | enum | `api-key` or `local`. |
| `scopes` | string array | Must contain `diagram:render` for render routes. |
| `cachePartition` | string | Stable partition included in cache/single-flight key. |

## API Key Record

| Field | Type | Rule |
|---|---|---|
| `id` | string | Unique, log-safe identifier. |
| `verifier` | string | `sha256:` followed by 64 lowercase hex characters. |
| `scopes` | string array | Non-empty, unique values. |
| `cachePartition` | string | Defaults to key ID. |
| `status` | enum | `active` or `revoked`. |

## Render Event

| Field | Type | Rule |
|---|---|---|
| `requestId` | string | Always present. |
| `principalSubject` | string | Stable ID, never raw credential. |
| `engine` / `format` | string | Present after request validation. |
| `durationMs` | number | Non-negative integer. |
| `statusCode` | number | Final HTTP status. |
| `cache` | enum | `HIT`, `MISS`, `BYPASS` when render reached cache layer. |
| `errorCode` | string | Present for normalized problem response. |

## State Transitions

- API key: configured active -> configured revoked; reactivation requires explicit config change.
- Admission: immediate permit -> running -> released; queued -> running -> released; queued -> rejected only when queue already full.
- Output: raw -> size accepted -> format validated/sanitized -> cacheable; any failure terminates without cache write.
