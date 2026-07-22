# Kế hoạch kiểm thử phần mềm

## Diagram as Code - Rendering Service and Toolchain

| Thuộc tính | Giá trị |
|---|---|
| Phiên bản | 1.0 |
| Trạng thái | Baseline kiểm thử theo kiến trúc đích |
| Tài liệu đầu vào | docs/SRS.md, docs/SDD.md, docs/openapi.yaml |
| Phạm vi | Gateway, Kroki fork/renderers, cache, cấu hình dùng chung, VS Code Extension, GitHub Action và vận hành |
| Engine MVP | Mermaid, PlantUML/C4-PlantUML, Graphviz/DOT, D2 |

> SDD có thể mô tả module chưa được triển khai. Test case chỉ trở thành kiểm thử bắt buộc khi module tương ứng đã sẵn sàng; tài liệu này không khẳng định mọi thành phần đã tồn tại.

## 1. Mục tiêu và phạm vi

| Mục tiêu | Tiêu chí |
|---|---|
| Render đúng | Bốn engine MVP render được SVG; PNG chỉ áp dụng khi engine công bố hỗ trợ qua /api/v1/engines. |
| Giữ đúng contract | Route, schema, media type, status, header và error body khớp OpenAPI. |
| Bảo vệ hệ thống | Auth, rate limit, body limit, timeout, bulkhead, cache isolation và SVG sanitization hoạt động. |
| Nhất quán toolchain | Extension và Action dùng cùng .diagram.yml, engine mapping và output planner. |
| Bảo vệ repository | PR check không ghi file; generate/commit chỉ thay đổi generated output theo cấu hình và quyền đã cấp. |
| Đạt NFR | Health, cache hit, render latency và workspace render đạt ngưỡng SRS trên cấu hình tham chiếu. |

| Trong phạm vi | Ngoài phạm vi MVP |
|---|---|
| API JSON, text/plain, GET encoded, health, engine discovery | PDF |
| Mermaid, PlantUML/C4, Graphviz/DOT, D2 | BPMN và renderer Kroki khác |
| Local no-auth, API key; OIDC theo priority Should | GitHub App, billing, quota theo ngày |
| VS Code desktop, GitHub Action Linux runner | VS Code Web, language server chuyên sâu |

## 2. Test Strategy

### 2.1 Chiến lược theo module

| Module | Unit test | Integration test | End-to-end test |
|---|---|---|---|
| Gateway | Validator, canonicalizer, option allowlist, request ID, error mapper, auth/principal/scope, token bucket, cache key và policy; dùng fake clock/backend. | Gateway thật với Kroki stub/cache thật; kiểm tra HTTP contract, deadline, cache, tenant isolation và 4xx/5xx. | Client -> Gateway -> Kroki qua HTTPS/Compose; xác nhận binary, header, log và metric. |
| Kroki/renderers | Registry, format capability, error parser, timeout/process cleanup và secure defaults. | Renderer thật: PlantUML/C4 JVM, Graphviz/D2 CLI, Mermaid companion; valid/invalid fixture từng engine. | Luồng đầy đủ, companion down, process timeout và output deterministic. |
| Cache | Key, TTL, no-store, single-flight và version invalidation. | In-memory LRU; Redis khi có; cache unavailable và concurrent miss. | Quan sát MISS -> HIT; đổi tenant/options/version phải MISS. |
| Shared config | JSON Schema, parser, precedence, glob, engine map và deterministic path. | Cùng fixture qua package dùng chung. | Extension và Action tạo cùng output path/format. |
| VS Code | Debounce, sequence/cancellation, diagnostic mapping, atomic write, SecretStorage wrapper. | Extension Host với mock Gateway trả delayed/error/binary response. | VS Code desktop + Gateway: unsaved preview, diagnostics, export, render-on-save. |
| GitHub Action | Input parser, change detector, auth provider, stale comparator, annotation và commit selection. | Action runner với mock/real Gateway; API key/OIDC, artifact, exit code. | Workflow trên public/private test repo: PR check, generate, optional trusted commit. |
| Operations | Config/fail-fast, health aggregation, log redaction và metric labels. | Docker Compose, network exposure, restart và dependency failure. | Chỉ Gateway public; readiness và phục hồi renderer đúng. |

