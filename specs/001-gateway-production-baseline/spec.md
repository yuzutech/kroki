# Feature Specification: Gateway Production Baseline

**Feature Branch**: `current-worktree`

**Created**: 2026-07-22

**Status**: Approved for implementation

**Input**: Hoàn thiện Phase 1 trong `docs/ImplementationPlan.md`, work package `P1-01` đến `P1-12`.

## User Scenarios & Testing

### User Story 1 - Render an toàn theo principal (Priority: P1)

Người dùng đã được cấp quyền render có thể gọi Gateway; credential được chuyển thành principal ổn định, scope được kiểm tra và dữ liệu cache không bị chia sẻ giữa principal không cùng partition.

**Independent Test**: Gửi cùng source bằng hai key khác partition, key thiếu scope và key revoked; xác nhận cache isolation, 403 và 401 tương ứng.

**Acceptance Scenarios**:

1. **Given** API key active có scope `diagram:render`, **When** gọi render, **Then** request được xử lý với principal không chứa raw credential.
2. **Given** API key active thiếu scope, **When** gọi render, **Then** Gateway trả 403 và không gọi renderer.
3. **Given** API key revoked hoặc không hợp lệ, **When** gọi render, **Then** Gateway trả 401.
4. **Given** hai principal khác cache partition, **When** render cùng input, **Then** không dùng chung cache entry.

### User Story 2 - Bảo vệ tài nguyên và output (Priority: P1)

Operator có thể giới hạn concurrent render, queue, request, response và deadline; output renderer chỉ được trả sau khi xác minh an toàn.

**Independent Test**: Giữ renderer bận, lấp queue, trả SVG active/PNG sai signature/output quá lớn và xác nhận error/cleanup.

**Acceptance Scenarios**:

1. **Given** concurrency và queue đã đầy, **When** có request mới, **Then** Gateway trả 429 mà không vượt concurrency.
2. **Given** render timeout/error, **When** request kết thúc, **Then** permit luôn được giải phóng.
3. **Given** SVG chứa script, event handler hoặc external resource, **When** renderer trả output, **Then** active content không tới client/cache.
4. **Given** PNG sai signature hoặc output vượt giới hạn, **When** renderer trả output, **Then** Gateway trả structured error và không cache output.

### User Story 3 - Vận hành có quan sát và cấu hình an toàn (Priority: P1)

Operator có log/metrics đủ chẩn đoán mà không lộ source hoặc credential, đồng thời cấu hình không an toàn bị từ chối khi khởi động.

**Independent Test**: Gửi source/key marker, tạo success/error/rate-limit/cache hit rồi kiểm tra log/metrics không chứa marker và có dimension bắt buộc.

**Acceptance Scenarios**:

1. **Given** request hoàn tất, **When** ghi event, **Then** event có requestId, principal ID, engine, format, duration, status và cache result nếu có.
2. **Given** source và credential có marker bí mật, **When** request hoàn tất, **Then** marker không có trong log hoặc metrics.
3. **Given** production profile với no-auth và bind non-loopback, **When** load config, **Then** Gateway fail fast.
4. **Given** giới hạn runtime ngoài khoảng cho phép, **When** load config, **Then** Gateway fail fast với tên biến cấu hình.

### Edge Cases

- Nhiều request cùng cache key chờ một render chỉ chiếm một permit.
- Request `no-store` vẫn chịu bulkhead, output validation và sanitization.
- SVG malformed, không có root `<svg>` hoặc chứa external URL trong style/href.
- Key record trùng ID, verifier sai format, scope rỗng hoặc status không hợp lệ.
- Metrics bị tắt không được expose endpoint.
- Local no-auth dùng principal riêng, rate limit và cache partition ổn định.

## Requirements

### Functional Requirements

- **FR-001**: Gateway MUST chuyển API key hoặc local no-auth thành principal có subject, auth method, scopes và cache partition.
- **FR-002**: Gateway MUST xác minh key bằng verifier, hỗ trợ active/revoked records và từ chối principal thiếu `diagram:render`.
- **FR-003**: Cache key MUST gồm principal partition, renderer version và sanitizer version, không chứa source hoặc credential plaintext.
- **FR-004**: Gateway MUST giới hạn concurrent backend render và bounded pending queue; request vượt capacity nhận structured 429.
- **FR-005**: Gateway MUST giới hạn response body trước khi cache/trả client.
- **FR-006**: Gateway MUST sanitize SVG active content và validate PNG signature trước cache/trả client.
- **FR-007**: Gateway MUST ghi structured completion event nhưng không ghi source, credential hoặc Authorization header.
- **FR-008**: Gateway SHOULD expose aggregate Prometheus metrics khi được bật, không dùng source/principal làm label.
- **FR-009**: Runtime limits MUST cấu hình được và fail fast khi ngoài khoảng an toàn.
- **FR-010**: Production profile MUST từ chối no-auth khi bind non-loopback.
- **FR-011**: Mọi failure mới MUST dùng `application/problem+json`, request ID và machine-readable code.
- **FR-012**: Existing OpenAPI render routes, cache modes và four-engine SVG behavior MUST remain backward compatible.

### Key Entities

- **Principal**: Identity đã xác thực gồm subject, method, scopes và cache partition.
- **API Key Record**: Key ID, verifier hash, scopes, cache partition và active/revoked status.
- **Render Admission**: Permit hoặc queue position bảo vệ backend concurrency.
- **Validated Output**: Binary sau size guard và SVG/PNG trust validation.
- **Gateway Event**: Structured, redacted completion record.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Không có request test nào vượt quá concurrent render limit đã cấu hình.
- **SC-002**: 100% permit được trả lại sau success, renderer error và timeout.
- **SC-003**: 100% fixture SVG active bị loại bỏ/reject trước client và cache.
- **SC-004**: Không có secret/source marker trong log và metrics test output.
- **SC-005**: Hai cache partition khác nhau luôn tạo backend miss độc lập.
- **SC-006**: Tất cả Gateway unit/integration tests và OpenAPI contract check pass.

## Assumptions

- API key provisioning UI và OIDC thuộc phase sau; Phase 1 quản lý lifecycle bằng mounted secret/environment records.
- In-memory cache, rate limiter, metrics và key store phù hợp deployment một Gateway replica của MVP.
- SVG không hợp lệ hoặc không thể sanitize an toàn bị reject thay vì trả nguyên trạng.
- Metrics endpoint là operational endpoint và chỉ tồn tại khi cấu hình bật.
