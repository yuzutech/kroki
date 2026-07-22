# Code To UML — Tài liệu triển khai và bàn giao kỹ thuật

## 1. Tổng quan

Code To UML được phát triển từ source Kroki, với mục tiêu biến rendering service ban đầu thành một nền tảng tạo diagram hoàn chỉnh, có:

- Playground UI chỉnh sửa source và xem diagram trực tiếp.
- Hỗ trợ toàn bộ renderer của Kroki.
- Tài khoản người dùng và đăng nhập trên web.
- API key cho CI/CD, extension và ứng dụng bên ngoài.
- Device authorization flow để VS Code extension đăng nhập qua trình duyệt.
- PostgreSQL để lưu user, session, API key, diagram, version và render cache.
- API Gateway làm điểm truy cập duy nhất.
- Rate limit, cache và phân tách renderer trong Docker network.
- GitHub Action để render diagram trong pipeline.
- VS Code extension có auto-detect engine, live preview, render-on-save, export và API key tùy chọn cho hosted service.
- Realtime collaborative editing bằng Yjs CRDT và WebSocket.

Địa chỉ mặc định khi chạy local:

```text
http://localhost:8000
```

## 2. Kiến trúc tổng thể

```text
┌──────────────────────────────────────────────────────────────┐
│ Client                                                       │
│                                                              │
│  Web Playground   VS Code Extension   GitHub Action   API    │
└───────────────┬──────────────────────────────────────────────┘
                │ HTTP/HTTPS :8000
                ▼
┌──────────────────────────────────────────────────────────────┐
│ Code To UML API Gateway — Node.js/Express                    │
│                                                              │
│  Auth         Device flow       API keys       Rate limit    │
│  Diagram API  PostgreSQL cache  Render proxy   ETag          │
└───────┬───────────────────────────────┬──────────────────────┘
        │                               │
        │ SQL                           │ Internal HTTP
        ▼                               ▼
┌───────────────────┐       ┌──────────────────────────────────┐
│ PostgreSQL 17     │       │ Kroki Core — Java/Vert.x         │
│                   │       │                                  │
│ users             │       │ PlantUML, C4, GraphViz, D2,      │
│ sessions          │       │ Structurizr, TikZ, Vega...       │
│ api_keys          │       └───────────────┬──────────────────┘
│ device_codes      │                       │ Internal network
│ diagrams          │       ┌───────────────┼──────────────────┐
│ diagram_versions  │       ▼               ▼                  ▼
│ render_cache      │   Mermaid          BPMN          Excalidraw/
└───────────────────┘   container        container     diagrams.net
```

Chỉ API Gateway được publish ra host qua cổng `8000`. PostgreSQL, Kroki core và các companion renderer chỉ giao tiếp trong Docker network.

## 3. Tech stack

### Rendering core

- Java 21.
- Vert.x 5.
- Maven Wrapper.
- Kroki 0.31.1.
- Native/containerized renderer binaries.
- Docker và Docker Compose.

### API Gateway và authentication

- Node.js 24.
- Express 5.
- PostgreSQL driver `pg`.
- Node.js built-in `crypto`:
  - `scrypt` để hash password.
  - SHA-256 để hash session token và API key.
  - `randomBytes` để tạo secret có entropy cao.
  - UUID cho primary key.
- Native Fetch API để proxy request sang Kroki core.

### Database

- PostgreSQL 17 Alpine.
- Docker named volume để lưu dữ liệu.
- Schema tự migration khi gateway khởi động.

### Web UI

- HTML5, CSS3 và JavaScript thuần.
- Fetch API.
- Blob/Object URL để hiển thị và tải SVG.
- LocalStorage để giữ source nháp theo từng renderer.
- Responsive layout và split-pane editor/preview.

### VS Code extension

- VS Code Extension API.
- JavaScript/CommonJS.
- VS Code SecretStorage để lưu access token/API key.
- Device authorization flow qua trình duyệt.
- Webview để hiển thị SVG preview.
- Đóng gói bằng `@vscode/vsce`.

### GitHub Action

- Composite Action.
- Bash và `curl`.
- API key được lấy từ GitHub Actions Secrets.

## 4. Các file chính được thêm hoặc thay đổi

### Giao diện

- `server/src/main/resources/web/hello.html`
  - Thay landing page Kroki bằng Code To UML Playground.
  - Editor và live preview song song.
  - Account dialog.
  - API key management.
  - Save/open diagram.
  - Danh sách toàn bộ renderer.

