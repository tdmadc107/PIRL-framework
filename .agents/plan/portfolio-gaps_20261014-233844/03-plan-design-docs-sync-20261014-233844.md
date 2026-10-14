---
schema: pirl-plan/v1
content_language: vi
plan_set: portfolio-gaps_20261014-233844
task_id: T03
title: "Tài liệu thiết kế khớp token và CSS đang dùng"
layer: implement
status: planned
depends_on: []
created_at: "2026-10-14T23:38:44+07:00"
target_repo: ".repos/Portfolio"
source_request: "Lập Plan giải quyết các khoảng trống đã biết (GAP-01..GAP-04) của repo Portfolio"
planning_roles: [code-analyst]
implementation_roles: [technical-writer]
verification_roles: [code-analyst]
---

# T03: Tài liệu thiết kế khớp token và CSS đang dùng

## Cần làm gì

- REQ-01 | Nguồn: GAP-04; `docs/RESPONSIVE.md` (tiêu đề "Responsive Breakpoints - Starbucks Design System"); đối chiếu khi lập Plan với CSS tại `a50912c` | Yêu cầu: `docs/RESPONSIVE.md` không còn gắn với Starbucks và nêu hệ thiết kế theo `docs/DESIGN.md`. Mỗi khẳng định về ngưỡng, chiều cao, gutter, số cột và hành vi từng thành phần khớp CSS hiện có; sai thì sửa theo CSS, không có trong CSS thì bỏ. Các điểm lệch đã thấy khi lập Plan (chưa phải danh sách đủ):
  - Chiều cao header là `--nav-height-mobile` 64px, `--nav-height-tablet` 72px, `--nav-height-desktop` 80px (`src/styles/variables.css`, `src/components/Header.module.css`); tài liệu ghi 64/72/83/99px.
  - Gutter là `--outer-gutter` 24px, `--outer-gutter-medium` 48px, `--outer-gutter-large` 96px (`src/App.module.css`); tài liệu ghi 16/24/40px. Bề rộng tối đa là `--container-max` 1280px; tài liệu ghi 1440px.
  - Certifications dùng `repeat(auto-fit, minmax(260px, 1fr))`, Achievements dùng `minmax(280px, 1fr)`; tài liệu ghi số cột cố định theo ngưỡng.
  - Footer 4 cột, còn 2 cột dưới 1024px, 1 cột dưới 768px (`src/components/Footer.module.css`); tài liệu ghi 1 → 2 → 3 cột.
  - Experience nền `--color-lifted` (`src/components/Experience.module.css`); tài liệu ghi "House Green band".
  - Mục "Testing Checklist" ghi kết quả kiểm của đợt cập nhật Starbucks, không mô tả CSS hiện tại: bỏ khỏi `RESPONSIVE.md`.
- REQ-02 | Nguồn: GAP-04; `docs/UPDATE_SUMMARY.md` (tiêu đề "... - Starbucks Design System", commit `994f88d` ngày 2026-05-14) | Yêu cầu: Đầu file có ghi chú: đây là hồ sơ lịch sử của đợt cập nhật theo Starbucks Design System, đã được thay bằng `docs/DESIGN.md` (Mastercard-inspired); token hiện hành ở `src/styles/variables.css`. Nội dung lịch sử giữ nguyên.
- REQ-03 | Nguồn: cùng vấn đề GAP-04 (tài liệu thiết kế mô tả hệ thiết kế không dùng); `DOCUMENTATION_COMPLETE.md` mục "Color Scheme"/"Color Palette" (bảng `#0f172a`, `#3b82f6`...), "Tùy Chỉnh Giao Diện"/"UI Customization" (`--primary-color`, `--spacing-*`, `--font-size-xs`..., Dark Mode) và gạch đầu dòng "Thiết Kế Hiện Đại - Gradient..."/"Modern Design - ... gradient..." ở cả hai ngôn ngữ; `src/styles/variables.css` không có các biến đó và không có `prefers-color-scheme` | Yêu cầu: Các mục này nêu đúng tên và giá trị token trong `src/styles/variables.css` (màu `--color-*`, khoảng cách `--space-*`, cỡ chữ `--font-size-*`) và trỏ tới `docs/DESIGN.md`; bỏ khẳng định Dark Mode và khẳng định giao diện dùng "gradient màu sắc hài hòa" (`docs/DESIGN.md` mục Gradient System: UI chính không dùng gradient); chỉ được nhắc gradient khi khớp CSS, ví dụ vòng trang trí `.orbit` dùng `conic-gradient` trong `src/components/Personal.module.css`.
- REQ-04 | Nguồn: `.agents/llm-docs/repos/Portfolio.md` | Yêu cầu: Xóa dòng GAP-04. Task này sở hữu phần câu cảnh báo tài liệu lệch nói về `docs/UPDATE_SUMMARY.md`: câu nói file đó là hồ sơ lịch sử thay vì tài liệu lệch. Nếu dòng GAP-06 (do T01 tạo) đã có, xóa khỏi GAP-06 mục màu/giao diện mà task này đã sửa; GAP-06 không còn mục nào thì xóa GAP-06 và bỏ `DOCUMENTATION_COMPLETE.md` khỏi câu cảnh báo. Chưa có GAP-06 thì không tạo.
- Phạm vi: chỉ tài liệu; không sửa CSS hay token. Không sửa nội dung `docs/DESIGN.md`. Không sửa các mục dữ liệu, cá nhân hóa, tính năng song ngữ của `DOCUMENTATION_COMPLETE.md` (thuộc T01, T02).
- Đường dẫn được phép sửa: `docs/RESPONSIVE.md`, `docs/UPDATE_SUMMARY.md` (chỉ phần ghi chú đầu file), `DOCUMENTATION_COMPLETE.md` (các mục ở REQ-03); ở Hub: `.agents/llm-docs/repos/Portfolio.md`.
- Kết quả riêng của task: người đọc `docs/RESPONSIVE.md` và mục giao diện của `DOCUMENTATION_COMPLETE.md` nhận đúng token và hành vi responsive của source; `docs/UPDATE_SUMMARY.md` không bị hiểu là đặc tả hiện hành.

