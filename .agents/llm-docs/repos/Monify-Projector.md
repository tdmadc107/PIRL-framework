# Monify-Projector

Tài liệu ngữ cảnh của repo `.repos/Monify-Projector` cho Agent của Hub. Sản
phẩm là Monifit: webapp quản lý chi tiêu cho cá nhân và hộ gia đình. Nội dung
đối chiếu với source tại commit `7cf01cb` (nhánh `develop`; nhánh mặc định của
remote là `main`).

Repo tự sở hữu quy tắc nghiệp vụ và quy ước code. Tài liệu này trỏ tới chúng,
không chép lại, và chỉ bổ sung phần Hub cần: test theo FUT, chụp layout, nơi
ghi khoảng trống đã biết.

## Đọc trước khi làm

| Nguồn trong repo | Khi nào đọc |
| --- | --- |
| `AGENTS.md` | Luôn đọc. Mục "Quy tắc luôn áp dụng" sở hữu quy ước về tiền VND, ngày nghiệp vụ theo `Asia/Ho_Chi_Minh`, kiểm tra quyền ở máy chủ, TypeScript, token SCSS và nghĩa vụ cập nhật tài liệu |
| `docs/README.md` | Luôn đọc: thứ tự nguồn sự thật, mục lục, mã quy tắc ổn định (`ACC-`, `FAM-`, `LED-`, `ANA-`, `BUD-`, `PUB-`) và bảng "Cập nhật tài liệu" |
| `docs/modules/<module>.md` | Khi chạm module `accounts`, `family`, `ledger`, `analytics-budget`, `tracking` hoặc `public-site` |
| `docs/reference/access-matrix.md` | Khi chạm quyền theo loại tài khoản, vai trò hoặc trạng thái |
| `docs/reference/api-catalog.md`, `docs/reference/errors.md` | Khi chạm endpoint, mã lỗi, hoặc dựng mock API |
| `docs/tracking/*.md` | Khi chạm Theo dõi kế hoạch chi: hợp đồng kỹ thuật viết bằng tiếng Anh |
| `docs/specs/` | Đặc tả gốc; chỉ là đích cho phần chưa triển khai, không mô tả hành vi hiện tại |
| `DESIGN.md` | Khi chạm giao diện: hệ thiết kế, màu, chữ, bo góc |

## Kiến trúc

- `backend/`: Spring Boot 3.2.0, Java 17, MongoDB, JWT; gói gốc `com.monify`.
  - `controller/`, `service/`, `model/`, `repository/`, `security/`,
    `config/`, `exception/`: tài khoản, gia đình, chuyển quyền chủ hộ, giao
    dịch, ngân sách, phân tích.
  - `ledger/`: sổ giao dịch v2 (`LedgerStore`, `Money`, `ScopeFilter`).
  - `tracking/`: module Theo dõi kế hoạch chi, chia `api`, `web`, `domain`,
    `service`, `store`, `access`, `attachments`, `exports`, `reminders`,
    `reports`, `lifecycle`.
  - Cấu hình ở `src/main/resources/application*.properties`; biến môi trường
    ở `backend/README.md`.
- `frontend/`: React 18, TypeScript, Vite 5, SCSS Modules, React Router 6,
  axios, recharts.
  - `src/pages/<màn hình>/`, `src/components/`, `src/services/` (gọi API),
    `src/domain/` (logic thuần), `src/context/` (Auth, Language, Scope,
    Theme), `src/i18n/translations.ts`, `src/styles/` (token SCSS).
  - Trình duyệt luôn gọi `/api/...` cùng origin (`src/services/api.ts`,
    `baseURL` rỗng). Vite dev proxy chuyển `/api` tới `MONIFIT_API_ORIGIN`
    (mặc định `http://localhost:8080`); trên Vercel là hàm `api/proxy.js`.
- `docs/`: đặc tả nghiệp vụ tiếng Việt; `docs/tracking/` là hợp đồng kỹ thuật
  tiếng Anh.

## Test theo FUT

Lệnh `commands` trong `.repos/manifest.yaml` chạy từ `.repos/Monify-Projector`.

- `test-backend`: một lớp JUnit trong `backend/src/test/java/com/monify/`.
- `test-backend-mongo`: các lớp `*MongoIntegrationTest`. Chúng cần một
  MongoDB thật dùng một lần, truyền qua `-Dledger.test.mongo.uri` và
  `-Dtracking.test.mongo.uri` (hoặc biến `LEDGER_TEST_MONGODB_URI`,
  `TRACKING_TEST_MONGODB_URI`); thiếu URI thì test báo lỗi, không bỏ qua.
  Không có MongoDB dùng một lần thì phần test đó `BLOCKED`; không trỏ vào
  database đang có dữ liệu thật.
- `test-frontend`: một file `node:test` trong `frontend/tests/*.test.mjs`. Cần
  `npm install` trong `frontend/` trước: nhiều test biên dịch file TypeScript
  của `src/` bằng gói `typescript`.
- Không phải test theo FUT, thuộc giai đoạn build/test/release của người dùng:
  `frontend/tests/release/*` (kịch bản nghiệm thu phát hành), `npm run build`
  (gồm `validate:*`, `tsc`, `vite build`) và `mvn test` toàn bộ.

## Kiểm chứng layout bằng mock

- Chạy `cd frontend; npm run dev`, mở `http://localhost:5173`. Không cần
  backend.
- Chặn mọi request `/api/**` ngay trong trình duyệt và trả dữ liệu theo
  `docs/reference/api-catalog.md`, `docs/tracking/api-contract.md` và kiểu
  trong `frontend/src/types/`. Trang cần đăng nhập: khi tải trang,
  `AuthContext` gọi `POST /api/auth/refresh` để khôi phục phiên, rồi trang gọi
  thêm API của nó (ví dụ `GET /api/user/profile`); mock các request đó.
- Ngôn ngữ giao diện: `vi` (mặc định) và `en`, khai báo ở kiểu `Language`
  trong `frontend/src/i18n/translations.ts`. Đặt localStorage
  `monifit_language` trước khi tải trang.
- Theme: `light` và `dark`, lưu ở localStorage `monifit_theme`; không đặt thì
  theo `prefers-color-scheme`. Chụp `light`; diff đổi token màu hoặc theme thì
  chụp thêm `dark`.
- Khổ màn hình: máy tính 1280×800, điện thoại 360×800. Ngưỡng điện thoại của
  repo là `max-width: 768px` (`src/components/layout/Layout.tsx`,
  `src/pages/tracking/useCompactViewport.ts` và phần lớn media query SCSS);
  360 px là khổ đã dùng khi ghi GAP-21.

## Khoảng trống đã biết

Ghi vào `docs/known-gaps.md` của repo: mỗi mục có mã `GAP-NN`, mức (Cao,
Trung bình, Thấp), vấn đề, bằng chứng và hướng xử lý gợi ý. Sửa xong một mục
thì xóa mục đó và ghi hành vi mới vào file module, theo bảng "Cập nhật tài
liệu" trong `docs/README.md`.
