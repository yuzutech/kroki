# Đặc tả tính năng: Nền tảng Code To UML tự lưu trữ

**Nhánh tính năng**: `001-code-to-uml-platform`  
**Ngày tạo**: 2026-07-22  
**Trạng thái**: MVP đã triển khai  
**Đầu vào**: Xây dựng nền tảng Diagram as Code tự lưu trữ dựa trên Kroki, có Web Playground, Dashboard, tài khoản, PostgreSQL, chia sẻ cộng tác, VS Code extension và GitHub Action.

## Kịch bản người dùng và kiểm thử *(bắt buộc)*

### User Story 1 - Soạn thảo và xem trước diagram (Ưu tiên: P1)

Là lập trình viên, tôi muốn viết source diagram và xem kết quả ngay bên cạnh để tài liệu kiến trúc luôn đồng bộ với nội dung đang chỉnh sửa.

**Lý do ưu tiên**: Đây là luồng sử dụng cốt lõi của Code To UML.

**Kiểm thử độc lập**: Mở một source hợp lệ, thay đổi nội dung và xác nhận Live Preview chỉ hiển thị kết quả mới nhất, giữ đúng tỷ lệ và không bị CSS của giao diện làm biến dạng.

**Kịch bản chấp nhận**:

1. **Cho trước** source hợp lệ, **Khi** người dùng mở Live Preview, **Thì** diagram được render bên cạnh editor.
2. **Cho trước** Preview đang mở, **Khi** source thay đổi liên tục, **Thì** request được debounce và kết quả cũ không ghi đè kết quả mới.
3. **Cho trước** diagram rộng hoặc cao, **Khi** kết quả xuất hiện, **Thì** diagram giữ tỷ lệ, có vùng cuộn và vẫn đọc được nội dung.
4. **Cho trước** source sai cú pháp, **Khi** render, **Thì** lỗi được hiển thị tại diagram tương ứng mà không làm hỏng các diagram hợp lệ khác.
5. **Cho trước** file được hỗ trợ, **Khi** người dùng lưu file, **Thì** Preview được cập nhật nếu `renderOnSave` đang bật.

### User Story 2 - Markdown chứa nhiều diagram (Ưu tiên: P1)

Là người viết tài liệu kỹ thuật, tôi muốn đặt nhiều loại diagram trong cùng một file Markdown và xem tất cả bằng Markdown Preview của VS Code.

**Lý do ưu tiên**: Tài liệu kiến trúc thực tế thường kết hợp giải thích, sequence, class, database và deployment diagram trong cùng một trang.

**Kiểm thử độc lập**: Mở `all-diagrams.md`, nhấn `Ctrl+Shift+V` và xác nhận parser nhận đủ 31 code fence, mỗi block sử dụng đúng renderer và không lặp tiêu đề.

**Kịch bản chấp nhận**:

1. **Cho trước** Markdown có nhiều code fence được hỗ trợ, **Khi** mở Markdown Preview, **Thì** mỗi fence được thay bằng diagram tương ứng.
2. **Cho trước** heading nằm ngay trước code fence, **Khi** render, **Thì** heading được dùng làm tên và không xuất hiện caption trùng lặp.
3. **Cho trước** fence có `title="..."`, **Khi** render, **Thì** title tường minh được ưu tiên.
4. **Cho trước** một block sai và các block còn lại hợp lệ, **Khi** xem Preview, **Thì** chỉ block sai không render.
5. **Cho trước** renderer có kích thước đặc thù, **Khi** hiển thị, **Thì** quy tắc scale phù hợp được áp dụng để nội dung dễ đọc.

### User Story 3 - Export diagram (Ưu tiên: P1)

Là lập trình viên, tôi muốn xuất diagram thành artifact để đưa vào tài liệu, Pull Request, website hoặc pipeline.

**Lý do ưu tiên**: Preview chỉ phục vụ lúc chỉnh sửa; artifact là kết quả cần chia sẻ và lưu trữ.

**Kiểm thử độc lập**: Export file đơn thành SVG, PNG và PDF; sau đó Export một Markdown nhiều diagram theo từng block và theo chế độ All.

**Kịch bản chấp nhận**:

1. **Cho trước** file diagram đơn, **Khi** chọn Export, **Thì** extension tự nhận engine và cho chọn định dạng phù hợp.
2. **Cho trước** Markdown có nhiều diagram, **Khi** chọn Export, **Thì** người dùng thấy danh sách gồm tên và engine của từng diagram.
3. **Cho trước** người dùng chọn Mermaid, **Khi** Export, **Thì** chỉ block Mermaid được xuất.
4. **Cho trước** người dùng chọn **All diagrams**, **Khi** Export, **Thì** mọi diagram hợp lệ được ghép theo chiều dọc thành một SVG.
5. **Cho trước** một số block không hợp lệ, **Khi** Export All, **Thì** artifact vẫn được tạo từ các block hợp lệ và danh sách block bị bỏ qua được thông báo.
6. **Cho trước** không có block nào render được, **Khi** Export All, **Thì** thao tác thất bại với thông báo rõ ràng.

### User Story 4 - Quản lý tài khoản và diagram trên web (Ưu tiên: P2)

Là người dùng, tôi muốn đăng ký, đăng nhập, lưu diagram và mở lại từ Dashboard để tiếp tục công việc trên nhiều phiên.

**Lý do ưu tiên**: Lưu trữ tập trung biến rendering service thành một nền tảng sử dụng lâu dài.

**Kiểm thử độc lập**: Đăng ký tài khoản mới, tạo diagram, đổi tên trước khi lưu, cập nhật source, trở về Dashboard và mở lại đúng diagram.

**Kịch bản chấp nhận**:

1. **Cho trước** thông tin hợp lệ, **Khi** đăng ký hoặc đăng nhập, **Thì** web tạo session bằng cookie HttpOnly.
2. **Cho trước** editor đang mở diagram mới, **Khi** người dùng sửa tên rồi lưu, **Thì** tên, engine và source được ghi vào PostgreSQL.
3. **Cho trước** diagram đã tồn tại, **Khi** lưu lần tiếp theo, **Thì** record hiện tại được cập nhật và một version snapshot được tạo.
4. **Cho trước** Dashboard, **Khi** tải danh sách, **Thì** card hiển thị preview, tên, engine và thời gian cập nhật.
5. **Cho trước** người dùng chọn một card, **Khi** editor mở, **Thì** ID, tên, engine và source được khôi phục.
6. **Cho trước** người dùng khác biết UUID diagram, **Khi** gọi API không có quyền, **Thì** dữ liệu không được trả về.

### User Story 5 - Chia sẻ và chỉnh sửa đồng thời (Ưu tiên: P2)

Là chủ diagram, tôi muốn chia sẻ link xem hoặc chỉnh sửa để nhiều người có thể cộng tác trên cùng source theo thời gian thực.

**Lý do ưu tiên**: Diagram kiến trúc thường là sản phẩm chung của nhiều thành viên.

**Kiểm thử độc lập**: Tạo link edit, mở bằng hai browser client, chỉnh sửa đồng thời ở hai vị trí và xác nhận hai document hội tụ cùng nội dung đã được lưu.

**Kịch bản chấp nhận**:

1. **Cho trước** owner đã lưu diagram, **Khi** tạo share link, **Thì** hệ thống cấp quyền `view` hoặc `edit` và thời hạn tương ứng.
2. **Cho trước** guest có link `view`, **Khi** tham gia room, **Thì** guest nhận cập nhật realtime nhưng không thể sửa source.
3. **Cho trước** guest có link `edit`, **Khi** nhiều client sửa đồng thời, **Thì** Yjs CRDT merge thay đổi thay vì last-write-wins.
4. **Cho trước** room đang hoạt động, **Khi** client tham gia hoặc rời đi, **Thì** presence/online count được cập nhật.
5. **Cho trước** source đã ổn định sau debounce, **Khi** persistence chạy, **Thì** source và version snapshot được ghi vào PostgreSQL.
6. **Cho trước** link hết hạn hoặc bị thu hồi, **Khi** guest gọi API hoặc WebSocket, **Thì** truy cập bị từ chối.

### User Story 6 - Xác thực extension và CI/CD (Ưu tiên: P2)

Là lập trình viên, tôi muốn dùng API key trong VS Code và GitHub Action để truy cập hosted service mà không đưa secret vào source control.

**Lý do ưu tiên**: Extension và automation cần cơ chế xác thực độc lập với cookie trình duyệt.

**Kiểm thử độc lập**: Tạo API key, kết nối extension, xác nhận tên tài khoản, xoay key và kiểm tra key cũ bị đăng xuất; sau đó dùng key mới trong pipeline.