### 2.2 Mức kiểm thử và lịch chạy

| Tầng | Khi chạy | Chính sách |
|---|---|---|
| Unit | Mọi pull request | Không phụ thuộc network/process ngoài; lỗi làm fail PR. |
| Contract/integration | PR thay đổi module liên quan | Fixture và renderer version được pin; lỗi P0 làm fail PR. |
| Docker E2E | PR vào main và nightly | Lưu log/artifact khi lỗi. |
| VS Code E2E | PR extension và nightly đa nền tảng | Extension Host headless; smoke thủ công trước release. |
| GitHub E2E | Test repo trước release | Tách public/private; không dùng production credential. |
| Performance/security | Nightly và release candidate | Môi trường cố định; lưu p50/p95/p99 và bằng chứng redaction. |

### 2.3 Kỹ thuật và priority

| Kỹ thuật | Áp dụng |
|---|---|
| Phân vùng tương đương | Engine/format/alias hợp lệ và không hợp lệ; auth mode. |
| Giá trị biên | Source rỗng, 1 MiB, 1 MiB + 1 byte; timeout; debounce 200/400/2000 ms. |
| Contract | Validate OpenAPI 3.2.0 và JSON Schema của .diagram.yml. |
| Fault injection | Kroki/worker/cache down, renderer treo, queue đầy, response sai thứ tự. |
| Security negative | Include local/remote, command injection, SVG active content, credential leakage. |
| Golden fixture | So sánh sau canonicalization theo renderer/sanitizer version; cập nhật phải review. |

| Priority | Ý nghĩa |
|---|---|
| P0 | Chặn release: vi phạm Must, bảo mật, sai/mất dữ liệu hoặc sửa repository ngoài ý muốn. |
| P1 | Chức năng chính suy giảm hoặc yêu cầu Should quan trọng không đạt. |
| P2 | Tính năng Could hoặc UX phụ. |

## 3. Test Environment

### 3.1 Môi trường tham chiếu

| Môi trường | Thành phần | Mục đích |
|---|---|---|
| Unit | Node.js 24/TypeScript cho Gateway và toolchain; Java 25/Maven cho Kroki; fake clock/filesystem/HTTP | Logic cô lập, tái lập được. |
| Integration | Linux container; Gateway :8080; Kroki :8000; Mermaid :8002; in-memory LRU; renderer pin version | Contract và renderer thật. |
| E2E local | Docker Compose, chỉ expose Gateway; volume tạm | API, health, failure và security boundary. |
| VS Code E2E | VS Code stable và phiên bản tối thiểu hỗ trợ; Windows/Linux | Webview, SecretStorage, filesystem. |
| GitHub E2E | GitHub-hosted Ubuntu; public/private test repo; protected branch | Permission, secret, OIDC, artifact, commit. |
| Performance | Linux runner riêng, tài nguyên cố định, không có job khác | Đo p95 và workspace 100 diagram. |

### 3.2 Cấu hình baseline

| Biến/giới hạn | Giá trị |
|---|---|
| GATEWAY_BODY_LIMIT / response limit | 1 MiB sau decode / 10 MiB |
| Render timeout / concurrency / pending | 15 giây / 4 / 20 |
| Rate limit | 60 request/phút/principal, burst 10 |
| Cache | In-memory LRU, TTL 24 giờ |
| VS Code debounce | 400 ms |

Rate-limit integration test được phép dùng profile nhỏ hơn, ví dụ 6/phút và burst 2, để chạy xác định nhưng phải giữ nguyên semantics.

### 3.3 Test data, entry và exit