### Gateway

- `gateway/src/server.js`
  - Database migration.
  - Authentication API.
  - Device authorization API.
  - API key API.
  - Diagram API.
  - Rate limiting.
  - PostgreSQL render cache.
  - Proxy sang Kroki core.
- `gateway/package.json`
- `gateway/Dockerfile`

### Docker

- `Dockerfile.code-to-uml`
  - Kế thừa image Kroki chính thức.
  - Thay JAR mặc định bằng JAR chứa UI Code To UML.
- `compose.code-to-uml.yml`
  - Gateway.
  - PostgreSQL.
  - Kroki core.
  - Mermaid.
  - BPMN.
  - Excalidraw.
  - diagrams.net.
- `.env.example`
  - Các biến môi trường mẫu.

### Automation và extension

- `action.yml`: GitHub Composite Action.
- `vscode-extension/package.json`: manifest extension.
- `vscode-extension/extension.js`: auto-detect engine, API key, live preview, render-on-save và export.
- `vscode-extension/README.md`.
- `vscode-extension/code-to-uml-0.5.1.vsix`: extension đã đóng gói.

### Kiểm thử và tài liệu

- `ci/tests/smoke.js`
  - Chuẩn hóa CRLF thành LF.
  - Thêm newline cuối source để test nhất quán trên Windows/Linux.
- `CODE_TO_UML.md`: hướng dẫn vận hành nhanh.
- `CODE_TO_UML_IMPLEMENTATION.md`: tài liệu bàn giao này.

## 5. Playground UI

Playground mới có:

- Branding `Code To UML`.
- Source editor bên trái.
- Live preview bên phải.
- Debounce 450 ms khi người dùng nhập code.
- Nút render thủ công.
- Phím tắt `Ctrl+Enter` hoặc `Cmd+Enter`.
- Tab được chuyển thành hai dấu cách trong editor.
- Chọn renderer từ dropdown.
- Download SVG.
- Kéo thanh chia để điều chỉnh độ rộng editor/preview.
- Hiển thị render time.
- Hiển thị lỗi cú pháp hoặc lỗi service.
- Responsive trên màn hình nhỏ.
- Lưu source nháp theo renderer trong LocalStorage.
- Dialog hiển thị version renderer.
- Register/login/logout.
- Tạo API key.
- Lưu diagram vào PostgreSQL.
- Mở lại diagram đã lưu.

UI chuẩn hóa request trước khi render:

```javascript
source.replace(/\r\n/g, '\n') + '\n\n'
```

Việc này khắc phục parser DBML và Nomnoml nhạy với newline trên Windows.

## 6. Renderer được hỗ trợ

Gateway sử dụng allowlist, không chấp nhận engine tùy ý. Các engine hiện có:

- PlantUML.
- C4 PlantUML.
- Mermaid.
- GraphViz.
- DOT.
- D2.
- Structurizr.
- BlockDiag.
- SeqDiag.
- ActDiag.
- NwDiag.
- PacketDiag.
- RackDiag.
- BPMN.
- DBML.
- diagrams.net.
- Ditaa.
- ERD.
- Excalidraw.
- GoAT.
- Nomnoml.
- Pikchr.
- SvgBob.
- Symbolator.
- UMLet.
- Vega.
- Vega-Lite.
- WaveDrom.
- Bytefield.
- WireViz.
- TikZ.

Các output format được kiểm tra tùy renderer gồm SVG, PNG, PDF, JPEG và TXT.

## 7. PostgreSQL schema

### `users`

Lưu tài khoản:

- `id`: UUID.
- `email`: duy nhất.
- `display_name`.
- `password_hash`: salt và scrypt hash.
- `created_at`.

### `sessions`

Lưu web session và extension access token:

- `token_hash`: chỉ lưu SHA-256, không lưu raw token.
- `user_id`.
- `expires_at`.
- `created_at`.

### `api_keys`

- `id`.
- `user_id`.
- `name`.
- `key_prefix`: dùng nhận diện key mà không lộ secret.
- `secret_hash`.
- `last_used_at`.
- `expires_at`.
- `created_at`.

### `device_codes`

- `device_hash`.
- `user_code`.
- `user_id` sau khi approve.
- `status`: `pending` hoặc `approved`.
- `expires_at`.
- `interval_seconds`.

### `diagrams`

