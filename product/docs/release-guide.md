# Release Guide

Quy trình này chuẩn bị release ở local. Người vận hành tự thực hiện mọi thao tác Git và GitHub.

## 1. Kiểm tra trước release

1. Xác nhận các package có cùng version và release notes tồn tại tại `product/docs/releases/<version>.md`.
2. Chạy `git status` và chỉ giữ những thay đổi chủ đích.
3. Export lại mọi SVG đã cũ rồi chạy Diagram Check. Không release khi source và SVG lệch nhau.
4. Xác nhận Docker đang chạy nếu cần build và smoke test Gateway image.

## 2. Chuẩn bị artifact local

Trong `product`, chạy:

```powershell
npm ci
npm run release:prepare
```

Lệnh này chạy audit, typecheck, test, build, đóng gói VSIX và tạo:

```text
product/release/product-v<version>/
```

Thư mục chứa VSIX, Action bundle, deployment files, manifest và `SHA256SUMS`. Đây là output local bị Git ignore, không commit.

## 3. Build Gateway image local

```powershell
cd D:\MyKroki\product
docker build -f gateway/Dockerfile -t diagram-as-code-gateway:0.1.0 .
docker image inspect diagram-as-code-gateway:0.1.0
```

Trước khi publish, chạy stack bằng image versioned trên một port thử nghiệm và xác nhận `/health`, `/health/ready` cùng bốn renderer.

## 4. Git và GitHub do người vận hành thực hiện

Sau khi xem diff và kết quả kiểm thử, người vận hành tự chạy các bước tương đương:

```powershell
git add <cac-file-release-chu-dich>
git commit -m "chore: prepare product v0.1.0"
git push origin main
git tag -a product-v0.1.0 -m "Diagram as Code 0.1.0"
git push origin product-v0.1.0
```

Tag `product-v0.1.0` kích hoạt `Product Release`: workflow kiểm tra lại, tạo GitHub Release và publish Gateway image lên GHCR. Không tạo tag trước khi commit chuẩn bị release đã có mặt trên remote.

## 5. Xác nhận sau release

- Tải VSIX từ release, kiểm tra SHA-256 và cài thử trên VS Code sạch.
- Pull Gateway image theo tag, không chỉ dùng `latest`.
- Chạy `/health`, `/health/ready`, smoke test bốn renderer và một lần preview/export từ extension.
- Xác nhận Action bằng một repository thử nghiệm trước khi bật required check.

## Rollback

- Extension: cài lại VSIX của version ổn định trước đó.
- Gateway: đổi `GATEWAY_IMAGE` về tag cũ rồi chạy lại Compose.
- GitHub Action: đổi `uses: ...@product-vX.Y.Z` về tag cũ.
- Không di chuyển hoặc ghi đè release tag đã phát hành; tạo patch version mới cho bản sửa.