| Hạng mục | Yêu cầu |
|---|---|
| Diagram fixture | Mỗi engine có valid tối giản/phức tạp, syntax error có vị trí và source gần giới hạn. |
| Security fixture | Include local/remote, command injection và SVG có script/external URL; chỉ trỏ test endpoint cô lập. |
| Credential | API key valid/revoked/thiếu scope; OIDC đúng/sai issuer, audience, expiry, repo ID, workflow; không commit plaintext. |
| Git fixture | Output current/missing/stale; source và file không liên quan; branch trusted/untrusted. |
| Entry | Build pass; fixture/version pin; contract/schema có sẵn; environment ready; test secret tối thiểu. |
| Exit MVP | 100% P0 pass; không còn Critical/High; >=95% P1 pass; bốn engine có happy/error path ở unit, integration, E2E. |
| Exit release | Contract và security pass; NFR Must đạt; public/private GitHub smoke pass; bằng chứng test được lưu. |

## 4. Test Case List

### 4.1 Rendering Service

| ID | Module | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-REN-001 | Mermaid | Mermaid ready | POST JSON Mermaid hợp lệ, format SVG. | 200 image/svg+xml; SVG parse được; request/engine/version/cache header hợp lệ. | P0 |
| TC-REN-002 | Mermaid | Metadata có PNG | Render cùng source sang PNG. | 200 image/png; đúng PNG signature; không rỗng, <=10 MiB. | P0 |
| TC-REN-003 | PlantUML | Renderer ready | Render sequence diagram sang SVG và PNG. | Format được công bố đều trả 200, đúng media type. | P0 |
| TC-REN-004 | C4-PlantUML | Alias c4plantuml có trong metadata | Render C4 Context tối giản. | Route đúng PlantUML/C4; SVG và renderer metadata hợp lệ. | P0 |
| TC-REN-005 | Graphviz | Renderer ready | Render digraph G { A -> B } sang SVG/PNG. | Mọi format được công bố trả output hợp lệ. | P0 |
| TC-REN-006 | DOT alias | Alias dot có trong metadata | Render cùng DOT source qua dot. | Output tương đương graphviz cùng version/options. | P0 |
| TC-REN-007 | D2 | Renderer ready | Render client -> gateway -> renderer sang SVG. | 200; SVG và engine/version header hợp lệ. | P0 |
| TC-REN-008 | D2 | Metadata chỉ công bố SVG | Yêu cầu D2 PNG. | 400 UNSUPPORTED_FORMAT; renderer không chạy. | P0 |
| TC-REN-009 | POST text | Valid credential | POST text/plain theo engine/format path. | Render đúng; success/error contract giống JSON endpoint. | P0 |
| TC-REN-010 | GET encoded | Encoded fixture chuẩn Kroki | GET source deflate + Base64 URL-safe. | Output tương đương POST cùng source/options. | P0 |
| TC-REN-011 | Discovery | Một optional worker down | GET /api/v1/engines. | Có engine, alias, format, version, availability; lỗi một engine không làm sai engine khác. | P0 |
| TC-REN-012 | Determinism | Cache bypass; version cố định | Render hai lần cùng input. | Canonical byte/hash giống nhau trong giới hạn engine. | P1 |

### 4.2 Validation và lỗi

