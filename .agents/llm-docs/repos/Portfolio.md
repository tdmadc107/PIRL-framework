# Portfolio

Tài liệu ngữ cảnh của repo `.repos/Portfolio` cho Agent của Hub. Sản phẩm là
trang portfolio cá nhân một trang: hồ sơ, học vấn, kinh nghiệm, dự án, chứng
chỉ, thành tích. Nội dung đối chiếu với source tại commit `a50912c` (nhánh
`master`, cũng là nhánh mặc định của remote).

## Đọc trước khi làm

| Nguồn trong repo | Khi nào đọc |
| --- | --- |
| `docs/DESIGN.md` | Khi chạm giao diện: hệ thiết kế đang dùng, khớp token trong `src/styles/variables.css` |
| `docs/RESPONSIVE.md` | Khi chạm bố cục theo khổ màn hình; ngưỡng 480/768/1024 px khớp media query trong CSS |
| `AGENTS.md` | Chỉ chứa hướng dẫn chung khi triển khai lên Vercel |

`DOCUMENTATION_COMPLETE.md`, `src/data/README.md` và `docs/UPDATE_SUMMARY.md`
lệch source; xem mục Khoảng trống đã biết trước khi dựa vào chúng.

## Kiến trúc

- Trang tĩnh một trang: React 18, TypeScript (`strict`), Vite 4, CSS Modules.
  Không có router, backend hay lời gọi API; hằng `API_BASE_URL` trong
  `src/utils/constants.ts` chưa có nơi dùng.
- `src/App.tsx` xếp các section: `Header`, `Personal` (kèm `Skills`),
  `Education`, `Experience`, `Projects`, `Certifications`, `Achievements`,
  `Footer`, mỗi section một file trong `src/components/` cùng file
  `.module.css`.
- Nội dung hiển thị: `Projects` đọc `projects` từ `src/data/` qua alias
  `@data`; các section còn lại khai báo dữ liệu ngay trong component (ví dụ
  `educationData` trong `Education.tsx`).
- Token giao diện: `src/styles/variables.css`; style chung:
  `src/styles/global.css`, `src/index.css`.
- Quy ước kiểm từ cấu hình: alias `@`, `@components`, `@data`, `@styles`...
  trong `vite.config.ts`; Prettier (`.prettierrc`: dấu nháy đơn, có dấu chấm
  phẩy, rộng 80); Node 24 (`.nvmrc`).

## Test theo FUT

Lệnh `commands` trong `.repos/manifest.yaml` chạy từ `.repos/Portfolio`.

- `test`: một file Vitest. Test nằm cạnh component
  (`src/components/*.test.tsx`), môi trường `jsdom`, setup
  `src/test/setup.ts` nạp matcher của `@testing-library/jest-dom`.
- Không phải test theo FUT, thuộc giai đoạn build/test/release của người dùng:
  `npm test` không kèm file (chạy cả suite), `npm run build`.

## Kiểm chứng layout bằng mock

- Chạy `npx vite --open false`, mở `http://localhost:3000`. `vite.config.ts`
  đặt `open: true`, nên tắt mở trình duyệt khi chạy không giao diện. Trang
  không gọi API nên không cần mock.
- Ngôn ngữ giao diện: chỉ tiếng Anh, viết thẳng trong component; không có
  i18n.
- Khổ màn hình: máy tính 1280×800, điện thoại 360×800. Ngưỡng của repo:
  dưới 480, 480–767 (hai khổ này dùng menu hamburger,
  `src/components/Header.module.css`), 768–1023, từ 1024 px.

## Khoảng trống đã biết

Repo chưa có nơi ghi khoảng trống. Ghi vào mục này: mỗi mục có mã `GAP-NN`,
vấn đề, bằng chứng (file/symbol) và hướng xử lý gợi ý. Sửa xong thì xóa mục.

| Mã | Vấn đề | Bằng chứng | Hướng xử lý gợi ý |
| --- | --- | --- | --- |
| GAP-01 | Tài liệu mô tả dữ liệu tập trung trong `src/data/` và import qua `@data`, nhưng chỉ `Projects` dùng nó. Người sửa `src/data/` (trừ `projects.ts`) không thấy trang đổi | `DOCUMENTATION_COMPLETE.md` mục "Quản Lý Dữ Liệu", `src/data/README.md`; chỉ `src/components/Projects.tsx` import `@data`; `src/data/personal.ts` chứa giá trị mẫu (`'Your Full Name'`) không component nào dùng | Chọn một nguồn: chuyển component sang đọc `src/data/`, hoặc xóa dữ liệu thừa và sửa tài liệu |
| GAP-02 | Trang khai báo tiếng Việt nhưng nội dung là tiếng Anh. Trình đọc màn hình và công cụ tìm kiếm xử lý văn bản theo sai ngôn ngữ | `index.html`: `<html lang="vi">`; chuỗi trong `src/components/Header.tsx`, `Personal.tsx` là tiếng Anh | Đặt `lang="en"`, hoặc thêm i18n nếu cần tiếng Việt; cần quyết định sản phẩm |
| GAP-03 | Nút chọn quốc gia và ngôn ngữ ở footer hiển thị nhưng không làm gì | `src/components/Footer.tsx`: nút `Vietnam (EN)` (`aria-label="Select country and language"`) không có `onClick` | Bỏ nút hoặc gắn chức năng; cần quyết định sản phẩm |
| GAP-04 | Hai tài liệu thiết kế mang tiêu đề "Starbucks Design System" trong khi token đang dùng theo `docs/DESIGN.md` (Mastercard-inspired) | Tiêu đề `docs/RESPONSIVE.md`, `docs/UPDATE_SUMMARY.md`; chú thích đầu `src/styles/variables.css` | Đổi tiêu đề `RESPONSIVE.md`, đánh dấu `UPDATE_SUMMARY.md` là lịch sử; chi tiết từng thành phần trong `RESPONSIVE.md` chưa được đối chiếu |