**Kịch bản chấp nhận**:

1. **Cho trước** API key hợp lệ, **Khi** extension lưu key, **Thì** key nằm trong VS Code SecretStorage và sidebar hiển thị `Hello, <tên người dùng>`.
2. **Cho trước** tài khoản tạo key mới, **Khi** transaction hoàn tất, **Thì** mọi key cũ của tài khoản bị thu hồi.
3. **Cho trước** extension đang dùng key bị thu hồi, **Khi** `/api/auth/me` trả 401, **Thì** extension xóa key và quay về Local mode.
4. **Cho trước** repository secret chứa API key, **Khi** GitHub Action chạy, **Thì** source được gửi đến Gateway và artifact được ghi vào output chỉ định.
5. **Cho trước** local service không yêu cầu authentication, **Khi** không có API key, **Thì** Preview và Export vẫn hoạt động.

Trong môi trường mentor yêu cầu localhost, GitHub workflow sử dụng self-hosted runner trên cùng máy chạy Docker, gọi trực tiếp `http://localhost:8000` và không yêu cầu deploy public.

### User Story 7 - Vận hành self-hosted (Ưu tiên: P1)

Là người vận hành, tôi muốn triển khai toàn bộ nền tảng bằng Docker trong mạng riêng để source nội bộ không đi qua dịch vụ công cộng.

**Lý do ưu tiên**: Self-hosted, cô lập renderer và kiểm soát dữ liệu là giá trị chính của nền tảng.

**Kiểm thử độc lập**: Khởi động deployment sạch, kiểm tra health, render toàn bộ 31 endpoint, restart service và xác nhận PostgreSQL vẫn giữ dữ liệu.

**Kịch bản chấp nhận**:

1. **Cho trước** Docker và `.env` hợp lệ, **Khi** chạy Compose, **Thì** Gateway, PostgreSQL, Kroki core và companion renderer khởi động thành công.
2. **Cho trước** client bên ngoài Docker network, **Khi** truy cập hệ thống, **Thì** chỉ Gateway port 8000 được công khai.
3. **Cho trước** request render hợp lệ, **Khi** cache miss, **Thì** Gateway proxy đến renderer, lưu cache và trả output.
4. **Cho trước** request giống nhau trong TTL, **Khi** gửi lại, **Thì** Gateway trả cache hit cùng ETag.
5. **Cho trước** vượt quota request, **Khi** rate limiter kiểm tra, **Thì** Gateway trả HTTP 429.
6. **Cho trước** Compose được dừng không dùng `-v`, **Khi** khởi động lại, **Thì** tài khoản và diagram vẫn tồn tại.

### User Story 8 - Đánh giá thay đổi diagram trong Pull Request (Ưu tiên: P2)

Là reviewer, tôi muốn bot tự phát hiện diagram thay đổi giữa base branch và nhánh Pull Request để hiểu nhanh phần kiến trúc được thêm, sửa hoặc xóa.

**Lý do ưu tiên**: Source diff thuần văn bản khó cho thấy tác động cấu trúc của một thay đổi diagram.

**Kiểm thử độc lập**: Tạo PR thay đổi PlantUML, Mermaid và Markdown fenced diagram; xác nhận workflow tạo một SVG có legend, màu đúng, artifact và comment không bị nhân bản.

**Kịch bản chấp nhận**:

1. **Cho trước** Pull Request có diagram thay đổi, **Khi** workflow chạy, **Thì** Action tự lấy base/head SHA từ event.
2. **Cho trước** node chỉ có ở base, **Khi** tạo change map, **Thì** node có nền/viền đỏ và trạng thái removed.
3. **Cho trước** node giữ ID nhưng đổi nội dung, **Khi** tạo change map, **Thì** node có nền/viền vàng và trạng thái modified.
4. **Cho trước** node chỉ có ở head, **Khi** tạo change map, **Thì** node có nền/viền xanh và trạng thái added.
5. **Cho trước** quan hệ đổi label nhưng giữ hai đầu, **Khi** so sánh, **Thì** edge được đánh dấu modified thay vì một edge removed cộng một edge added.
6. **Cho trước** Markdown có nhiều fenced diagram, **Khi** chỉ một block thay đổi, **Thì** báo cáo chỉ đưa block đó vào.
7. **Cho trước** renderer chưa có semantic parser, **Khi** file thay đổi, **Thì** báo cáo dùng file-level fallback có nhãn rõ ràng.
8. **Cho trước** workflow chạy lại sau khi push thêm commit, **Khi** bot comment, **Thì** comment cũ được cập nhật thay vì tạo comment mới.
9. **Cho trước** có change map, **Khi** job hoàn tất, **Thì** SVG được upload thành workflow artifact và Job Summary có thống kê.

