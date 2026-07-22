# Environment Bootstrap

Phần này được thực hiện một lần trên máy phát triển hoặc máy chủ vận hành.

## Máy phát triển Windows

1. Cài Git, Node.js 24 LTS, VS Code 1.100 trở lên và Docker Desktop dùng WSL 2.
2. Chỉ khi sửa phần lõi Kroki Java, cài Temurin JDK 21 và bảo đảm `java -version` nhận Java 21.
3. Mở Docker Desktop và đợi `docker info` chạy thành công.
4. Trong `D:\MyKroki\product`, chạy `npm ci`.
5. Trong `product\deploy`, tạo `.env` từ `.env.example`.
6. Tạo API key và verifier record:

```powershell
cd D:\MyKroki\product
npm run key:generate -- local-admin
```

7. Lưu plaintext key vào client secret store và chép JSON verifier record vào `DIAGRAM_API_KEY_RECORDS` trong `.env`. Plaintext chỉ được in một lần.

Không commit `product/deploy/.env`. Có thể chạy local với image Kroki đã pin trước; không cần build Java để phát triển Gateway, extension hoặc Action.

## Build fork Kroki

Chỉ cần bước này sau khi sửa source upstream Kroki:

```powershell
cd D:\MyKroki
.\mvnw.cmd --no-transfer-progress clean package
$env:TAG = "fork-local"
docker buildx bake kroki --set "kroki.tags=upgrade-diagram/kroki:fork-local" --load
```

Sau đó đặt `KROKI_IMAGE=upgrade-diagram/kroki:fork-local` trong `product/deploy/.env` và restart Compose.

## GitHub bên ngoài repo

1. Tạo repository secret `DIAGRAM_API_KEY`.
2. Tạo repository variable `DIAGRAM_GATEWAY_URL`, ví dụ `https://diagrams.internal.example.com`.
3. Cài GitHub self-hosted runner trên máy có thể truy cập URL nội bộ của Gateway.
4. Gắn label `diagram-renderer` cho runner và copy workflow mẫu từ `product/examples/github/diagram-check.yml`.
5. Bật branch protection, yêu cầu check `Diagram check / diagrams` trước khi merge.

Không đưa API key vào `.diagram.yml`, source code, workflow literal hoặc log.
