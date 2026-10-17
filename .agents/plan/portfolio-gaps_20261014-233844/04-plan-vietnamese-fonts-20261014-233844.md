---
schema: pirl-plan/v1
content_language: vi
plan_set: portfolio-gaps_20261014-233844
task_id: T04
title: "Font hỗ trợ tiếng Việt: Playfair Display cho tiêu đề, Be Vietnam Pro cho nội dung"
layer: implement
status: implemented
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

## Implementation Record
- status: implemented
- updated_at: "2026-10-16T23:37:54+07:00"
- changed_paths: [".repos/Portfolio: index.html (chỉ thẻ link font)", "src/styles/variables.css", "src/styles/global.css", "src/components/Header.module.css", "docs/DESIGN.md", "docs/RESPONSIVE.md", "Hub: .agents/llm-docs/repos/Portfolio.md", "Hub: file Plan này (ghi sổ)"]
- role_work: frontend-developer=done: `index.html` tải đúng link HTTP 200 (Be Vietnam Pro từng trọng số 300/400/500/600/700, Playfair Display `wght@400..700`, `display=swap`, không `opsz`), giữ hai thẻ `preconnect`; `variables.css`: `--font-family-primary: 'Be Vietnam Pro', 'Segoe UI', Arial, sans-serif`, thêm `--font-family-display: 'Playfair Display', Georgia, 'Times New Roman', serif`, `--font-weight-regular: 400`, `--line-height-h1: 1.15`; `global.css`: `h1` và `h2` dùng `--font-family-display` (logo, `h1` Personal, mọi `h2` section, tiêu đề lớn Footer; `h3` và chữ còn lại giữ font nội dung); `Header.module.css`: line-height logo 1.1 → 1.2. Sau lần chụp đầu, đo thấy hồi quy do diff ở 360×800: logo rộng 226px (trước 208px vì Be Vietnam Pro rộng hơn Arial) nên nút hamburger kết thúc tại x=346, nhô 10px ra khỏi viên thuốc header (kết thúc tại 336); đã sửa một lần: thêm `gap: var(--space-1)` trong `@media (max-width: 767px) .nav` (chỉ có tác dụng khi chật vì `justify-content: space-between`), nút về [282, 330] trong viên thuốc [24, 336]. Tài liệu REQ-05: `docs/DESIGN.md` viết lại các đoạn nêu font, trọng số, line-height (mục 1 đoạn typography, mục "Font Family", "Hierarchy" dòng H1, H2, Body, Footer link, Principles, "Note on Font Choices" thay "Note on Font Substitutes", dòng `Font:` của nút và ghost watermark, "Link rows", Do's/Don'ts, Quick Color Reference, hai prompt mẫu, Known Gaps); `docs/RESPONSIVE.md` thêm câu về họ font và line-height; `DOCUMENTATION_COMPLETE.md` và `src/data/README.md` không nêu font nên không đổi; tài liệu ngữ cảnh: xóa GAP-05 (T02 đã thêm), thêm font vào mục Kiến trúc. Quét: `Sofia|opsz|450` trong `src/` và `index.html` = 0 khớp; `MarkForMC|MarkOffc|Sofia|450|1:1` trong 4 tài liệu repo chỉ còn một câu Known Gaps nêu MarkForMC là font không dùng ở đây, `#CF4500` (chứa 450) và tỉ lệ ảnh 1:1. Không viết test (chỉ CSS/HTML, Plan không giao); code-reviewer=PASS QG-01; ux-designer=PASS QG-02 (sau một lần sửa); code-analyst=PASS QG-03
- execution_mode: tự thực hiện lần lượt (người điều phối đảm nhận frontend-developer, rồi code-reviewer, ux-designer, code-analyst); không có kiểm chứng độc lập
- checkpoint_evidence: N/A
- quality_gate_results: QG-01=PASS; QG-02=PASS; QG-03=PASS
- quality_gate_evidence: QG-01 -> code-reviewer, `index.html`, `src/styles/variables.css`, `src/styles/global.css`, `src/components/*.module.css`: link trong `index.html` khớp từng điều kiện (Be Vietnam Pro khai từng trọng số, không dùng khoảng; Playfair `wght@400..700`; có `display=swap`; không `opsz`); grep `font-family:` trong `src/**/*.css`: chỉ `var(--font-family-primary)` (body ở `index.css`, `global.css`), `var(--font-family-display)` (`h1`, `h2` ở `global.css`) và `inherit` cho `button`, `input` kế thừa; không còn `Sofia Sans`; font tiêu đề chỉ áp cho `h1` (logo Header, Personal) và `h2` (6 tiêu đề section kể cả `Skills`, tiêu đề Footer) vì mọi `h1`, `h2` trong `src/components/*.tsx` đúng là các phần tử đó; `h3` kế thừa font nội dung; grep `font-weight:` với giá trị số hoặc từ khóa = 0, mọi khai báo là `var(--font-weight-regular|medium|bold)` = 400/500/700, không còn 450, nên Be Vietnam Pro ∈ {300..700} và Playfair ∈ 400–700; line-height của phần tử dùng font tiêu đề: `h1` 1.15 (`--line-height-h1`), logo 1.2, `h2` 1.22 (`--line-height-h2`, cả khi class không khai báo vì kế thừa `global.css`), đều ≥ 1.15; grep `overflow:` chỉ khớp `.subtitleHidden`, `.portrait`, `.achievementCard`, không phần tử tiêu đề nào, không có chiều cao cố định. Phản ví dụ đã xét: logo `h1` có class riêng (`font-size: var(--logo-size)`) nhưng không khai báo `font-family`, nên vẫn nhận font tiêu đề từ `global.css`. QG-02 -> ux-designer, ảnh `T04/20261016-233137` (lần chụp cuối) và số đo: ở 1280×800 và 360×800, `en` và `vi`, thống kê kiểu chữ tính toán trên toàn trang: Playfair Display chỉ ở `h1` và `h2` (trọng số 500), Be Vietnam Pro ở mọi thẻ còn lại (trọng số 400/500/700); font đã tải thật: Be Vietnam Pro 400/500/700 và Playfair Display 400–700; line-height tính toán ≥ 1.15 và không `overflow` ở phần tử Playfair (`displayIssues` rỗng); không cuộn ngang ở 1280; ở 360 vẫn 426/360 do `span.orbit`, đúng baseline (GAP-07). Điểm không đạt do diff: lần chụp đầu, nút hamburger ở 360 nhô ra viên thuốc 10px (baseline: logo 208px, nút [280, 328] trong viên thuốc [24, 336]); sau sửa, nút [282, 330] trong [24, 336] ở cả `en` và `vi`, và nằm trong viên thuốc ở 375, 414, 480, 767. Đã xem ảnh: chữ có dấu trong từ ("Hồ sơ", "Kinh nghiệm", "Chúng tôi luôn sẵn sàng khi bạn cần.") cùng một font, dấu chồng hai tầng của Playfair không bị cắt hay chồng dòng; menu 360 và header đã cuộn hiển thị đúng. QG-03 -> code-analyst, `docs/DESIGN.md`, `docs/RESPONSIVE.md`, `DOCUMENTATION_COMPLETE.md`, `.agents/llm-docs/repos/Portfolio.md`: đối chiếu từng đoạn đã sửa với `variables.css`, `global.css`, `index.html`: tên font, hai token, trọng số 400/500/700, line-height H1 73.6px (1.15) và H2 1.22, "Loading" mô tả đúng link; grep trong bốn tài liệu: không còn MarkForMC (ngoài câu Known Gaps nói font đó không dùng), MarkOffcForMC, Sofia Sans, trọng số 450 hay "1:1" của H1 như giá trị đang dùng; tài liệu ngữ cảnh không còn GAP-05 (dù T02 chạy trước, đã xóa)
- layout_verification: đã chụp. Ngôn ngữ: `en` và `vi`. Khổ: 1280×800 và 360×800. Số ảnh: 54 (lần 1: 18; lần 2 sau sửa Header: 18, trong đó ảnh `scrolled-header` có clip sai do lỗi script chụp; lần 3 cuối: 18, clip đã sửa). Kiểm đạt ở lần 3: kiểu chữ tính toán và font đã tải như trên; không cuộn ngang ở 1280; menu hamburger 360 đủ 6 mục và nút đóng; hamburger và logo trong viên thuốc ở 360, 375, 414, 480, 767 (`header-measure-360.txt`); văn bản tiếng Việt đủ dấu, một font trong một từ; header đã cuộn đúng. Không đạt có từ trước, không do diff: cuộn ngang 360×800 (426/360, `span.orbit`, GAP-07); lỗi console 404 `/vite.svg`. Thư mục: `.tmp/layout-snapshots/portfolio-gaps_20261014-233844/T04/20261016-233137` (cuối), `.../20261016-232903`, `.../20261016-232329`
- repair_closure_evidence: N/A
- root_cause_revalidation: N/A
- review_item_disposition: N/A
- role_challenge_results: frontend-developer=PASS (tự phản biện: logo `h1` có class riêng, `h2` kế thừa line-height, hồi quy header đã bắt bằng số đo thay vì chỉ nhìn ảnh; không còn nghi vấn mở); code-reviewer=PASS (QG-01; không phần tử tiêu đề dùng font nội dung hay ngược lại); ux-designer=PASS (QG-02; điểm FAIL do diff đã sửa trong một lần, dưới giới hạn hai lần); code-analyst=PASS (QG-03)
- residual_risk: Kiểm chứng là tự thực hiện, không có phản biện độc lập. Ở 360px viên thuốc header chỉ còn cách nút 6px (trước diff: 8px); khổ nhỏ hơn 360px chưa được đo (QG chỉ nêu 360 và 1280); T05 thêm nút đổi theme vào `navActions` sẽ cần thêm chỗ ở khổ 360. Font tải từ Google Fonts khi chạy: không có mạng thì dùng font dự phòng. `docs/DESIGN.md` vẫn còn nhiều đoạn mô tả hệ Mastercard (tiêu đề, màu) thuộc T05 và mục "Country/language selector" còn nhắc mũi tên (T02 đã bỏ) thuộc T06. Việc build và chạy ứng dụng nghiệm thu thuộc giai đoạn của người dùng
- review_handoff: file Plan này; thay đổi chưa commit trong `.repos/Portfolio` (nhánh `develop`, HEAD `a50912c`) và `.agents/llm-docs/repos/Portfolio.md` ở Hub; không có report nguồn
- role_selection_source: plan
- effective_implementation_roles: frontend-developer
- Next allowed owner/layer: Implement T05 (đã được người dùng giao cùng yêu cầu; T02, T03, T04 đã `implemented`), hoặc Review T04 khi người dùng yêu cầu
- Authorization condition: Review chỉ chạy khi người dùng yêu cầu
1. Implement T05 trong `.agents/plan/portfolio-gaps_20261014-233844/05-plan-theme-fire-palette-20261014-233844.md`