### Cách người dùng sử dụng hệ thống

**Thiết lập lần đầu**:

1. Sao chép `.env.example` thành `.env` và cấu hình password, public URL cùng cookie security.
2. Chạy `docker compose -f compose.code-to-uml.yml up -d --build`.
3. Mở `http://localhost:8000`, đăng ký tài khoản và tạo API key nếu cần.
4. Cài VS Code extension, đặt `codeToUml.serverUrl` và nhập API key cho hosted service.
5. Nếu muốn extension nằm bên phải, kéo Code To UML view/icon bằng chuột sang Secondary Side Bar; không cần nút di chuyển riêng.
6. Với CI/CD, lưu key trong GitHub Secret và cấu hình action.

**Workflow hằng ngày trên web**:

1. Mở Dashboard và chọn diagram cũ hoặc tạo diagram mới.
2. Đặt tên ngay trên editor, chọn engine và sửa source.
3. Xem Live Preview, zoom bằng wheel/pinch và pan bằng chuột trái.
4. Lưu diagram, tạo share link nếu cần cộng tác.
5. Quay lại Dashboard để xem preview và lịch sử diagram đã lưu.

**Workflow hằng ngày trong VS Code**:

1. Mở file diagram hoặc Markdown có nhiều fenced diagram.
2. Dùng Live Preview hoặc nhấn `Ctrl+Shift+V` cho Markdown Preview.
3. Lưu source để cập nhật preview khi `renderOnSave` bật.
4. Export một diagram thành SVG/PNG/PDF hoặc ghép các diagram hợp lệ thành một SVG.
5. Commit source và artifact khi quy trình repository yêu cầu.

### Các trường hợp biên

- Source rỗng, sai cú pháp, vượt giới hạn body hoặc sử dụng engine/format không được phép.
- Một Markdown chứa code fence không được hỗ trợ, nhiều block cùng engine hoặc nhiều block trùng tên.
- Một block lỗi trong khi các block khác hợp lệ.
- Diagram có tỷ lệ cực rộng, cực cao, kích thước rất nhỏ hoặc nền trong suốt.
- Request render cũ hoàn thành sau request mới.
- Renderer phụ mất kết nối, timeout hoặc chưa sẵn sàng sau khi restart.
- API key bị thu hồi trong lúc extension đang mở.
- Rate limit bị vượt khi Preview, Markdown Preview hoặc test gửi nhiều request liên tục.
- Share link hết hạn, bị revoke hoặc guest cố nâng quyền từ `view` lên `edit`.
- Hai hoặc nhiều client sửa cùng vị trí trong source.
- Database hoặc cache tạm thời không khả dụng.
- Người dùng dừng Compose với `down -v` và vô tình xóa volume PostgreSQL.

## Yêu cầu *(bắt buộc)*

### Yêu cầu chức năng