| ID | Module | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-VAL-001 | Validation | Gateway ready | POST source rỗng. | 400, problem JSON có code/message/requestId; backend không được gọi. | P0 |
| TC-VAL-002 | Validation | Gateway ready | Gửi engine không tồn tại. | 400 UNSUPPORTED_ENGINE; không render. | P0 |
| TC-VAL-003 | Validation | Gateway ready | Gửi format không hỗ trợ. | 400 UNSUPPORTED_FORMAT; không render. | P0 |
| TC-VAL-004 | Validation | Gateway ready | Gửi malformed JSON/sai kiểu option. | 400; không lộ stack trace. | P0 |
| TC-VAL-005 | Content type | Gateway ready | POST content type không hỗ trợ. | Bị từ chối theo OpenAPI/error contract; backend không được gọi. | P0 |
| TC-VAL-006 | Body limit | Có source 1 MiB và 1 MiB + 1 byte sau decode | Gửi lần lượt hai source. | Boundary hợp lệ được xử lý; vượt limit trả 413 trước renderer. | P0 |
| TC-VAL-007 | URL decode | Gateway ready | Gửi Base64/deflate hỏng. | 400 INVALID_ENCODED_SOURCE; không lộ chi tiết nội bộ. | P0 |
| TC-VAL-008 | URI limit | Proxy có URI limit | Gửi URL vượt giới hạn. | 414; không render/ghi source vào log. | P1 |
| TC-VAL-009 | Mermaid error | Renderer ready | Render syntax lỗi. | 422; engine/requestId và line/column khi renderer cung cấp. | P0 |
| TC-VAL-010 | PlantUML/C4 error | Renderer ready | Render syntax lỗi. | 422; stderr chuẩn hóa, không stack trace. | P0 |
| TC-VAL-011 | Graphviz error | Renderer ready | Render DOT syntax lỗi. | 422; detail/vị trí tối đa engine cung cấp. | P0 |
| TC-VAL-012 | D2 error | Renderer ready | Render D2 syntax lỗi. | 422; process được thu hồi; body đúng contract. | P0 |
| TC-VAL-013 | Request ID | Gateway ready | Gửi một request pass và một request fail. | Header luôn có ID; error body trùng header; hai ID khác nhau. | P0 |

### 4.3 Auth, rate limit, cache và security

| ID | Module | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-SEC-001 | Local auth | Bind loopback, local no-auth | Render không Authorization. | Được phép; principal local vẫn chịu policy/rate limit. | P0 |
| TC-SEC-002 | API key | API-key mode | Gửi thiếu, sai, revoked key. | 401; key không xuất hiện body/log/metric. | P0 |
| TC-SEC-003 | Scope | Key hợp lệ thiếu diagram:render | Render. | 403; renderer không nhận request. | P0 |
| TC-SEC-004 | OIDC | OIDC enabled | Thử sai issuer/audience, hết hạn, sai repo/workflow. | Bị từ chối đúng 401/403; token/claim nhạy cảm không bị log. | P1 |
| TC-SEC-005 | Repo policy | Public/private repo ID; allowlist xác định | Xin render bằng OIDC từ từng repo. | Quyết định theo immutable repo ID/workflow, không theo tên/visibility. | P1 |
| TC-RATE-001 | Rate limit | Profile burst 2 | Gửi 3 request tức thời cùng principal. | Hai request nhận; request ba 429, có Retry-After. | P0 |
| TC-RATE-002 | Rate isolation | Hai principal | Làm cạn bucket A rồi gửi B. | A bị 429; B vẫn chạy. | P0 |
| TC-RATE-003 | Admission | Concurrency 4, queue nhỏ | Giữ renderer bận, gửi vượt queue. | Không vượt concurrency; dư trả 429/503; slot luôn được giải phóng. | P0 |
| TC-CACHE-001 | Cache | Cache sạch | Render cùng request hai lần. | MISS rồi HIT; renderer chỉ chạy một lần. | P0 |
| TC-CACHE-002 | Cache key | Cache warm | Đổi options, format, renderer/sanitizer version. | Mỗi thay đổi ảnh hưởng output tạo miss/key mới. | P1 |
| TC-CACHE-003 | Tenant cache | Hai private principal cùng input | Render bằng A rồi B. | B không dùng entry A; source/credential không nằm plaintext trong key. | P0 |
| TC-CACHE-004 | No-store | Principal được phép | Render hai lần với no-store. | Không tạo entry; cả hai bypass. | P1 |
| TC-CACHE-005 | Degradation | Backend khỏe, cache lỗi | Render. | Vẫn thành công no-cache; có log/metric degradation. | P1 |
| TC-SEC-006 | Include security | Test endpoint cô lập | Gửi remote/local/internal include. | Bị chặn; không outbound/đọc file; không rò nội dung. | P0 |
| TC-SEC-007 | SVG sanitizer | Worker trả SVG có script/event/external URL | Render qua Gateway. | Active content bị loại; SVG còn parse được. | P0 |
| TC-SEC-008 | Timeout | Renderer treo >15 giây | Render rồi gửi request kế tiếp. | 504; request/process hủy; slot được trả. | P0 |
| TC-SEC-009 | Unavailable | Dừng Kroki/worker | Render engine tương ứng. | 503 rõ renderer unavailable, không generic 500; engine độc lập còn chạy. | P0 |
| TC-SEC-010 | Log redaction | Structured log bật | Render private source với credential canary. | Log chỉ chứa metadata cho phép; không source/key/token. | P0 |
| TC-SEC-011 | Output size | Renderer stream output vượt 10 MiB hoặc giới hạn cấu hình | Render qua Gateway. | Dừng đọc stream, trả 502 `RENDER_OUTPUT_TOO_LARGE`, không cache output. | P0 |
| TC-SEC-012 | Output media type | Kroki trả 2xx nhưng sai `Content-Type`, SVG root sai hoặc PNG signature sai | Render qua Gateway. | Trả 502 `INVALID_RENDER_OUTPUT`, không cache output. | P0 |