- `id`.
- `user_id`.
- `name`.
- `engine`.
- `source`.
- `options` dạng JSONB.
- `is_public`.
- `created_at`.
- `updated_at`.

### `diagram_versions`

Lưu lịch sử source và options mỗi lần diagram được cập nhật.

### `share_links`

- Token chia sẻ chỉ được lưu dưới dạng SHA-256 hash.
- Quyền `view` hoặc `edit`.
- Có thời hạn và có thể thu hồi.
- Liên kết với diagram và user tạo link.

## Realtime collaboration

Owner nhấn **Share** trong editor để tạo link có quyền xem hoặc chỉnh sửa. Người nhận mở link sẽ tham gia WebSocket room của diagram mà không cần tài khoản.

Source được đồng bộ bằng Yjs CRDT, vì vậy thao tác đồng thời được merge thay vì áp dụng theo kiểu last-write-wins. Gateway giữ Y.Doc theo room, broadcast binary updates, hiển thị presence/online count, debounce lưu source vào PostgreSQL và tạo `diagram_versions` snapshot. Room được giải phóng sau khi client cuối cùng rời đi.

```text
Owner/Guest editors
        │ Yjs updates
        ▼
WebSocket /ws/diagrams/{diagramId}
        │
        ├── CRDT merge + presence broadcast
        └── Debounced persistence
                    ▼
            diagrams + diagram_versions
```

### `render_cache`

- `cache_key`.
- `content_type`.
- `body` dạng `bytea`.
- `created_at`.
- `expires_at`.

## 8. Luồng đăng ký và đăng nhập web

### Đăng ký

```text
Browser
  │ POST /api/auth/register
  ▼
Gateway
  │ Validate name/email/password
  │ Generate salt
  │ Hash password bằng scrypt
  │ INSERT users
  │ Tạo random session token
  │ Chỉ lưu SHA-256(token)
  ▼
Browser nhận HttpOnly cookie ctu_session
```

Password tối thiểu 10 ký tự. Email được chuyển về lowercase trước khi lưu.

### Đăng nhập

```text
POST /api/auth/login
  → tìm user theo email
  → hash password bằng salt đã lưu
  → timingSafeEqual
  → tạo session có hạn 30 ngày
  → trả HttpOnly cookie
```

Cookie cấu hình:

- `HttpOnly`.
- `SameSite=Lax`.
- `Secure` khi `COOKIE_SECURE=true`.
- Path `/`.
- Hạn 30 ngày.

## 9. Luồng API key

```text
User đăng nhập
  │ POST /api/keys
  ▼
Gateway tạo: ctu_<random secret>
  │
  ├── Thu hồi toàn bộ key cũ của tài khoản trong cùng transaction
  ├── Trả raw key mới đúng một lần
  └── Chỉ lưu SHA-256 key trong PostgreSQL
```

Client sử dụng:

```http
Authorization: Bearer ctu_xxxxxxxxx
```

Mỗi lần key hợp lệ được dùng, `last_used_at` được cập nhật. Extension gọi
`/api/auth/me` mỗi 3 giây; khi key bị thu hồi hoặc hết hạn, key bị xóa khỏi
SecretStorage và sidebar trở về Local mode.

## 10. Device authorization API (không dùng trong extension hiện tại)

Luồng này cho trải nghiệm tương tự CLI/extension của các công cụ AI:

```text
VS Code Extension
  │ POST /api/auth/device/start
  ▼
Gateway tạo device_code + user_code, hạn 10 phút
  │
  ├── verification_uri
  └── verification_uri_complete

Extension mở trình duyệt
  │
  ▼
User đăng nhập web và approve user_code
  │ POST /api/auth/device/approve
  ▼
Gateway đánh dấu device code là approved

Extension polling mỗi 5 giây
  │ POST /api/auth/device/token
  ▼
Gateway trả ctu_access_<secret>
  │
  ▼
Extension lưu token bằng VS Code SecretStorage
```

Nếu code chưa được duyệt, gateway trả:

```text
HTTP 428 authorization_pending
```

Device code hết hạn sau 10 phút và bị xóa khi đổi token thành công.

## 11. Render request flow

Ví dụ request:

```http
POST /plantuml/svg
Authorization: Bearer ctu_xxx
Content-Type: text/plain

Alice -> Bob: Hello
```

Luồng xử lý:

```text
Request
  │
  ├── Identify session/API key/guest
  ├── Rate limit
  ├── Validate engine + format bằng allowlist
  ├── Tính SHA-256(path + options + source)
  ├── Tìm render_cache
  │     ├── HIT  → trả body trong PostgreSQL
  │     └── MISS → proxy sang Kroki core
  │                    │
  │                    ├── core renderer nội bộ
  │                    └── companion renderer
  │
  ├── Lưu output thành công vào cache, TTL 24 giờ
  └── Trả output + ETag + X-Cache
```

Response headers bổ sung:

```http
X-Cache: HIT
ETag: "<sha256>"
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 119
```

## 12. Rate limit

Mặc định:

| Đối tượng | Request/phút |
|---|---:|
| Guest | 20 |
| Session/API key | 120 |

Cấu hình bằng:

```env
GUEST_RATE_LIMIT=20
USER_RATE_LIMIT=120
```

Rate limiter hiện chạy trong memory của gateway. Khi scale nhiều gateway replica, nên chuyển counter sang Redis để có giới hạn thống nhất toàn cluster.

## 13. Lưu diagram và version

Các endpoint:

```text
GET    /api/diagrams
POST   /api/diagrams
GET    /api/diagrams/:id
PUT    /api/diagrams/:id
```

Tất cả endpoint yêu cầu authentication. Query luôn kiểm tra `user_id`, nên user không đọc hoặc cập nhật diagram của user khác bằng cách thay UUID.

Khi tạo/cập nhật diagram, source và options được ghi thêm vào `diagram_versions`.

## 14. GitHub Action

Action nhận các input:

| Input | Ý nghĩa |
|---|---|
| `server-url` | URL public của Code To UML |
| `api-key` | API key từ GitHub Secret |
| `engine` | Renderer |
| `format` | Output format |
| `source` | File source |
| `output` | File output |

Ví dụ workflow:

```yaml
name: Render architecture diagrams

on:
  push:
    paths:
      - "docs/**/*.puml"

jobs:
  render:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: your-org/code-to-uml@main
        with:
          server-url: https://uml.example.com
          api-key: ${{ secrets.CODE_TO_UML_API_KEY }}
          engine: plantuml
          format: svg
          source: docs/architecture.puml
          output: docs/architecture.svg
```

Không commit API key vào repository. Luôn sử dụng GitHub Actions Secrets.

## 15. VS Code extension

Các command:

```text
Code To UML: Set API Key
Code To UML: Clear API Key
Code To UML: Open Live Preview
Code To UML: Export Diagram
```

Cấu hình:

```json
{
  "codeToUml.serverUrl": "http://localhost:8000",
  "codeToUml.defaultEngine": "plantuml",
  "codeToUml.livePreview": true,
  "codeToUml.renderOnSave": true,
  "codeToUml.followActiveEditor": true
}
```

Local service không yêu cầu login. API key tùy chọn cho hosted service được lưu trong VS Code SecretStorage, không nằm trong `settings.json`.

File VSIX hiện tại:

```text
vscode-extension/code-to-uml-0.5.1.vsix
```

Cài local:

```powershell
code --install-extension D:\kroki-update\vscode-extension\code-to-uml-0.5.1.vsix --force
```

## 16. Docker Compose services

| Service | Container | Public port |
|---|---|---:|
| Gateway | `code-to-uml-gateway` | `8000` |
| PostgreSQL | `code-to-uml-postgres` | Không |
| Kroki core | `code-to-uml-core` | Không |
| Mermaid | `code-to-uml-mermaid` | Không |
| BPMN | `code-to-uml-bpmn` | Không |
| Excalidraw | `code-to-uml-excalidraw` | Không |
| diagrams.net | `code-to-uml-diagramsnet` | Không |

PostgreSQL có healthcheck bằng `pg_isready`. Gateway chỉ khởi động sau khi PostgreSQL healthy và core đã start.

## 17. Chạy local

### Khởi tạo lần đầu

```powershell
cd D:\kroki-update
Copy-Item .env.example .env
docker compose -f compose.code-to-uml.yml up -d --build
```

### Các lần tiếp theo

```powershell
cd D:\kroki-update
docker compose -f compose.code-to-uml.yml up -d
```

### Xem trạng thái

```powershell
docker compose -f compose.code-to-uml.yml ps
```

### Xem log

```powershell
docker compose -f compose.code-to-uml.yml logs -f gateway
```

### Dừng

