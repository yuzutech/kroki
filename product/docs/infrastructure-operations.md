# Infrastructure and Operations

## Khởi động

```powershell
cd D:\MyKroki\product\deploy
Copy-Item .env.example .env
# Tạo key và chép verifier record vào DIAGRAM_API_KEY_RECORDS trong .env.
npm run key:generate --prefix .. -- local-admin
docker compose up -d --build
$env:DIAGRAM_API_KEY = "key-plaintext-vừa-tạo"
npm --prefix .. run smoke
```

Kiểm tra `http://localhost:9000/health/live` cho tiến trình Gateway và `/health/ready` cho cả đường kết nối tới Kroki. Gateway nối cả mạng `edge` và mạng `rendering`; Kroki và Mermaid chỉ nối mạng `rendering` internal và không publish port ra host.

## TLS và mạng

Đặt Gateway sau reverse proxy có HTTPS khi dùng ngoài localhost. Chỉ cho runner, VPN hoặc mạng công ty truy cập. Không expose trực tiếp Kroki/Mermaid. Giữ `AUTH_MODE=required`; `disabled` chỉ dành cho local cô lập.

## Vận hành thường ngày

- Xem trạng thái: `docker compose ps`.
- Xem log: `docker compose logs -f --tail=200 gateway kroki mermaid`.
- Cập nhật image pin trong `.env`, chạy `docker compose pull` rồi `docker compose up -d --build`.
- Smoke test sau mỗi lần deploy bằng `npm --prefix .. run smoke`.
- Rollback bằng cách trả image tag cũ trong `.env` và chạy lại Compose.

Gateway MVP không có database hay volume dữ liệu. Cache nằm trong RAM và mất khi restart; source và SVG chuẩn vẫn nằm trong Git.

## Cấp, xoay và thu hồi API key

Gateway đọc `DIAGRAM_API_KEY_RECORDS` dưới dạng JSON. Mỗi record có `id`, SHA-256 `verifier`, `scopes`, `cachePartition` và `status` (`active` hoặc `revoked`). Gateway không lưu plaintext key. Lệnh sau in plaintext đúng một lần cùng record để lưu ở phía Gateway:

```powershell
npm run key:generate --prefix .. -- repo-ci
```

Khi cấp key, lưu plaintext vào VS Code SecretStorage hoặc GitHub Secret; chỉ đưa verifier record vào secret/config gắn cho Gateway. Để xoay key mà không làm đổi cache partition, thêm record mới với cùng `cachePartition`, restart Gateway, cập nhật client, xác nhận render thành công, rồi chuyển record cũ sang `revoked` và restart lần nữa. Sau thời gian kiểm tra có thể xóa record revoked.

`DIAGRAM_API_KEYS` dạng plaintext chỉ còn để tương thích cấu hình cũ và không nên dùng cho deployment mới. Không có admin API trong MVP; thay đổi lifecycle là thao tác có kiểm soát trên mounted secret/config.

## Giám sát tối thiểu

Theo dõi HTTP 5xx, thời gian render, memory/container restart, bulkhead queue và cache hit/miss tại `/metrics`. Endpoint metrics chỉ tồn tại khi `METRICS_ENABLED=true`; khi Gateway truy cập được từ Internet, reverse proxy phải giới hạn endpoint này cho mạng vận hành. Cảnh báo khi `/health/ready` lỗi liên tục trên 2 phút. LRU, single-flight và token bucket chỉ có hiệu lực trong từng Gateway replica; MVP nên bắt đầu với một replica.

Các giới hạn mặc định là source 1 MiB, output 10 MiB, timeout 15 giây, 4 render đồng thời và queue 20 request. Gateway fail fast nếu giá trị nằm ngoài khoảng an toàn hoặc production bật no-auth trên địa chỉ non-loopback.