### 4.4 Health và hiệu năng

| ID | Module | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-OPS-001 | Health | Stack healthy | Gọi ba health route đủ mẫu. | 200, schema hợp lệ, p95 <=500 ms nội bộ. | P0 |
| TC-OPS-002 | Readiness | Dependency thiết yếu down | Gọi live và ready/health. | Live 200; ready/health 503 với failed check. | P0 |
| TC-OPS-003 | Metrics | Tạo hit/miss/error/timeout | Thu metrics. | Counter/latency đúng; không source/credential trong label. | P1 |
| TC-PERF-001 | Cache latency | Cache warm | Đo đủ mẫu hit. | p95 <=300 ms, không tính WAN. | P0 |
| TC-PERF-002 | Render latency | Valid source <=100 KiB | Đo từng engine dưới tải chuẩn. | p95 <=10 giây hoặc có báo cáo riêng cho mục tiêu Should. | P1 |
| TC-PERF-003 | Workspace | 100 diagram đủ engine | Chạy full generate. | <=5 phút; đủ output đúng path. | P1 |

### 4.5 VS Code Extension

| ID | Module | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-VSC-001 | Recognition | Extension installed | Mở .mmd, .puml, .plantuml, .dot, .d2. | Ánh xạ đúng engine; preview command khả dụng. | P0 |
| TC-VSC-002 | Live preview | Gateway reachable | Mở preview, sửa chưa save, chờ debounce. | Một request cho trạng thái cuối; panel cập nhật, không đóng. | P0 |
| TC-VSC-003 | Stale response | Mock trả response cũ muộn | Sửa hai lần nhanh. | Hủy/bỏ response cũ; chỉ hiện source mới nhất. | P0 |
| TC-VSC-004 | Diagnostics | Error có line/column | Render lỗi rồi sửa đúng. | Problems đúng file/vị trí; diagnostic cũ được xóa. | P0 |
| TC-VSC-005 | Export | Output writable | Export SVG/PNG được hỗ trợ. | Đúng path/media/signature; ghi atomic, không partial. | P0 |
| TC-VSC-006 | Save mặc định | Setting mới, render-on-save tắt | Save diagram. | Không tạo/ghi output. | P0 |
| TC-VSC-007 | Render-on-save | Bật setting, config valid | Save source đúng rồi source lỗi. | Lần đầu ghi đúng; lần lỗi không ghi đè file cũ, có lỗi rõ. | P0 |
| TC-VSC-008 | Shared config | Có default/override | Render fixture dùng chung với Action. | Format/theme/output path giống Action. | P0 |
| TC-VSC-009 | Connection | Local/hosted/bad URL | Chạy check connection. | Hiện health/engines hoặc lỗi rõ; giữ preview cũ khi mất kết nối. | P1 |
| TC-VSC-010 | Secret/Webview | Hosted cần key | Lưu key, restart host, preview; inspect log/settings. | Key chỉ ở SecretStorage; CSP chặn resource/script không phép; không rò key. | P0 |

