---
schema: pirl-plan/v1
content_language: vi
plan_set: portfolio-gaps_20261014-233844
task_id: T04
title: "Font hỗ trợ tiếng Việt: Playfair Display cho tiêu đề, Be Vietnam Pro cho nội dung"
layer: implement
status: planned
depends_on: []
created_at: "2026-10-15T00:24:01+07:00"
target_repo: ".repos/Portfolio"
source_request: "Đổi sang font hỗ trợ tiếng Việt; lập Plan cho các gap mới phát hiện; cải thiện UI/UX đẹp mắt, công nghệ, sang trọng"
planning_roles: [business-analyst, code-analyst, ux-designer]
implementation_roles: [frontend-developer]
verification_roles: [code-reviewer, ux-designer, code-analyst]
---

# T04: Font hỗ trợ tiếng Việt: Playfair Display cho tiêu đề, Be Vietnam Pro cho nội dung

## Cần làm gì

- REQ-01 | Nguồn: người dùng yêu cầu "đổi sang font có hỗ trợ tiếng Việt" và chọn "Playfair Display + Be Vietnam Pro". Kiểm khi lập Plan: `index.html` tại `a50912c` tải `family=Sofia+Sans:opsz,wght@8..144,300..700`, Google Fonts trả HTTP 400 vì Sofia Sans không có trục `opsz`, nên trang đang hiển thị bằng Arial; Sofia Sans cũng không có subset `vietnamese`. Link `family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Playfair+Display:wght@400..700&display=swap` trả HTTP 200 và có subset `vietnamese` cho cả hai họ font; Be Vietnam Pro là font tĩnh, khai dạng khoảng `wght@300..700` thì trả HTTP 400 | Yêu cầu: `index.html` tải đúng link HTTP 200 ở trên, giữ hai thẻ `preconnect`. Không còn tham chiếu Sofia Sans trong source.
- REQ-02 | Nguồn: lựa chọn của người dùng (tiêu đề Playfair, nội dung Be Vietnam Pro). Suy ra, không hỏi: phạm vi "tiêu đề" và font dự phòng | Yêu cầu:
  - `--font-family-primary: 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif` dùng cho toàn trang.
  - Token mới `--font-family-display: 'Playfair Display', Georgia, 'Times New Roman', serif` dùng cho: tên ở logo `Header`, `h1` của `Personal`, mọi `h2` tiêu đề section, tiêu đề lớn của `Footer`.
  - `h3` (tiêu đề thẻ) và mọi chữ còn lại dùng font nội dung.
  - Font dự phòng đều có chữ tiếng Việt.
- REQ-03 | Nguồn: suy ra từ font đã chọn: Be Vietnam Pro chỉ có trọng số 100–900 theo bậc 100; link tải 300–700. `--font-weight-regular: 450` tại `a50912c` không có trong font mới | Yêu cầu: Mọi `font-weight` mà CSS áp cho chữ dùng Be Vietnam Pro thuộc {300, 400, 500, 600, 700}. Chữ dùng Playfair Display thuộc khoảng 400–700. Đổi `--font-weight-regular` thành 400.
- REQ-04 | Nguồn: suy ra: Playfair có chữ cao, dấu tiếng Việt chồng hai tầng (Ẫ, Ỗ, Ặ) | Yêu cầu: Mọi phần tử dùng `--font-family-display` có `line-height` ≥ 1.15 (tại `a50912c`, `--line-height-h1` là 1). Không phần tử tiêu đề nào cắt chữ bằng `overflow: hidden` hay chiều cao cố định.
- REQ-05 | Nguồn: `docs/DESIGN.md` mục 3 "Typography Rules" (MarkForMC, Sofia Sans, trọng số 450, H1 line-height 1); `.agents/llm-docs/repos/Portfolio.md`. Agent quyết theo quy tắc giao tài liệu theo thay đổi | Yêu cầu: Mọi đoạn trong `docs/DESIGN.md`, `docs/RESPONSIVE.md`, `DOCUMENTATION_COMPLETE.md` (cả hai ngôn ngữ) nêu giá trị mà task này đổi (tên font, trọng số, line-height của phần tử dùng font tiêu đề) khớp source sau task. Trong `docs/DESIGN.md` gồm ít nhất: mục "Font Family", "Note on Font Substitutes", các ô font, trọng số và line-height của bảng "Hierarchy" mà task này đổi, ghi chú "1:1" và câu "H1 is 1:1" ở mục Principles, câu nhắc font hay trọng số ở các mục khác. Trong tài liệu ngữ cảnh, xóa dòng GAP-05 nếu đã có (T02 thêm khi chạy trước task này).
- Phạm vi: không đổi cỡ chữ, màu, bố cục, nội dung. Cỡ chữ và thang typography thuộc T06; màu thuộc T05.
- Đường dẫn được phép sửa: `index.html` (chỉ thẻ `link` font); `src/styles/variables.css` (token font và trọng số); `src/styles/global.css`, `src/index.css`; các `src/components/*.module.css` có `font-family`, `font-weight` hoặc `line-height` của tiêu đề; `docs/DESIGN.md`, `docs/RESPONSIVE.md`, `DOCUMENTATION_COMPLETE.md` (các đoạn ở REQ-05); ở Hub: `.agents/llm-docs/repos/Portfolio.md`.
- Kết quả riêng của task: trang tải được font và hiển thị chữ tiếng Việt bằng đúng một họ font cho mỗi phần tử. Không cần task khác.

## Làm như thế nào