- **FR-001**: Hệ thống PHẢI cung cấp Gateway duy nhất tương thích API GET encoded và POST body của Kroki.
- **FR-002**: Hệ thống PHẢI hỗ trợ đầy đủ 31 endpoint renderer đã đăng ký trong `Server.java`.
- **FR-003**: Hệ thống PHẢI hỗ trợ output theo khả năng renderer, bao gồm SVG, PNG, PDF, JPEG và TXT.
- **FR-004**: Gateway PHẢI validate engine và format bằng allowlist trước khi proxy.
- **FR-005**: Gateway PHẢI cung cấp health endpoint và thông tin phiên bản renderer.
- **FR-006**: Gateway PHẢI cache output thành công bằng khóa phụ thuộc path, options và source; response PHẢI có ETag và trạng thái cache.
- **FR-007**: Gateway PHẢI áp dụng rate limit khác nhau cho guest và user đã xác thực.
- **FR-008**: Web PHẢI hỗ trợ đăng ký, đăng nhập, đăng xuất và session cookie HttpOnly.
- **FR-009**: Password PHẢI được salt và hash; token, session và API key PHẢI chỉ được lưu dưới dạng hash.
- **FR-010**: API key raw PHẢI chỉ hiển thị một lần và việc tạo key mới PHẢI thu hồi key cũ của cùng tài khoản.
- **FR-011**: Dashboard PHẢI là screen riêng và hiển thị diagram đã lưu bằng card có preview, tên, engine và thời gian cập nhật.
- **FR-012**: Tên diagram PHẢI chỉnh sửa được trực tiếp trong editor trước khi lưu.
- **FR-013**: Save lần đầu PHẢI tạo diagram; các lần sau PHẢI cập nhật đúng diagram hiện tại và lưu version snapshot.
- **FR-014**: Diagram API PHẢI kiểm tra ownership cho mọi thao tác đọc và ghi.
- **FR-015**: Hệ thống PHẢI tạo share link quyền `view` hoặc `edit`, có thời hạn và có thể thu hồi.
- **FR-016**: Realtime collaboration PHẢI dùng CRDT để merge concurrent updates và PHẢI persist source sau debounce.
- **FR-017**: Guest quyền view KHÔNG ĐƯỢC sửa source; guest quyền edit được tham gia mà không bắt buộc có tài khoản.
- **FR-018**: Extension PHẢI tự nhận engine từ extension, language ID, source syntax hoặc Markdown fence.
- **FR-019**: Extension PHẢI lưu API key trong SecretStorage và nhận diện user qua `/api/auth/me`.
- **FR-020**: Extension PHẢI cung cấp Live Preview, render-on-save, follow-active-editor và Export.
- **FR-021**: Markdown Preview của VS Code PHẢI render mọi fenced diagram được hỗ trợ khi người dùng nhấn `Ctrl+Shift+V`.
- **FR-022**: Markdown parser PHẢI lấy tên từ `title`, heading gần nhất, source title hoặc fallback ổn định.
- **FR-023**: Preview PHẢI cô lập SVG khỏi CSS của VS Code, giữ tỷ lệ và ưu tiên khả năng đọc.
- **FR-024**: Lỗi của một diagram KHÔNG ĐƯỢC ngăn các diagram hợp lệ khác render.
- **FR-025**: Export PHẢI cho chọn từng diagram; Export All PHẢI bỏ qua block lỗi, ghép block hợp lệ và báo danh sách bị bỏ qua.
- **FR-026**: Activity Bar view PHẢI sử dụng cơ chế native của VS Code để người dùng kéo sang Secondary Side Bar, không thêm nút di chuyển riêng.
- **FR-027**: GitHub Action PHẢI nhận server URL, API key, engine, format, source và output.
- **FR-028**: Deployment mặc định chỉ được publish Gateway; PostgreSQL, Kroki core và companion renderer không được expose trực tiếp.
- **FR-029**: PostgreSQL PHẢI lưu user, session, API key, diagram, version, share link và render cache.
- **FR-030**: Test coverage PHẢI phát hiện khi registry server, parser extension và file ví dụ không còn đồng bộ.
- **FR-031**: GitHub Action PHẢI hỗ trợ chế độ `pr-diff` và tự lấy base/head SHA từ Pull Request event.
- **FR-032**: PR diff PHẢI phân tích semantic node/edge cho Mermaid, PlantUML/C4, Graphviz/DOT, D2 và DBML.
- **FR-033**: PR diff PHẢI xử lý từng fenced diagram trong Markdown như một đơn vị độc lập.
- **FR-034**: Change map PHẢI dùng đỏ cho removed, vàng cho modified, xanh cho added và có legend rõ ràng.
- **FR-035**: Renderer chưa có structural parser PHẢI dùng file-level fallback và KHÔNG ĐƯỢC suy đoán node.
- **FR-036**: Action PHẢI upload SVG artifact, ghi Job Summary và cập nhật một PR comment cố định.
- **FR-037**: File rename PHẢI được so sánh giữa path cũ ở base và path mới ở head.
- **FR-038**: Workflow localhost PHẢI chạy trên self-hosted runner cùng máy với Docker và KHÔNG yêu cầu public deployment.
- **FR-039**: Self-hosted PR workflow KHÔNG ĐƯỢC chạy đối với Pull Request đến từ fork không tin cậy.

### Ranh giới phạm vi