```powershell
docker compose -f compose.code-to-uml.yml down
```

Không dùng lệnh sau nếu muốn giữ database:

```powershell
docker compose -f compose.code-to-uml.yml down -v
```

## 18. Build sau khi sửa code

### Build Java/UI và Docker

```powershell
cd D:\kroki-update

$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-21.0.11.10-hotspot"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"

.\mvnw.cmd package -DskipTests
docker compose -f compose.code-to-uml.yml up -d --build
```

### Build VS Code extension

```powershell
cd D:\kroki-update\vscode-extension
npm install
npm run package
```

## 19. Biến môi trường

```env
POSTGRES_PASSWORD=replace-with-a-long-random-password
PUBLIC_URL=http://localhost:8000
COOKIE_SECURE=false
GUEST_RATE_LIMIT=20
USER_RATE_LIMIT=120
```

Production:

```env
POSTGRES_PASSWORD=<random-secret-rất-dài>
PUBLIC_URL=https://uml.example.com
COOKIE_SECURE=true
GUEST_RATE_LIMIT=20
USER_RATE_LIMIT=120
```

## 20. Kiểm thử đã thực hiện

Bộ smoke test chính thức của repo đã chạy qua 89 trường hợp:

```text
tests:     89
pass:      89
fail:      0
skipped:   0
```

Nội dung kiểm tra gồm:

- Toàn bộ engine Kroki.
- SVG, PNG, PDF, JPEG và TXT tùy engine.
- Renderer nội bộ và companion container.
- PlantUML native image.
- Unicode/CJK.
- Health endpoints.

Luồng platform được kiểm tra end-to-end:

```text
Register        → HTTP 201
Session cookie  → đọc đúng user
API key         → tạo và authenticate thành công
First render    → X-Cache: MISS
Second render   → X-Cache: HIT
Save diagram    → PostgreSQL insert thành công
Device approve  → access token thành công
Token /auth/me  → đọc đúng user
Web UI          → HTTP 200
Health          → HTTP 200
VSIX package    → build thành công
```

## 21. Bảo mật hiện có

- Password dùng salted scrypt hash.
- So sánh password hash bằng `timingSafeEqual`.
- Session/access token/API key sinh bằng cryptographic random.
- Database chỉ lưu token/key hash.
- Web session dùng HttpOnly cookie.
- Cookie hỗ trợ `Secure` trong production.
- SameSite Lax.
- Renderer được allowlist.
- Request body giới hạn 2 MB.
- Kroki core và database không publish port.
- API key chỉ hiển thị một lần.
- Device code có thời hạn và bị xóa sau khi dùng.
- Diagram API kiểm tra ownership.
- Gateway ẩn chi tiết exception nội bộ khỏi client.

## 22. Việc cần làm trước production

Phiên bản hiện tại là nền tảng/MVP đầy đủ để phát triển tiếp. Trước khi public internet nên thực hiện thêm:

1. Đặt reverse proxy HTTPS bằng Nginx, Traefik, Caddy hoặc cloud load balancer.
2. Đặt `COOKIE_SECURE=true`.
3. Thay mật khẩu PostgreSQL mặc định.
4. Lưu secret bằng Docker Secrets, Kubernetes Secrets hoặc secret manager.
5. Thêm CSRF token cho các mutation dùng cookie.
6. Thêm email verification và password reset.
7. Thêm login brute-force protection/CAPTCHA.
8. Chuyển rate-limit counter sang Redis khi chạy nhiều replica.
9. Chuyển render cache lớn sang Redis/S3/MinIO nếu cần scale.
10. Thêm TTL cleanup job cho session, device code và render cache hết hạn.
11. Thêm audit log.
12. Thêm API key scope và quyền chi tiết.
13. Thêm refresh-token rotation hoặc giảm thời hạn access token.
14. Thêm CSP đầy đủ và security headers tại reverse proxy.
15. Giới hạn CPU, RAM, PID, timeout và read-only filesystem cho renderer.
16. Tắt outbound network của renderer nếu không cần include từ Internet.
17. Backup và kiểm tra restore PostgreSQL định kỳ.
18. Thêm OpenTelemetry/Prometheus/Grafana và alert.
19. Chạy dependency/container vulnerability scanning trong CI.
20. Bổ sung integration test auth/cache/device flow vào CI chính thức.

## 23. Hướng phát triển tiếp theo

