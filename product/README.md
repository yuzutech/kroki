# Diagram as Code Product

Lớp sản phẩm này bổ sung workflow hoàn chỉnh quanh fork Kroki mà không trộn code tùy biến vào module upstream:

- `gateway`: Fastify API có scoped API-key principals, rate limit, bounded render queue, output validation/SVG sanitization, LRU/single-flight cache và Prometheus metrics.
- `vscode-extension`: live preview và export SVG thủ công, ổn định.
- `github-action`: kiểm tra SVG đã commit có khớp source trên pull request.
- `deploy`: Compose self-hosted, chỉ expose Gateway.

## Luồng sử dụng

Developer sửa file trong `docs/diagrams`, mở preview và dùng `Diagram: Export SVG` khi muốn cập nhật artifact. Họ commit cả source text và SVG. Pull request hiển thị text diff lẫn GitHub image diff; Action gọi cùng Gateway và fail nếu SVG cũ.

## Chạy local

1. Làm theo [Environment Bootstrap](docs/environment-bootstrap.md).
2. Tạo `product/deploy/.env`, rồi chạy `docker compose up -d --build` trong `product/deploy`.
3. Chạy `npm run smoke` trong `product` với `DIAGRAM_API_KEY` đã đặt.
4. Copy `product/.diagram.example.yml` thành `.diagram.yml` ở repo sử dụng.
5. Build/cài VSIX từ `product/vscode-extension/dist/diagram-as-code-vscode.vsix`.

Các quy trình TLS, key rotation, update và rollback nằm trong [Infrastructure and Operations](docs/infrastructure-operations.md). Quy trình đóng gói, phát hành và rollback version nằm trong [Release Guide](docs/release-guide.md).

## Phạm vi MVP

MVP nhận `.mmd`, `.puml`, `.plantuml`, `.dot`, `.d2`; SVG là đầu ra mặc định và PNG dùng cho engine công bố hỗ trợ. Không tự quét source code ứng dụng để suy ra kiến trúc, không tự export khi save, không tự commit từ CI, và chưa có playground, database, Redis hay SaaS billing.