1. ROLE-01 (`frontend-developer`) thay link font trong `index.html` bằng link ở REQ-01.
2. ROLE-01 sửa `src/styles/variables.css`: `--font-family-primary`, thêm `--font-family-display`, `--font-weight-regular: 400`, `--line-height-h1` và line-height khác của phần tử dùng font tiêu đề ≥ 1.15.
3. ROLE-01 áp `--font-family-display` cho đúng các phần tử ở REQ-02, qua `global.css` hoặc class trong `*.module.css`. Quét mọi `font-family`, `font-weight` trong `src/` để thỏa REQ-02, REQ-03.
4. ROLE-01 sửa tài liệu theo REQ-05; quét theo `Sofia Sans`, `MarkForMC`, `450`, `line-height`. Xóa GAP-05 trong `.agents/llm-docs/repos/Portfolio.md` nếu có. Không viết test: thay đổi chỉ ở CSS/HTML, không có hành vi chức năng để khẳng định.
5. ROLE-02 (`code-reviewer`) kết luận QG-01 trên diff.
6. ROLE-03 (`ux-designer`), sau khi ROLE-01 chụp layout theo router, kết luận QG-02 từ ảnh và source hiển thị.
7. ROLE-04 (`code-analyst`) kết luận QG-03 bằng đối chiếu tài liệu với source.

Song song: không phụ thuộc T01–T03. T02 cùng sửa `index.html` (thuộc tính `lang`, `<title>`), task này chỉ sửa thẻ `link` font. T05 và T06 phụ thuộc task này: T05 viết lại mục 1, 2 của `docs/DESIGN.md` và phải giữ các câu về font mà task này đã sửa.
Bước tiếp theo: người dùng chỉ định file Plan này để Implement; Implement chỉ thực hiện T04 trong phạm vi trên.

## Vai trò tham gia

- ROLE-01 | Loại: triển khai | Vai trò: frontend-developer | Phụ trách: link font, token font, áp font tiêu đề, tài liệu ở REQ-05, tài liệu ngữ cảnh, chụp layout theo router | Đầu vào: Plan này, source lúc triển khai | Hoàn tất khi: REQ-01..REQ-05 có thay đổi tương ứng; `layout_verification` có lần chụp đạt
- ROLE-02 | Loại: kiểm chứng | Vai trò: code-reviewer | Phụ trách: QG-01 | Đầu vào: diff của ROLE-01 | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-01 kèm đường đã lần, phản ví dụ, nguồn
- ROLE-03 | Loại: kiểm chứng | Vai trò: ux-designer | Phụ trách: QG-02 | Đầu vào: ảnh và bảng kết quả layout, source hiển thị | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-02 kèm ảnh đã xem, phản ví dụ, nguồn
- ROLE-04 | Loại: kiểm chứng | Vai trò: code-analyst | Phụ trách: QG-03 | Đầu vào: diff của ROLE-01 | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-03 kèm khẳng định đã đối chiếu, nguồn
- Lập Plan | Vai trò: business-analyst, code-analyst, ux-designer | Cách thực hiện: người điều phối tự thực hiện lần lượt; không có phản biện độc lập

## Tiêu chí chất lượng bắt buộc

- QG-01 | Yêu cầu: REQ-01, REQ-02, REQ-03, REQ-04 | Logic bắt buộc:
  - `index.html` có đúng link ở REQ-01: Be Vietnam Pro khai từng trọng số, không dùng khoảng; Playfair Display dùng `wght@400..700`; có `display=swap`; không có `opsz`.
  - Mọi khai báo `font-family` trong `src/**/*.css` dùng `var(--font-family-primary)` hoặc `var(--font-family-display)`. Không còn chuỗi `Sofia Sans` trong `src/` và `index.html`.
  - Font tiêu đề áp đúng: logo `Header`, `h1` của `Personal`, mọi `h2` tiêu đề section, tiêu đề `Footer`. `h3` và chữ còn lại dùng font nội dung.
  - Mọi `font-weight` thỏa REQ-03; không còn 450.
  - Phần tử dùng font tiêu đề có `line-height` ≥ 1.15, không bị `overflow: hidden` hay chiều cao cố định cắt chữ.
- QG-02 | Yêu cầu: REQ-01, REQ-02, REQ-04 | Logic bắt buộc: Ở khổ 1280×800 và 360×800:
  - Tiêu đề ở REQ-02 hiển thị bằng font serif (Playfair Display), chữ còn lại bằng font không chân (Be Vietnam Pro).
  - Không cuộn ngang. Tên ở logo `Header` không tràn hay chồng nút menu ở 360px.
  - Khi có nội dung `vi` (T02 đã hoàn tất): chữ có dấu như "Hồ sơ", "Kinh nghiệm", "Đại học" hiển thị cùng một font trong một từ; dấu không bị cắt hay chồng dòng trên.
  - Mỗi điểm không đạt được so với ảnh trước khi có diff.
- QG-03 | Yêu cầu: REQ-05 | Logic bắt buộc: Mọi đoạn trong `docs/DESIGN.md`, `docs/RESPONSIVE.md`, `DOCUMENTATION_COMPLETE.md` (cả hai ngôn ngữ) nêu tên font, trọng số hoặc line-height mà task này đổi khớp `variables.css`, CSS và `index.html` sau diff; không còn MarkForMC, MarkOffcForMC, Sofia Sans, trọng số 450 hay H1 line-height 1 ("1:1") như giá trị đang dùng. `.agents/llm-docs/repos/Portfolio.md` không có GAP-05. Kết luận đúng dù T02 hoàn tất trước hay sau task này.