## Làm như thế nào

1. ROLE-01 (`technical-writer`) đọc `src/styles/variables.css`, `src/index.css`, `src/App.module.css` và mọi `src/components/*.module.css`; viết lại `docs/RESPONSIVE.md` theo REQ-01: đổi tiêu đề, bảng ngưỡng theo media query thật (480/768/1024px), từng thành phần theo quy tắc CSS của nó, bảng spacing/typography theo token; mỗi khẳng định truy được về file và selector.
2. ROLE-01 thêm ghi chú lịch sử đầu `docs/UPDATE_SUMMARY.md` theo REQ-02.
3. ROLE-01 sửa các mục ở REQ-03 của `DOCUMENTATION_COMPLETE.md` (cả hai ngôn ngữ) theo `variables.css` và `docs/DESIGN.md`.
4. ROLE-01 sửa `.agents/llm-docs/repos/Portfolio.md` theo REQ-04; sửa cả bảng "Đọc trước khi làm" nếu mô tả `RESPONSIVE.md` không còn đúng.
5. ROLE-02 (`code-analyst`), sau ROLE-01, đối chiếu từng khẳng định của phần đã sửa với CSS và token để kết luận QG-01..QG-04; không chạy lệnh.

Song song: T01, T02 sửa mục khác của `DOCUMENTATION_COMPLETE.md` và dòng GAP khác của `.agents/llm-docs/repos/Portfolio.md`; T01 tạo GAP-06 nếu khi đó `DOCUMENTATION_COMPLETE.md` còn mục lệch. Không có phụ thuộc đầu ra: REQ-04 đúng dù GAP-06 đã có hay chưa.
Bước tiếp theo: người dùng chỉ định file Plan này để Implement; Implement chỉ thực hiện T03 trong phạm vi trên.

## Vai trò tham gia

- ROLE-01 | Loại: triển khai | Vai trò: technical-writer | Phụ trách: `docs/RESPONSIVE.md`, ghi chú `docs/UPDATE_SUMMARY.md`, mục thiết kế của `DOCUMENTATION_COMPLETE.md`, tài liệu ngữ cảnh | Đầu vào: CSS và token tại `a50912c`, `docs/DESIGN.md` | Hoàn tất khi: REQ-01..REQ-04 có thay đổi tài liệu tương ứng, mỗi khẳng định có nguồn CSS/token
- ROLE-02 | Loại: kiểm chứng | Vai trò: code-analyst | Phụ trách: QG-01..QG-04 | Đầu vào: diff của ROLE-01, CSS và token | Hoàn tất khi: PASS/FAIL/BLOCKED cho từng QG kèm khẳng định đã đối chiếu, phản ví dụ, nguồn
- Lập Plan | Vai trò: code-analyst | Cách thực hiện: người điều phối tự thực hiện; không có phản biện độc lập

## Tiêu chí chất lượng bắt buộc

- QG-01 | Yêu cầu: REQ-01 | Logic bắt buộc: Mỗi dòng bảng ngưỡng và mỗi mục thành phần trong `docs/RESPONSIVE.md` trỏ được tới một media query hoặc quy tắc CSS (file, selector) có đúng ngưỡng và giá trị; ngưỡng là 480/768/1024px như media query trong source. Không còn tên hay giá trị của Starbucks ("Starbucks", "House Green", "Starbucks Green"), chiều cao 83/99px, gutter 16/40px, max-width 1440px, số cột cố định của Certifications/Achievements, hay mục "Testing Checklist". Phản ví dụ phải bị loại: một mục thành phần mô tả hành vi không có quy tắc CSS nào tạo ra.
- QG-02 | Yêu cầu: REQ-02 | Logic bắt buộc: `docs/UPDATE_SUMMARY.md` mở đầu bằng ghi chú lịch sử nêu đợt cập nhật Starbucks, `docs/DESIGN.md` và `src/styles/variables.css` là nguồn hiện hành; phần còn lại của file giống bản tại `a50912c`.
- QG-03 | Yêu cầu: REQ-03 | Logic bắt buộc: Mỗi tên biến và giá trị màu, khoảng cách, cỡ chữ trong các mục ở REQ-03 (cả hai ngôn ngữ) tồn tại trong `src/styles/variables.css` với đúng giá trị; không còn biến không tồn tại (`--primary-color`, `--bg-primary`, `--spacing-md`, `--font-size-xs`...), không còn khẳng định Dark Mode hay "gradient màu sắc hài hòa"; nhắc tới gradient (nếu có) khớp `conic-gradient` của `.orbit`; mô tả bảng màu khớp `docs/DESIGN.md`.
- QG-04 | Yêu cầu: REQ-04 | Logic bắt buộc: `.agents/llm-docs/repos/Portfolio.md` không còn dòng GAP-04; câu về tài liệu lệch mô tả `docs/UPDATE_SUMMARY.md` là hồ sơ lịch sử; bảng "Đọc trước khi làm" mô tả đúng `docs/RESPONSIVE.md` sau sửa. Nếu GAP-06 tồn tại thì không còn liệt kê mục màu/giao diện; GAP-06 không còn mục nào thì đã bị xóa và câu cảnh báo không nêu `DOCUMENTATION_COMPLETE.md`. Kết luận đúng dù T01 hoàn tất trước hay sau task này.