- Visual drag-and-drop editor và việc chuyển đổi hai chiều giữa đồ họa với source nằm ngoài phạm vi hiện tại.
- Extension không cung cấp chatbot AI hoặc tự sinh kiến trúc từ toàn bộ codebase trong phạm vi hiện tại.
- Device authorization API có thể tồn tại ở backend nhưng extension hiện tại dùng API key hoặc Local mode.
- OAuth, billing, subscription, organization/team role và marketplace publishing chưa thuộc MVP hiện tại.
- HTTPS termination, Redis distributed rate limit và object storage là trách nhiệm của deployment production tương lai.
- Hệ thống không tự commit, tự sửa Pull Request hoặc tự công khai diagram.

### Thực thể chính

- **User**: Tài khoản sở hữu diagram, session và API key.
- **Session**: Web session hoặc access token được lưu dưới dạng hash và có thời hạn.
- **API Key**: Credential dạng `ctu_...` dành cho extension, CI/CD và API client.
- **Diagram**: Tên, engine, source, options, owner, trạng thái public và timestamps.
- **Diagram Version**: Snapshot source/options được tạo khi diagram thay đổi.
- **Share Link**: Token chia sẻ đã hash, permission, expiry và trạng thái revoke.
- **Collaboration Room**: Y.Doc/Y.Text, clients đang online và persistence timer của một diagram.
- **Render Cache Entry**: Cache key, content type, body, created time và expiry.
- **Markdown Diagram Block**: Title, engine, source và vị trí của một fenced block.
- **Generated Artifact**: SVG, PNG, PDF, JPEG hoặc TXT do renderer tạo.

## Tiêu chí thành công *(bắt buộc)*

### Kết quả đo lường được

- **SC-001**: Người dùng mới có thể chạy local bằng Docker, mở web và render diagram đầu tiên trong vòng 15 phút.
- **SC-002**: Parser extension nhận đúng 31/31 example trong `all-diagrams.md` và không bỏ sót endpoint đã đăng ký.
- **SC-003**: Toàn bộ 31 example hợp lệ trả HTTP 200 khi chạy integration test trên deployment khỏe mạnh.
- **SC-004**: Với thay đổi source liên tục, chỉ kết quả Preview mới nhất được hiển thị.
- **SC-005**: Một block Markdown lỗi không làm mất kết quả của bất kỳ block hợp lệ nào.
- **SC-006**: Export All tạo artifact khi có ít nhất một diagram hợp lệ và báo chính xác mọi diagram bị bỏ qua.
- **SC-007**: API key cũ trả 401 ngay sau khi tài khoản tạo key mới; extension tự quay về Local mode trong chu kỳ kiểm tra kế tiếp.
- **SC-008**: Hai client cộng tác đồng thời hội tụ về cùng source và source cuối được persist vào PostgreSQL.
- **SC-009**: Sau restart không xóa volume, tài khoản, diagram, versions và share metadata vẫn tồn tại.
- **SC-010**: Kroki core, PostgreSQL và companion renderer không có public host port trong Compose mặc định.
- **SC-011**: VSIX được package thành công và có thể cài bằng `code --install-extension ... --force`.
- **SC-012**: Người dùng có thể kéo Code To UML view giữa Primary và Secondary Side Bar bằng hành vi native của VS Code.
- **SC-013**: Change map render thành SVG hợp lệ và chứa đủ ba màu trạng thái trong integration test.
- **SC-014**: Unit test xác nhận đúng added/modified/removed cho node, edge, C4 macro, Mermaid sequence và Markdown block.

## Giả định

- Người dùng đã cài Docker Desktop và VS Code phiên bản tương thích extension.
- Người vận hành cung cấp HTTPS, DNS, backup, monitoring và secret management khi triển khai production.
- Client có thể truy cập Gateway qua local network hoặc public URL được cấu hình.
- Renderer companion có đủ CPU/RAM và được phép khởi động trước khi nhận traffic.
- Người dùng hiểu cú pháp của engine diagram họ lựa chọn.
- GitHub runner có thể truy cập Gateway và API key được lưu bằng GitHub Secrets.
- `down -v` chỉ được dùng khi chủ ý xóa toàn bộ dữ liệu PostgreSQL.
- Các thay đổi renderer trong tương lai phải cập nhật registry, parser, example và coverage test cùng lúc.