### 4.6 GitHub Action

| ID | Module | Precondition | Steps | Expected Result | Priority |
|---|---|---|---|---|---|
| TC-GHA-001 | Check | Config valid; output current | Chạy Action mặc định trên PR. | Render qua Gateway, exit 0; repository không đổi. | P0 |
| TC-GHA-002 | Annotation | Source syntax lỗi có line | Chạy workflow. | Exit khác 0; annotation đúng file/line; summary rõ. | P0 |
| TC-GHA-003 | Stale | Generated image cũ | Chạy check. | Fail, báo stale, upload preview mới; không ghi/commit repo. | P0 |
| TC-GHA-004 | Missing | Xóa generated file | Chạy check. | Fail, báo thiếu, upload output đề xuất. | P0 |
| TC-GHA-005 | Artifact | Nhiều engine, một lỗi | Chạy check. | Artifact đúng path, không chứa secret/source ngoài cấu hình. | P1 |
| TC-GHA-006 | API key | Private repo có secret | Chạy với key đúng rồi sai. | Đúng thì pass; sai fail rõ; key được mask khỏi log/artifact. | P0 |
| TC-GHA-007 | OIDC | id-token: write; repo allowlisted | Chạy public/private repo không render secret. | Repo hợp lệ render; claim sai bị từ chối; không cần PAT. | P1 |
| TC-GHA-008 | PR permission | Fork/untrusted PR; contents read | Chạy mode mặc định. | Không commit/push; không đưa secret vào fork; auth failure rõ nếu OIDC chưa có. | P0 |
| TC-GHA-009 | Generate | Trusted branch; writable | Chạy generate, commit false. | Ghi đúng SVG/PNG; không commit; exit 0 khi thành công. | P0 |
| TC-GHA-010 | Commit ảnh | Trusted push/manual; commit true; contents write | Đổi hai diagram và file không liên quan; chạy Action. | Một commit theo policy, chỉ stage generated output/manifest; ảnh đúng path/nội dung; file khác và source không bị sửa. | P0 |
| TC-GHA-011 | Commit guard | PR/fork hoặc untrusted branch | Chạy với commit true. | Từ chối/bỏ qua commit có thông báo; không push hay mở rộng quyền. | P0 |
| TC-GHA-012 | Change detector | PR chỉ đổi một source | Check PR rồi full render main. | PR chỉ render file ảnh hưởng; main render full theo policy. | P1 |
| TC-GHA-013 | Invalid config | Config sai/path traversal | Chạy Action. | Fail trước render; chỉ field lỗi; không ghi ngoài workspace/output. | P0 |
| TC-GHA-014 | Gateway failure | Gateway trả 429/503/504 | Chạy Action. | Exit khác 0; phân biệt lỗi, hiện requestId/Retry-After; không commit partial. | P0 |

## 5. Traceability và báo cáo

| Nhóm test | Requirement chính |
|---|---|
| TC-REN-*, TC-VAL-* | FR-001..014, FR-030..037 |
| TC-SEC-*, TC-RATE-*, TC-CACHE-* | FR-020..028, FR-034..037; NFR-SEC, NFR-AVL |
| TC-OPS-*, TC-PERF-* | FR-090..095; NFR-PERF, NFR-SCL, NFR-AVL |
| TC-VSC-* | FR-040..046, FR-050..062 |
| TC-GHA-* | FR-040..046, FR-070..082 |

Mỗi lần chạy release phải lưu commit SHA, image/renderer versions, cấu hình đã loại secret, kết quả JUnit/JSON, log redaction, artifact lỗi và p50/p95/p99. Defect phải liên kết test case ID và requirement ID; thay đổi golden output phải nêu renderer/sanitizer version.