- Monaco Editor và syntax highlighting theo engine.
- OAuth Google/GitHub.
- Team/workspace và role Owner/Admin/Member/Viewer.
- Public/private sharing link.
- Embed diagram.
- Realtime collaboration.
- Diagram version diff và rollback.
- API key scopes.
- Usage dashboard và quota theo plan.
- Redis distributed rate limit.
- Object storage cho output lớn.
- Publish extension lên VS Code Marketplace.
- Publish GitHub Action lên GitHub Marketplace.

## 24. Tóm tắt trạng thái bàn giao

Hệ thống hiện có thể chạy local hoàn toàn bằng Docker, cung cấp toàn bộ renderer Kroki qua một gateway duy nhất, lưu dữ liệu bằng PostgreSQL, hỗ trợ web login, API key, device login cho VS Code, lưu diagram/version, cache render, rate limit, GitHub Action và extension đã đóng gói.

## 25. Các cập nhật UI và collaboration mới nhất

### Dashboard screen

- Dashboard là một screen riêng, không phải popup.
- Dark theme đồng bộ với editor và sidebar cố định.
- Sidebar chỉ giữ navigation Dashboard và account/username ở cuối.
- Banner hiển thị số diagram đã lưu.
- Recent files hiển thị dạng card có preview SVG, tên, engine và ngày cập nhật.
- Chọn card sẽ mở lại diagram trong editor.
- Nút New diagram reset diagram ID, tên và collaboration room.

### Inline diagram name

- Tên diagram là input trực tiếp trên editor toolbar.
- Diagram mới có tên mặc định `Untitled diagram`.
- Save lần đầu tạo record mới.
- Save những lần sau cập nhật record hiện tại thay vì tạo bản trùng.
- Đổi tên rồi nhấn Enter hoặc blur sẽ lưu tên vào PostgreSQL.
- Khi mở diagram từ Dashboard, ID, tên, engine và source được khôi phục vào editor.

### Preview zoom và pan

- Wheel up/down để zoom in/out.
- Pinch touchpad được xử lý qua wheel gesture của trình duyệt.
- Zoom lấy vị trí con trỏ làm tâm.
- Giữ chuột trái để kéo/pan diagram.
- Cursor chuyển giữa grab và grabbing.
- Giới hạn zoom từ 20% đến 800%.
- Hiển thị phần trăm zoom.
- Nút Fit và double-click reset về 100%, căn giữa.
- Diagram mới render tự reset viewport.

### Share link và quyền truy cập

- Owner tạo share link trực tiếp từ editor.
- Hai quyền: `view` và `edit`.
- Link mặc định hết hạn sau 30 ngày.
- Raw share token chỉ có trong URL; PostgreSQL chỉ lưu SHA-256 hash.
- Link hết hạn hoặc bị revoke không thể kết nối API/WebSocket.
- Guest có link edit không bắt buộc đăng ký tài khoản.
- Guest có link view nhận realtime updates nhưng textarea ở trạng thái read-only.

### Yjs CRDT collaboration

- Browser client bundle được tạo bằng esbuild tại `/assets/collab-client.js`.
- Mỗi diagram sử dụng một Y.Doc và Y.Text `source`.
- WebSocket endpoint: `/ws/diagrams/{diagramId}`.
- Owner authenticate bằng session; guest authenticate bằng share token.
- Yjs binary update được truyền dưới dạng Base64 JSON message.
- Concurrent edits được CRDT merge, không dùng last-write-wins.
- Online presence hiển thị số client trong room.
- Source được debounce lưu sau 1,2 giây.
- Mỗi persistence tạo một `diagram_versions` snapshot.
- Room được giữ thêm 60 giây sau khi người cuối rời đi rồi mới giải phóng.

### Kiểm thử collaboration

Đã mô phỏng hai WebSocket client độc lập:

1. Owner tạo diagram.
2. Owner tạo edit share link.
3. Owner và guest cùng kết nối một room.
4. Owner chèn nội dung ở đầu document.
5. Guest chèn nội dung ở cuối document.
6. Hai Y.Doc hội tụ về cùng source.
7. Source cuối cùng được kiểm tra lại từ PostgreSQL.

Kết quả:

```text
clientsConverged: true
persisted: true
sharePermission: edit
```

Lệnh khởi động chính:

```powershell
cd D:\kroki-update
docker compose -f compose.code-to-uml.yml up -d
```

URL:

```text
http://localhost:8000
```
