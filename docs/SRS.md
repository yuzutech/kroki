# Đặc tả yêu cầu phần mềm

## Diagram as Code - Rendering Service and Toolchain

| Thuộc tính | Giá trị |
|---|---|
| Tài liệu | Software Requirements Specification (SRS) |
| Sản phẩm | Diagram as Code - Rendering Service and Toolchain |
| Phiên bản tài liệu | 1.0 |
| Trạng thái | Bản nháp chờ phê duyệt |
| Chuẩn tham chiếu | IEEE 830-1998 |
| Phạm vi phiên bản | MVP và các yêu cầu mở rộng đã được ưu tiên |

### Lịch sử thay đổi

| Phiên bản | Ngày | Nội dung |
|---|---|---|
| 1.0 | 2026-07-22 | Khởi tạo SRS từ định hướng sản phẩm đã thống nhất |

## 1. Giới thiệu

### 1.1 Mục đích

| Mục | Mô tả |
|---|---|
| Mục đích | Đặc tả đầy đủ yêu cầu chức năng và phi chức năng cho nền tảng Diagram as Code self-hosted. |
| Đối tượng đọc | Mentor, Business Analyst, Product Owner, lập trình viên backend, lập trình viên VS Code Extension, DevOps, QA và người vận hành. |
| Mục tiêu sử dụng | Làm cơ sở thiết kế kiến trúc, chia backlog, lập kế hoạch kiểm thử, nghiệm thu MVP và quản lý thay đổi phạm vi. |
| Quy ước | `Must` là bắt buộc cho MVP; `Should` là quan trọng cho phiên bản hoàn thiện gần nhất; `Could` là phần mở rộng khi còn nguồn lực. |

### 1.2 Phạm vi

| Trong phạm vi | Ngoài phạm vi MVP |
|---|---|
| Diagram Gateway cung cấp API render thống nhất | Billing, subscription plan và render credit |
| Kroki fork làm rendering backend | Multi-tenant SaaS dashboard đầy đủ |
| Mermaid, PlantUML/C4, Graphviz/DOT và D2 | Hỗ trợ toàn bộ renderer của Kroki |
| Đầu ra SVG và PNG; API có khả năng mở rộng PDF | Trình biên tập diagram kéo-thả |
| Cache, API key, rate limit và resource limit | GitHub App/comment bot |
| VS Code live preview, diagnostics, export và render-on-save | Language Server và autocomplete chuyên sâu |
| GitHub Action check/generate và PR artifact | Visual diff nâng cao trong PR |
| Cấu hình `.diagram.yml` dùng chung | Hosted commercial platform |
| Docker Compose cho triển khai self-hosted | Cam kết SLA cho mọi bản self-hosted của người dùng |

Sản phẩm biến diagram source dạng văn bản thành SVG/PNG thông qua một Gateway chung. VS Code Extension và GitHub Action phải sử dụng cùng API contract và cấu hình dự án để kết quả local và CI nhất quán. Kroki fork chỉ đảm nhiệm điều phối và thực thi renderer; các chính sách sản phẩm nằm tại Gateway.

### 1.3 Định nghĩa và từ viết tắt

| Thuật ngữ | Định nghĩa |
|---|---|
| Diagram as Code | Phương pháp lưu sơ đồ dưới dạng văn bản có thể version, diff và review. |
| Diagram source | Nội dung Mermaid, PlantUML, DOT, D2 hoặc ngôn ngữ sơ đồ khác. |
| Gateway | Dịch vụ HTTP tiếp nhận request, xác thực, validate, cache và chuyển render request đến Kroki. |
| Kroki fork | Bản fork được quản lý của Kroki, dùng làm rendering backend và đóng gói các renderer. |
| Renderer | Engine biến diagram source thành ảnh, ví dụ Mermaid hoặc Graphviz. |
| Companion service | Dịch vụ tách riêng mà Kroki gọi để render một số engine, ví dụ Mermaid dùng Chromium. |
| Generated output | Tệp SVG/PNG được sinh từ diagram source. |
| Stale output | Generated output không còn khớp với source, options hoặc renderer version hiện tại. |
| API key | Credential dài hạn do Gateway cấp cho VS Code, CI hoặc client khác. |
| OIDC | OpenID Connect; cơ chế để GitHub Actions cung cấp danh tính workflow ngắn hạn cho Gateway. |
| Principal | Danh tính nội bộ sau khi Gateway xác thực credential. |
| Rate limit | Giới hạn tốc độ request để bảo vệ tài nguyên; không phải quota sử dụng theo ngày. |
| MVP | Minimum Viable Product. |

### 1.4 Tài liệu tham chiếu

| Mã | Tài liệu | Mục đích tham chiếu |
|---|---|---|
| REF-01 | IEEE Std 830-1998, Recommended Practice for Software Requirements Specifications | Cấu trúc và nguyên tắc viết SRS |
| REF-02 | [Kroki documentation](https://docs.kroki.io/kroki/) | API và mô hình rendering backend |
| REF-03 | [GitHub Actions OIDC reference](https://docs.github.com/en/actions/reference/security/oidc) | Claims và xác thực workflow |
| REF-04 | [VS Code Extension API](https://code.visualstudio.com/api) | Webview, diagnostics, configuration và SecretStorage |
| REF-05 | RFC 7519 - JSON Web Token | Xử lý JWT/OIDC token |
| REF-06 | OpenAPI Specification 3.x | Đặc tả contract của Diagram Gateway |

## 2. Mô tả tổng quan

### 2.1 Góc nhìn sản phẩm

| Thành phần | Trách nhiệm | Không chịu trách nhiệm |
|---|---|---|
| Diagram Gateway | Public API, validation, authentication, authorization, rate limit, cache, error normalization, observability | Tự render diagram hoặc chứa logic engine cụ thể |
| Kroki fork | Điều phối renderer, pin version, secure mode, timeout process, structured renderer error | Quản lý GitHub repository, API key hoặc chính sách client |
| Renderer/companion | Biến source thành SVG/PNG/PDF | Xác thực người dùng và quản lý workflow |
| VS Code Extension | Live preview, diagnostics, export, render-on-save | Chạy renderer cục bộ bên trong extension |
| GitHub Action | Validate PR, kiểm tra stale output, generate output và artifact | Cung cấp rendering engine |
| `.diagram.yml` | Cấu hình dự án dùng chung | Lưu Gateway URL hoặc credential cá nhân |

Kiến trúc logic:

```text
VS Code Extension ---- API key/no-auth ----+
                                           |
GitHub Action -------- API key/OIDC --------+--> Diagram Gateway --> Kroki fork
                                           |                          |
HTTP client/Playground ---------------------+                          +--> Local renderers
                                                                      +--> Companion services
```

Gateway là điểm truy cập duy nhất được công khai. Kroki và companion services mặc định chỉ được truy cập trong mạng nội bộ của hệ thống.

### 2.2 Chức năng sản phẩm

| Nhóm | Chức năng tổng quát |
|---|---|
| Rendering | Nhận source, chọn engine/format, render và trả SVG/PNG. |
| Integration | Preview trong VS Code và validate/generate trong GitHub Actions. |
| Consistency | Dùng chung `.diagram.yml`, options, engine version và API contract. |
| Protection | Authentication, rate limit, timeout, source-size limit và renderer isolation. |
| Operability | Health check, engine metadata, request ID, logs và metrics. |

### 2.3 Nhóm người dùng

| Nhóm người dùng | Mô tả | Nhu cầu chính | Kỹ năng dự kiến |
|---|---|---|---|
| Developer | Viết và cập nhật diagram cùng source code | Live preview, lỗi rõ ràng, export nhanh | Biết VS Code và Git |
| Pull request reviewer | Review thay đổi kiến trúc/tài liệu | Xem source diff, trạng thái validation và ảnh kết quả | Biết GitHub PR |
| Repository maintainer | Cấu hình CI và quy tắc generated output | Workflow đơn giản, quyền tối thiểu, hỗ trợ public/private repo | Biết GitHub Actions |
| Platform/DevOps engineer | Triển khai và vận hành hệ thống | Docker Compose, health, metrics, cấu hình bảo mật | Biết container và HTTP |
| API consumer | Gọi render API từ công cụ khác | Contract ổn định, lỗi có cấu trúc | Biết REST API |
| System administrator | Quản lý credential và policy | Cấp/thu hồi API key, allowlist repository | Biết vận hành hệ thống |

### 2.4 Môi trường vận hành

| Thành phần | Môi trường |
|---|---|
| Gateway/Kroki | Linux container; Docker hoặc container runtime tương thích |
| VS Code Extension | VS Code Desktop trên Windows, macOS và Linux |
| GitHub Action | GitHub-hosted hoặc self-hosted Linux runner |
| Network | HTTP cho localhost; HTTPS bắt buộc với hosted/non-local Gateway |
| Storage | In-memory/filesystem cache cho MVP; có thể thay bằng external cache sau MVP |

### 2.5 Ràng buộc

| ID | Ràng buộc |
|---|---|
| CON-01 | Kroki fork phải được giữ gần upstream; chỉ thay đổi khi không thể đáp ứng yêu cầu tại Gateway hoặc bằng configuration. |
| CON-02 | Gateway phải là public entry point duy nhất trong deployment tham chiếu. |
| CON-03 | Source text là source of truth; generated image là build output có thể tái tạo. |
| CON-04 | API key, token và credential không được lưu trong `.diagram.yml` hoặc repository. |
| CON-05 | PR từ public fork không được phụ thuộc bắt buộc vào repository secret trong phiên bản có OIDC. |
| CON-06 | Extension MVP không tự cài Docker, pull image hoặc khởi động renderer. |
| CON-07 | MVP không bao gồm quota theo ngày, billing hoặc subscription plan. |
| CON-08 | Tất cả engine phải chạy trong secure mode và giới hạn tài nguyên. |

### 2.6 Giả định và phụ thuộc

| ID | Giả định/phụ thuộc |
|---|---|
| ASM-01 | Người dùng có sẵn Docker nếu chọn local self-hosted deployment. |
| ASM-02 | GitHub Actions runner có thể kết nối đến Gateway đã cấu hình. |
| ASM-03 | Hosted Gateway có DNS và TLS certificate hợp lệ. |
| ASM-04 | Renderer có thể cho kết quả khác khi nâng version; renderer version phải tham gia cache/manifest. |
| ASM-05 | Không phải renderer nào cũng cung cấp line/column chính xác khi lỗi. |
| ASM-06 | SVG là format chính cho tài liệu Git; PNG dùng khi nền tảng đích không hỗ trợ SVG. |
| ASM-07 | OIDC là `Should`; API key và no-auth local được dùng cho MVP đầu tiên. |

## 3. Yêu cầu chức năng

### 3.1 Module A - Diagram Gateway API

| ID | Mô tả yêu cầu | Priority |
|---|---|---|
| FR-001 | Hệ thống phải cung cấp `POST /api/v1/render` nhận JSON gồm `engine`, `format`, `source` và `options`. | Must |
| FR-002 | Hệ thống phải cung cấp POST text/plain theo đường dẫn chứa engine và format. | Must |
| FR-003 | Hệ thống phải hỗ trợ GET với source được deflate và Base64 URL-safe theo mô hình tương thích Kroki. | Must |
| FR-004 | Gateway phải validate engine, format, content type, source rỗng, kích thước source và options trước khi delegate. | Must |
| FR-005 | Gateway phải trả SVG với `image/svg+xml` và PNG với `image/png`. | Must |
| FR-006 | Gateway phải trả lỗi JSON thống nhất gồm `code`, `message`, `engine`, `requestId` và line/column nếu có. | Must |
| FR-007 | Gateway phải cung cấp `GET /health` cho liveness/readiness. | Must |
| FR-008 | Gateway phải cung cấp `GET /api/v1/engines` trả engine, format và renderer version được hỗ trợ. | Must |
| FR-009 | Gateway phải tạo request ID cho mỗi request và trả ID trong response header và error body. | Must |
| FR-010 | Gateway phải cache kết quả theo engine, format, source, options, tenant context và renderer version. | Must |
| FR-011 | Gateway phải hỗ trợ bỏ qua cache và `no-store` theo policy được phép. | Should |
| FR-012 | Gateway phải ánh xạ theme/options chung sang options phù hợp của từng engine. | Should |
| FR-013 | Gateway có thể cung cấp playground UI gọi cùng public API. | Could |
| FR-014 | Gateway phải phát hiện backend unavailable và trả lỗi service unavailable thay vì generic internal error. | Must |

### 3.2 Module B - Authentication and Policy

| ID | Mô tả yêu cầu | Priority |
|---|---|---|
| FR-020 | Gateway phải hỗ trợ no-auth cho deployment local khi được cấu hình rõ ràng. | Must |
| FR-021 | Gateway phải hỗ trợ API key trong Authorization header. | Must |
| FR-022 | Administrator phải có thể cấp, vô hiệu hóa và thu hồi API key. | Must |
| FR-023 | Sau xác thực, Gateway phải chuyển mọi credential thành một principal chung có subject, auth method và scopes. | Must |
| FR-024 | Gateway phải từ chối principal không có scope `diagram:render`. | Must |
| FR-025 | Gateway phải hỗ trợ GitHub Actions OIDC và validate issuer, audience, expiry, repository và workflow claims. | Should |
| FR-026 | Gateway phải cho phép allowlist GitHub repository theo immutable repository ID. | Should |
| FR-027 | Gateway phải áp dụng rate limit theo IP, API key hoặc GitHub repository principal. | Must |
| FR-028 | Gateway không được yêu cầu GitHub PAT cho luồng render thông thường. | Must |

### 3.3 Module C - Kroki Fork and Rendering Backend

| ID | Mô tả yêu cầu | Priority |
|---|---|---|
| FR-030 | Kroki fork phải điều phối request đến đúng renderer dựa trên engine và format. | Must |
| FR-031 | Backend phải hỗ trợ Mermaid, PlantUML/C4-PlantUML, Graphviz/DOT và D2. | Must |
| FR-032 | Mỗi engine MVP phải hỗ trợ SVG; engine có khả năng phải hỗ trợ PNG. | Must |
| FR-033 | Backend phải pin và công bố version của mỗi renderer. | Must |
| FR-034 | Backend phải thực thi renderer với timeout cấu hình được. | Must |
| FR-035 | Backend phải chạy PlantUML và các engine có include trong secure mode; remote include bị tắt mặc định. | Must |
| FR-036 | Backend phải chuyển stderr/renderer error thành response có cấu trúc tối đa mà engine cho phép. | Must |
| FR-037 | Backend phải cung cấp health status của Kroki và các companion service. | Must |
| FR-038 | Backend có thể hỗ trợ BPMN và các renderer Kroki khác sau MVP. | Could |
| FR-039 | Patch trong Kroki fork phải được ghi tài liệu để có thể đồng bộ upstream. | Should |

### 3.4 Module D - Shared Project Configuration

| ID | Mô tả yêu cầu | Priority |
|---|---|---|
| FR-040 | Hệ thống phải hỗ trợ `.diagram.yml` tại repository root. | Must |
| FR-041 | File cấu hình phải khai báo source patterns, output directory, default format và theme. | Must |
| FR-042 | VS Code Extension và GitHub Action phải dùng cùng parser và validation rules cho `.diagram.yml`. | Must |
| FR-043 | Hệ thống phải cung cấp JSON Schema và thông báo rõ field cấu hình không hợp lệ. | Should |
| FR-044 | Gateway URL và credential không được đọc từ `.diagram.yml` nếu việc đó khiến credential bị commit. | Must |
| FR-045 | Output path của một source phải xác định và giống nhau giữa VS Code và GitHub Action. | Must |
| FR-046 | Cấu hình theo file/engine có thể override default project. | Should |

### 3.5 Module E - VS Code Extension

| ID | Mô tả yêu cầu | Priority |
|---|---|---|
| FR-050 | Extension phải nhận diện file `.mmd`, `.puml`, `.plantuml`, `.dot` và `.d2`. | Must |
| FR-051 | Người dùng phải có thể mở live preview bên cạnh editor. | Must |
| FR-052 | Preview phải render nội dung chưa save sau một khoảng debounce cấu hình được. | Must |
| FR-053 | Extension phải hủy hoặc bỏ qua response cũ khi source đã thay đổi. | Must |
| FR-054 | Extension phải cập nhật preview mà không tự động đóng panel. | Must |
| FR-055 | Extension phải chuyển renderer error thành VS Code diagnostics và Problems entries. | Must |
| FR-056 | Extension phải xóa diagnostic cũ sau khi source render thành công. | Must |
| FR-057 | Người dùng phải có thể export diagram thành SVG và PNG. | Must |
| FR-058 | Extension phải hỗ trợ render-on-save và cho phép tắt/bật; mặc định là tắt. | Must |
| FR-059 | Extension phải cho phép cấu hình local hoặc hosted Gateway URL. | Must |
| FR-060 | Extension phải lưu API key bằng VS Code SecretStorage. | Must |
| FR-061 | Extension phải cung cấp command kiểm tra kết nối Gateway và hiển thị engine availability. | Should |
| FR-062 | Preview phải có zoom in, zoom out, fit-to-view và reset. | Should |
| FR-063 | Extension có thể preview fenced diagram block tại vị trí con trỏ trong Markdown. | Could |
| FR-064 | Extension có thể hỗ trợ VS Code Web sau MVP. | Could |

### 3.6 Module F - GitHub Action

| ID | Mô tả yêu cầu | Priority |
|---|---|---|
| FR-070 | Action phải đọc `.diagram.yml` và gọi cùng Gateway API như VS Code Extension. | Must |
| FR-071 | Action phải có chế độ `check` không sửa repository. | Must |
| FR-072 | Trong `check`, Action phải render và fail nếu diagram source không hợp lệ. | Must |
| FR-073 | Action phải tạo GitHub annotation tại file và line khi error cung cấp vị trí. | Must |
| FR-074 | Action phải phát hiện generated output bị thiếu hoặc stale. | Must |
| FR-075 | Action phải upload generated preview dưới dạng workflow artifact. | Must |
| FR-076 | Action phải hỗ trợ API key từ GitHub Actions secret. | Must |
| FR-077 | Action phải hỗ trợ OIDC mà không cần repository secret. | Should |
| FR-078 | Action phải có chế độ `generate` ghi output vào workspace. | Must |
| FR-079 | Action có thể commit generated output trên trusted branch khi được bật rõ ràng. | Could |
| FR-080 | Chế độ PR mặc định chỉ yêu cầu `contents: read` và không tự commit. | Must |
| FR-081 | Action nên chỉ render file thay đổi trên PR và cho phép full render khi push/main. | Should |
| FR-082 | Action phải trả exit code khác 0 khi validation, rendering hoặc stale check thất bại. | Must |

### 3.7 Module G - Operations and Observability

| ID | Mô tả yêu cầu | Priority |
|---|---|---|
| FR-090 | Hệ thống phải cung cấp Docker Compose tham chiếu cho Gateway, Kroki và companion services. | Must |
| FR-091 | Mỗi service phải có health check để orchestration xác định readiness. | Must |
| FR-092 | Gateway phải ghi structured log gồm request ID, engine, format, duration, status và cache result. | Must |
| FR-093 | Log mặc định không được chứa diagram source, API key hoặc OIDC token. | Must |
| FR-094 | Gateway phải cung cấp metrics về request count, latency, error, timeout và cache hit/miss. | Should |
| FR-095 | Administrator phải có thể cấu hình timeout, body limit, concurrency và rate limit qua environment/config. | Must |

## 4. Yêu cầu phi chức năng

### 4.1 Hiệu năng và giới hạn tài nguyên

| ID | Yêu cầu đo được | Mục tiêu mặc định | Priority |
|---|---|---|---|
| NFR-PERF-001 | Latency health endpoint | p95 <= 500 ms trong mạng nội bộ | Must |
| NFR-PERF-002 | Latency cache hit tại Gateway | p95 <= 300 ms, không tính WAN client | Must |
| NFR-PERF-003 | Thời gian render valid diagram | p95 <= 10 giây với source <= 100 KiB trong cấu hình tham chiếu | Should |
| NFR-PERF-004 | Hard render timeout | 15 giây mặc định; cấu hình trong khoảng 5-60 giây | Must |
| NFR-PERF-005 | Maximum request source | 1 MiB sau decode mặc định | Must |
| NFR-PERF-006 | Maximum response body | 10 MiB mặc định | Must |
| NFR-PERF-007 | Concurrent render limit | 4 request/instance mặc định; request vượt ngưỡng được queue có giới hạn hoặc trả 429/503 | Must |
| NFR-PERF-008 | Rate limit | 60 render request/phút/principal, burst 10; cấu hình được | Must |
| NFR-PERF-009 | VS Code preview debounce | 400 ms mặc định; cấu hình 200-2000 ms | Must |
| NFR-PERF-010 | Workspace render | 100 diagram hợp lệ phải hoàn tất trong 5 phút với cấu hình tham chiếu | Should |

Rate limit là giới hạn kỹ thuật để bảo vệ hệ thống. Sản phẩm không áp dụng quota theo ngày trong phạm vi SRS này.

### 4.2 Bảo mật

| ID | Yêu cầu | Priority |
|---|---|---|
| NFR-SEC-001 | Hosted/non-local Gateway phải sử dụng HTTPS với TLS 1.2 trở lên. | Must |
| NFR-SEC-002 | API key phải được lưu dạng hash/verifier phù hợp và chỉ hiển thị plaintext tại thời điểm cấp. | Must |
| NFR-SEC-003 | Credential không được xuất hiện trong log, error body, metrics label hoặc cache key thuần văn bản. | Must |
| NFR-SEC-004 | OIDC phải validate signature, issuer, audience, expiry và repository/workflow policy. | Should |
| NFR-SEC-005 | Renderer phải chạy bằng non-root user và bị giới hạn CPU, memory, process và execution time. | Must |
| NFR-SEC-006 | Remote include, local file include và truy cập internal network từ renderer bị tắt mặc định. | Must |
| NFR-SEC-007 | SVG phải được sanitize để loại bỏ active script và external resource nguy hiểm trước khi trả cho client. | Must |
| NFR-SEC-008 | VS Code webview phải có CSP, local resource roots tối thiểu và không chèn source/SVG chưa sanitize vào HTML. | Must |
| NFR-SEC-009 | Cache của private principal phải được cô lập theo tenant/repository policy. | Must |
| NFR-SEC-010 | Source của private repository không được ghi vào application log. | Must |

### 4.3 Khả năng mở rộng

| ID | Yêu cầu | Priority |
|---|---|---|
| NFR-SCL-001 | Gateway phải stateless ngoài cache và credential store để có thể scale ngang. | Should |
| NFR-SCL-002 | Gateway phải cho phép cấu hình nhiều Kroki backend endpoint. | Should |
| NFR-SCL-003 | Cache interface phải cho phép thay in-memory/filesystem cache bằng external cache mà không đổi client API. | Should |
| NFR-SCL-004 | Renderer concurrency phải được giới hạn riêng theo loại engine để Chromium workload không làm cạn kiệt toàn hệ thống. | Should |

### 4.4 Tính sẵn sàng và độ tin cậy

| ID | Yêu cầu | Priority |
|---|---|---|
| NFR-AVL-001 | Deployment tham chiếu hosted phải đạt availability 99.5% theo tháng, loại trừ maintenance đã thông báo. | Should |
| NFR-AVL-002 | Failure của một companion service không được làm health của renderer khác sai lệch; engine unavailable phải được báo rõ. | Must |
| NFR-AVL-003 | Gateway phải timeout và giải phóng request khi backend treo. | Must |
| NFR-AVL-004 | Hệ thống phải trả cùng output cho cùng source, options và renderer version trong giới hạn tính xác định của engine. | Must |
| NFR-AVL-005 | Cache failure không được ngăn render nếu backend vẫn hoạt động; Gateway có thể degrade sang no-cache. | Should |

### 4.5 Tương thích, bảo trì và khả dụng

| ID | Yêu cầu | Priority |
|---|---|---|
| NFR-CMU-001 | API phải được version hóa dưới `/api/v1`. | Must |
| NFR-CMU-002 | Breaking API/config change phải tạo major version hoặc migration guide. | Must |
| NFR-CMU-003 | Kroki fork patch phải được tách và ghi lý do để cập nhật upstream. | Should |
| NFR-CMU-004 | Error message phải có hướng xử lý, không chỉ trả stack trace. | Must |
| NFR-CMU-005 | Setup repository cơ bản không vượt quá một workflow file, một `.diagram.yml` và một credential nếu cần. | Should |
| NFR-CMU-006 | Unit, integration và end-to-end tests phải bao phủ happy path và error path của bốn engine MVP. | Must |

## 5. Use case chính

### UC-01 - Live preview diagram trong VS Code

| Trường | Nội dung |
|---|---|
| Actor | Developer |
| Precondition | Extension đã cài; Gateway URL hợp lệ; file dùng engine được hỗ trợ; API key đã cấu hình nếu cần. |
| Main flow | 1. Developer mở diagram file. 2. Chọn `Open Preview`. 3. Extension đọc `.diagram.yml`. 4. Extension gửi source đến Gateway sau debounce. 5. Gateway xác thực, validate và render qua Kroki. 6. Extension hiển thị SVG trong webview. 7. Mỗi thay đổi source làm preview cập nhật. |
| Alternative flow | A1. Không truy cập được Gateway: extension giữ preview cũ và hiển thị connection error. A2. Source sai: extension hiển thị diagnostic tại line/column. A3. Response cũ về muộn: extension bỏ qua response. |
| Postcondition | Preview hiển thị bản render mới nhất hoặc editor có diagnostic có thể xử lý. Không có generated file bị ghi nếu render-on-save đang tắt. |

### UC-02 - Export hoặc render-on-save

| Trường | Nội dung |
|---|---|
| Actor | Developer |
| Precondition | Diagram render hợp lệ; output directory có thể ghi. |
| Main flow | 1. Developer chọn Export SVG/PNG hoặc save file khi render-on-save bật. 2. Extension gọi Gateway. 3. Gateway trả output. 4. Extension xác định output path theo `.diagram.yml`. 5. Extension ghi file. |
| Alternative flow | A1. Output tồn tại: ghi đè theo policy đã cấu hình. A2. Không có quyền ghi: báo lỗi và không thay đổi file cũ. A3. Render thất bại: không ghi partial output. |
| Postcondition | Generated output hợp lệ được lưu tại đường dẫn xác định và có thể commit vào Git. |

### UC-03 - Validate diagram trong pull request

| Trường | Nội dung |
|---|---|
| Actor | Repository maintainer, PR contributor, GitHub Action |
| Precondition | Workflow và `.diagram.yml` đã commit; runner kết nối được Gateway; credential/OIDC policy hợp lệ. |
| Main flow | 1. PR thay đổi diagram source. 2. Workflow chạy Action ở `check` mode. 3. Action render source qua Gateway. 4. Action so sánh output với generated file. 5. Action upload preview artifact. 6. Check thành công khi source hợp lệ và output không stale. |
| Alternative flow | A1. Syntax error: Action tạo annotation và fail. A2. Output stale: Action fail và upload output mới. A3. PR fork không có secret: Action dùng OIDC nếu được hỗ trợ; nếu deployment chỉ có API key, workflow báo rõ unsupported auth thay vì âm thầm bỏ qua. |
| Postcondition | PR có trạng thái validation rõ ràng; repository không bị Action sửa trong `check` mode. |

### UC-04 - Generate output trong GitHub Actions

| Trường | Nội dung |
|---|---|
| Actor | Repository maintainer, GitHub Action |
| Precondition | Action ở `generate` mode; branch/event đáng tin cậy; output directory có thể ghi. |
| Main flow | 1. Workflow chạy sau push hoặc manual dispatch. 2. Action render các source. 3. Action ghi SVG/PNG vào workspace. 4. Output được upload artifact hoặc bước tiếp theo commit theo cấu hình. |
| Alternative flow | A1. Bật `commit: true` nhưng thiếu `contents: write`: Action fail với hướng dẫn quyền. A2. Không có thay đổi output: không tạo commit. A3. Một render thất bại: Action không commit tập output không hoàn chỉnh. |
| Postcondition | Workspace/artifact có bộ generated output nhất quán; commit chỉ xảy ra khi được bật rõ ràng. |

### UC-05 - Render qua HTTP API

| Trường | Nội dung |
|---|---|
| Actor | API consumer |
| Precondition | Gateway có thể truy cập; engine/format được hỗ trợ; credential hợp lệ nếu auth bật. |
| Main flow | 1. Client gửi JSON, text/plain hoặc encoded GET. 2. Gateway validate và xác thực. 3. Gateway kiểm tra cache. 4. Nếu cache miss, Gateway delegate đến Kroki. 5. Gateway trả binary output với content type và request ID. |
| Alternative flow | A1. Request sai: 4xx với normalized error. A2. Rate limit: 429 và retry information. A3. Renderer timeout/unavailable: 503/504 với request ID. A4. Cache hit: trả output mà không gọi Kroki. |
| Postcondition | Client nhận output hợp lệ hoặc error có cấu trúc; request được ghi metric mà không log source/credential. |

### UC-06 - Cấu hình xác thực Gateway

| Trường | Nội dung |
|---|---|
| Actor | System administrator, developer, repository maintainer |
| Precondition | Gateway đã deploy; actor có quyền cấu hình tương ứng. |
| Main flow | 1. Administrator bật no-auth local, cấp API key hoặc khai báo GitHub OIDC policy. 2. Developer lưu API key trong VS Code SecretStorage; maintainer lưu key trong GitHub Secret hoặc bật OIDC. 3. Client gọi Gateway. 4. Gateway tạo principal và áp scope. |
| Alternative flow | A1. Key bị revoke: Gateway trả 401. A2. OIDC claim không khớp repository/workflow: Gateway trả 403. A3. Credential vắng mặt khi auth bật: Gateway trả 401. |
| Postcondition | Chỉ principal được phép mới có thể render; credential không xuất hiện trong repository hoặc log. |

### UC-07 - Triển khai nền tảng self-hosted

| Trường | Nội dung |
|---|---|
| Actor | Platform/DevOps engineer |
| Precondition | Có Docker/compatible runtime và tài nguyên máy chủ phù hợp. |
| Main flow | 1. Engineer cấu hình environment. 2. Khởi động Docker Compose. 3. Gateway, Kroki và companion services vượt qua health checks. 4. Engineer chỉ expose Gateway. 5. Client kiểm tra `/health` và `/api/v1/engines`. |
| Alternative flow | A1. Companion service lỗi: engine liên quan hiển thị unavailable, service khác vẫn khởi động nếu policy cho phép. A2. Cấu hình auth không hợp lệ: Gateway fail fast. A3. Hosted deployment thiếu TLS: deployment không được công bố ra ngoài. |
| Postcondition | Nền tảng sẵn sàng nhận render request qua Gateway và các backend không bị expose công khai. |

## 6. Tổng hợp tiêu chí nghiệm thu

| Khu vực | Điều kiện nghiệm thu MVP |
|---|---|
| Gateway | Render thành công bốn engine qua JSON và text/encoded API; lỗi được chuẩn hóa. |
| Kroki fork | Renderer version được pin; secure mode, timeout và health hoạt động. |
| VS Code | Preview source chưa save, diagnostics, SVG/PNG export và optional render-on-save hoạt động. |
| GitHub Action | PR check, annotation, stale detection, artifact và generate mode hoạt động. |
| Configuration | Cùng `.diagram.yml` cho kết quả/output path giống nhau trong VS Code và CI. |
| Security | API key/no-auth local, rate limit, body limit, timeout, SVG sanitization và no-secret logging được kiểm thử. |
| Deployment | Docker Compose khởi động đầy đủ và chỉ expose Gateway trong cấu hình tham chiếu. |