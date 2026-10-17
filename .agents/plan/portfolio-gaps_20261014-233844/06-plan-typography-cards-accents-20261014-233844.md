---
schema: pirl-plan/v1
content_language: vi
plan_set: portfolio-gaps_20261014-233844
task_id: T06
title: "Nâng cấp typography, độ sâu thẻ và chi tiết nhấn"
layer: implement
status: implemented
depends_on: [T04, T05]
created_at: "2026-10-15T00:24:01+07:00"
target_repo: ".repos/Portfolio"
source_request: "Đổi sang font hỗ trợ tiếng Việt; lập Plan cho các gap mới phát hiện; cải thiện UI/UX đẹp mắt, công nghệ, sang trọng"
planning_roles: [business-analyst, code-analyst, ux-designer]
implementation_roles: [frontend-developer]
verification_roles: [code-reviewer, ux-designer, code-analyst]
---

# T06: Nâng cấp typography, độ sâu thẻ và chi tiết nhấn

## Cần làm gì

- REQ-01 | Nguồn: người dùng yêu cầu "nâng cấp typography". Thang cỡ chữ do người điều phối tự chốt (vai trò `ux-designer`), không hỏi | Yêu cầu: Thang chữ co giãn theo bề rộng màn hình, khai token trong `variables.css`:

  | Phần tử | Font | Cỡ | Trọng số | line-height |
  | --- | --- | --- | --- | --- |
  | `h1` của `Personal` | display | `clamp(2.75rem, 1.6rem + 4.8vw, 5rem)` (44→80px) | 600 | 1.15 |
  | `h2` tiêu đề section, tiêu đề `Footer` | display | `clamp(1.875rem, 1.3rem + 2.4vw, 3rem)` (30→48px) | 600 | 1.2 |
  | Tên ở logo `Header` | display | `clamp(1.125rem, 1rem + 0.5vw, 1.5rem)` | 600 | 1.2 |
  | `h3` tiêu đề thẻ | primary | `clamp(1.1875rem, 1rem + 0.6vw, 1.5rem)` (19→24px) | 600 | 1.3 |
  | Đoạn giới thiệu của `Personal` | primary | `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)` | 400 | 1.65 |
  | Chữ nội dung | primary | `1rem` | 400 | 1.65 |
  | Eyebrow, tiêu đề cột footer | primary | `0.75rem`, chữ hoa, `letter-spacing: 0.16em` | 600 | 1.4 |
  | Chú thích, ngày tháng, chip | primary | `0.8125rem` | 500 | 1.4 |

  Đoạn văn mô tả (giới thiệu, mô tả kinh nghiệm, dự án, thành tích, thẻ highlight) có `max-width: 68ch`. Ngày tháng và số dùng `font-variant-numeric: tabular-nums`.
- REQ-02 | Nguồn: người dùng yêu cầu "độ sâu của thẻ". Người điều phối tự chốt cách thể hiện, không hỏi | Yêu cầu: Mọi thẻ dùng chung một hệ độ sâu. Thẻ gồm: thẻ highlight và nhóm kỹ năng (`Personal`, `Skills`), thẻ học vấn, kinh nghiệm, dự án, chứng chỉ, thành tích.
  - `--radius-card: 24px`; nút và chip giữ dạng viên thuốc.
  - Viền mảnh 1px chuyển màu từ `--color-accent` (khoảng 40%) sang trong suốt.
  - Hai mức bóng `--elevation-1` (nghỉ) và `--elevation-2` (hover/focus), khai theo từng theme từ `--color-shadow-rgb` của T05. Theme tối có thêm vệt sáng mảnh ở cạnh trên trong thẻ và quầng sáng màu `--color-accent` ở mức 2.
  - Hover hoặc focus bên trong thẻ: nâng `translateY(-4px)` và chuyển sang `--elevation-2`; chỉ đổi `transform`, `box-shadow`, `border-color`.
- REQ-03 | Nguồn: người dùng yêu cầu "chi tiết nhấn" (người dùng viết "chi tiết nhãn"; người điều phối hiểu là chi tiết nhấn trong lựa chọn đã đưa ra). Danh sách chi tiết do người điều phối tự chốt, không hỏi | Yêu cầu:
  - Eyebrow của mỗi section có số thứ tự hai chữ số theo thứ tự trên trang (`01` `Personal`, `02` `Skills`, `03` `Education`, `04` `Experience`, `05` `Projects`, `06` `Certifications`, `07` `Achievements`), một vạch 24px tô `--gradient-flame`, rồi nhãn eyebrow hiện có. Số thứ tự có `aria-hidden` và giống nhau ở hai ngôn ngữ.
  - Thẻ kỹ năng và công nghệ (`Skills`, `Experience`, `Projects`) là chip viên thuốc: nền `--color-surface-raised`, viền pha `--color-violet`, chấm 6px màu `--color-jade` phía trước.
  - Khoảng thời gian, ngày cấp, năm thành tích là nhãn viên thuốc: nền `--color-surface-raised`, chữ `--color-text-muted`.
  - CTA chính (liên kết mạng xã hội đầu tiên của `Personal`) có nền đặc `--color-accent`, chữ `--color-on-accent`. CTA phụ có viền 1px, không nền. Không đặt chữ trên `--gradient-flame` (quy tắc tương phản của T05).
  - Liên kết khi hover có gạch chân 2px tô `--gradient-flame`, hiện ngay, không chạy.
  - Icon của thẻ chứng chỉ và thành tích nằm trong ô 48px bo 14px, nền `--color-surface-raised`, viền chuyển màu như REQ-02.
  - Vòng quanh ảnh chân dung (`.orbit`) tô `--gradient-flame`.
  - Giá trị URL trong thẻ dự án xuống dòng được (`overflow-wrap: anywhere`), không tràn thẻ ở 360px.
  - Thay đổi đã xác nhận (người dùng giao agent chọn phương án cho mục "Cần bạn xác nhận" của báo cáo Implement, 2026-10-17, record plan-20261017-145032-T05): chấm tròn trước nhãn eyebrow hiện có bị bỏ, thay bằng số và vạch theo thứ tự trên; token `--font-weight-bold` bị bỏ vì không còn nơi dùng.
- REQ-04 | Nguồn: suy ra: yêu cầu chỉ về giao diện | Yêu cầu: Giữ nguyên thứ tự section, nội dung, cấu trúc lưới, ngưỡng 480/768/1024px và `--container-max`. Không thêm nội dung hồ sơ. Màu chỉ dùng token của T05; font chỉ dùng token của T04.
- REQ-05 | Nguồn: `docs/DESIGN.md`, `docs/RESPONSIVE.md`, `DOCUMENTATION_COMPLETE.md` sau T03–T05. Agent quyết theo quy tắc giao tài liệu theo thay đổi | Yêu cầu: Mọi đoạn nêu giá trị mà task này đổi (cỡ chữ, trọng số, letter-spacing, line-height, bo góc, độ sâu, hình dáng thành phần, chi tiết nhấn) khớp source sau task, gồm ít nhất:
  - `docs/DESIGN.md`: các ô cỡ, trọng số, letter-spacing, line-height của bảng "Hierarchy" ở các dòng task này đổi; mục Principles (ví dụ "14px / 700 / +4%" của eyebrow); câu nêu trọng số tiêu đề (ví dụ "medium weight (500)") ở mục 1 nếu còn; mục 4 "Component Stylings" (trừ câu nhắc màu, thuộc T05); mục 5 "Border Radius Scale"; mục 6 "Depth & Elevation"; mục 8 (cỡ chữ hero theo khổ màn hình, ví dụ 64/48/40px); các mục Do/Don't về hình dáng và chữ.
  - `docs/RESPONSIVE.md`: bảng typography và mục thành phần có giá trị đổi.
  - `DOCUMENTATION_COMPLETE.md` (cả hai ngôn ngữ): danh sách token cỡ chữ và bo góc.
  - Sau task, mỗi chỗ trên khớp token mới.
- Phạm vi: không đổi màu và theme (T05), font (T04), hiệu ứng chuyển động ngoài chuyển tiếp hover có sẵn (T07).
- Đường dẫn được phép sửa: `src/styles/variables.css` (token cỡ chữ, line-height, bo góc, độ sâu), `src/styles/global.css`, `src/index.css`, `src/App.module.css`, mọi `src/components/*.module.css`; `src/components/*.tsx` chỉ để thêm số thứ tự eyebrow, phần tử chấm/vạch trang trí và class; `docs/DESIGN.md`, `docs/RESPONSIVE.md`, `DOCUMENTATION_COMPLETE.md` (các phần ở REQ-05).
- Kết quả riêng của task: trang có thang chữ mới, thẻ có độ sâu ở cả hai theme và các chi tiết nhấn ở REQ-03; bố cục và nội dung giữ nguyên.

## Làm như thế nào

Đầu vào từ T04: token `--font-family-display`, `--font-family-primary` và trọng số. Đầu vào từ T05: token màu, `--color-shadow-rgb`, `--gradient-flame`, khối token theo theme, test theme. Thiếu đầu vào thì dừng.

1. ROLE-01 (`frontend-developer`) khai token REQ-01, REQ-02 trong `variables.css` (độ sâu khai trong khối của từng theme) và áp cho phần tử tương ứng. Thay mọi cỡ chữ viết thẳng trong CSS bằng token.
2. ROLE-01 áp hệ độ sâu REQ-02 cho mọi thẻ, kể cả trạng thái `:hover` và `:focus-within`.
3. ROLE-01 thêm chi tiết nhấn REQ-03: số thứ tự eyebrow trong 7 section, chip, nhãn thời gian, CTA, gạch chân liên kết, ô icon, vòng chân dung, xuống dòng URL.
4. ROLE-01 cập nhật tài liệu REQ-05. Không viết test mới: thay đổi chỉ là trình bày. Chạy test hiện có của đúng các component mà diff đổi markup (chọn trong `App.test.tsx`, `Header.test.tsx`, `Personal.test.tsx`, `Projects.test.tsx`, `Footer.test.tsx`), để chắc tên truy cập không đổi; ví dụ `npx vitest run --pool=forks src/components/Personal.test.tsx src/components/Projects.test.tsx`.
5. ROLE-02 (`code-reviewer`) kết luận QG-01 trên diff.
6. ROLE-03 (`ux-designer`), sau khi ROLE-01 chụp layout theo router (trạng thái hover/focus của thẻ là một trạng thái diff đổi), kết luận QG-02 từ ảnh và source hiển thị.
7. ROLE-04 (`code-analyst`) kết luận QG-03 bằng đối chiếu tài liệu với token.

T07 phụ thuộc task này.
Bước tiếp theo: người dùng chỉ định file Plan này để Implement sau khi T04 và T05 đã `implemented`; Implement chỉ thực hiện T06 trong phạm vi trên.

## Vai trò tham gia

- ROLE-01 | Loại: triển khai | Vai trò: frontend-developer | Phụ trách: token typography/độ sâu, áp cho thành phần, chi tiết nhấn, tài liệu, chạy test bước 4, chụp layout theo router | Đầu vào: kết quả T04, T05, Plan này | Hoàn tất khi: REQ-01..REQ-05 có thay đổi tương ứng; test bước 4 đã chạy và được giải thích; `layout_verification` có lần chụp đạt
- ROLE-02 | Loại: kiểm chứng | Vai trò: code-reviewer | Phụ trách: QG-01, đối chiếu lần chạy test với FUT | Đầu vào: diff của ROLE-01 | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-01 kèm đường đã lần, phản ví dụ, nguồn
- ROLE-03 | Loại: kiểm chứng | Vai trò: ux-designer | Phụ trách: QG-02 | Đầu vào: ảnh và bảng kết quả layout, source hiển thị | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-02 kèm ảnh đã xem, phản ví dụ, nguồn
- ROLE-04 | Loại: kiểm chứng | Vai trò: code-analyst | Phụ trách: QG-03 | Đầu vào: diff của ROLE-01 | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-03 kèm khẳng định đã đối chiếu, nguồn
- Lập Plan | Vai trò: business-analyst, code-analyst, ux-designer | Cách thực hiện: người điều phối tự thực hiện lần lượt; không có phản biện độc lập

## Tiêu chí chất lượng bắt buộc

- QG-01 | Yêu cầu: REQ-01, REQ-02, REQ-03, REQ-04 | Logic bắt buộc:
  - Mỗi token ở REQ-01, REQ-02 khai đúng một lần (độ sâu: một lần mỗi theme), giá trị đúng bảng.
  - Phần tử trong bảng REQ-01 dùng đúng token. Không còn `font-size` viết thẳng bằng px trong `src/**/*.css` ngoài `variables.css`.
  - Mọi thẻ ở REQ-02 có viền, `--elevation-1`, `--radius-card`. `:hover` và `:focus-within` cho cùng kết quả; chuyển tiếp chỉ trên `transform`, `box-shadow`, `border-color`, nên hover không làm xê dịch phần tử khác.
  - Số thứ tự eyebrow đúng thứ tự `01`–`07` theo `App.tsx`, có `aria-hidden`; tên truy cập của heading và liên kết không đổi so với trước diff.
  - CTA chính dùng nền đặc `--color-accent`; không có chữ trên `--gradient-flame`.
  - Không đổi nội dung, thứ tự section, lưới hay media query (REQ-04).
- QG-02 | Yêu cầu: REQ-01, REQ-02, REQ-03 | Logic bắt buộc: Với `light`/`dark` × `en`/`vi` × 1280×800/360×800:
  - Cỡ chữ hiển thị khớp bảng REQ-01 ở hai khổ (ví dụ `h1` ≈ 44px ở 360, 80px ở 1280).
  - Tiêu đề Playfair có dấu tiếng Việt không bị cắt, không chồng dòng.
  - Thẻ thấy rõ viền và bóng ở cả hai theme; ảnh hover/focus cho thấy thẻ nâng lên và bóng đậm hơn.
  - Eyebrow có số thứ tự, vạch chuyển màu; chip, nhãn thời gian, CTA, ô icon, vòng chân dung đúng REQ-03.
  - URL dự án không tràn thẻ ở 360. Không cuộn ngang.
  - Mỗi điểm không đạt được so với ảnh trước khi có diff.
- QG-03 | Yêu cầu: REQ-05 | Logic bắt buộc: Mỗi giá trị cỡ chữ, trọng số, letter-spacing, line-height, bo góc, độ sâu và mô tả hình dáng thành phần trong các đoạn ở REQ-05 của `docs/DESIGN.md` (gồm bảng Hierarchy, Principles, mục 1 và mục 8), `docs/RESPONSIVE.md`, `DOCUMENTATION_COMPLETE.md` (cả hai ngôn ngữ) khớp token và CSS sau diff; không còn giá trị cũ (bo góc 40px, `--font-size-h1: 64px`, eyebrow 14px/700/+4%, hero 64/48/40px, trọng số tiêu đề 500...) như giá trị đang dùng.

## Implementation Record
- status: implemented
- updated_at: "2026-10-17T13:54:00+07:00"
- changed_paths: [".repos/Portfolio: docs/DESIGN.md", "docs/RESPONSIVE.md (đồng bộ ngoài REQ-05: danh sách media query ở dòng 9–10, do RISK-03 của report T05 cùng nằm trong tài liệu này)", "Hub: file Plan này (ghi sổ)"]
- role_work: frontend-developer=done: lượt sửa theo FIND-01 của report `.agents/review/portfolio-gaps_20261014-233844/t06-typography-cards-accents/round-01-review-typography-cards-accents-20261017-130000.md`. `docs/DESIGN.md` mục 7 "Don't": câu "elevation uses a 24px+ blur on its large layer and at most 16% opacity" thành "the large layer of `--elevation-1` and `--elevation-2` blurs at 24px or more, at no more than 16% opacity in the light theme and 35–50% in the dark theme (section 6)"; số lấy từ `variables.css` dòng 27–28 (sáng: lớp lớn 0,08 blur 24px và 0,16 blur 48px) và dòng 53–54 (tối: lớp lớn 0,35 blur 24px và 0,50 blur 48px). Theo chỉ dẫn FIND-01 đối chiếu mục 7 và mục 9 với cả hai khối theme: mục 9 dòng "Border / outline" sai với CSS ở ba chỗ (chip dùng `--border-chip` chứ không phải `--border-ink`; nút phụ viền 1px `--color-text`; thẻ dùng viền gradient `--gradient-card-border`, còn `--border-subtle` thuộc khối chứa section, ô liên hệ và nhãn thời gian), viết lại theo nơi dùng thật của từng token (xem quality_gate_evidence QG-03). Đồng bộ ngoài FIND-01: `docs/RESPONSIVE.md` dòng 9–10 dựng lại danh sách từ truy vấn `@media` trong `src/**/*.css` (thêm `max-width: 479px` ở `Header.module.css:273`, ghi rõ là media query theo chiều rộng vì `global.css` còn `prefers-reduced-motion` và `print`). Rà bằng grep các câu giới hạn có thể phụ thuộc theme ("at most", "never", "always", độ mờ, viền, bóng, con số) trong toàn bộ `docs/DESIGN.md`, `docs/RESPONSIVE.md` và `DOCUMENTATION_COMPLETE.md` hai ngôn ngữ, rồi đọc từng câu tìm được: không còn câu nào chỉ đúng một theme. Các con số của mục 11 (hiệu ứng) thuộc REQ của T07 và do Review T07 đối chiếu, lượt này không đọc lại. Không đổi `*.css`, `*.tsx` hay test; không chạy test vì diff chỉ ở tài liệu; code-reviewer=PASS QG-01; ux-designer=PASS QG-02; code-analyst=PASS QG-03
- execution_mode: tự thực hiện lần lượt (người điều phối đảm nhận frontend-developer, rồi code-reviewer, ux-designer, code-analyst); không có kiểm chứng độc lập
- checkpoint_evidence: N/A
- quality_gate_results: QG-01=PASS; QG-02=PASS; QG-03=PASS
- quality_gate_evidence: QG-01 -> code-reviewer, `git diff` của `.repos/Portfolio`: chỉ `docs/DESIGN.md` (hai dòng) và `docs/RESPONSIVE.md` (một đoạn); không có `variables.css`, `global.css`, `*.module.css` hay `*.tsx`. Vì vậy các điều QG-01 yêu cầu (token REQ-01 và REQ-02 khai đúng một lần, bảy lớp thẻ có viền, `--elevation-1`, `--radius-card`, `:hover` cùng `:focus-within`, eyebrow `01`–`07`, CTA chính nền `--color-accent`, không đổi lưới và media query) giữ nguyên kết luận PASS của Review vòng 1 trên cùng source. Phản ví dụ đã xét: sửa tài liệu làm đổi chữ khai báo token. Không xảy ra vì hai khối diff chỉ nằm ở dòng bóng của mục 7, dòng Border / outline của mục 9 và đoạn đầu `RESPONSIVE.md`. Các dòng bằng chứng của lượt đầu dựa trên script và đo trình duyệt (EVAL-02, EVAL-04 của report) không dùng lại. QG-02 -> ux-designer: diff không đổi markup, style, trạng thái hay chuỗi giao diện, nên không có phần hiển thị mới để chụp; ảnh và bảng kết quả của Review vòng 1 (`T06/20261017-003727`, `T07/20261017-010446`) mô tả đúng source hiện tại vì source không đổi trong lượt này. Phản ví dụ: tài liệu thiết kế làm lệch giao diện thật. Không xảy ra, tài liệu không được import vào bản dựng. QG-03 -> code-analyst, đọc từng câu quy tắc của `docs/DESIGN.md` mục 6, 7, 9 và `docs/RESPONSIVE.md` dòng 9–10, đối chiếu `src/styles/variables.css` ở cả hai khối theme và `src/**/*.css`: (1) Mục 6 dòng 264–265 khớp `variables.css` dòng 27–28 và 53–54 (sáng 0,06/0,08 và 0,08/0,16; tối 0,40/0,35 và 0,50/0,50; vệt sáng 6% và 10% của `--color-text`; quầng `--color-accent` 22% blur 32px ở mức 2). (2) Mục 7 dòng "hard shadows" mới: lớp lớn của `--elevation-1` blur 24px, của `--elevation-2` blur 48px, đều từ 24px trở lên ở hai theme; độ mờ lớp lớn sáng tối đa 0,16, tối 0,35 và 0,50; đúng "35–50%". Phản ví dụ: lớp nhỏ của theme tối ở 0,40 và 0,50 (blur 2–4px) và `--shadow-elevated` 0,08. Câu chỉ nói về lớp lớn của `--elevation-*`, nên không bị bác. (3) Mục 7 các câu có con số: trọng số 600 và -2% là `--font-weight-semibold` và `--letter-spacing-display`; 1,65 và 68ch là line-height thân và `--measure` (dòng 87); 24px và nâng 4px là `--radius-card` và bảy quy tắc `translateY(-4px)` ở bảy `*.module.css`; "không viết hoa thứ lớn hơn nhãn eyebrow 12px": 12 quy tắc `text-transform: uppercase`, 11 dùng `--font-size-eyebrow` (0,75rem) và 1 (`Footer.module.css:150`, chữ trong icon mạng xã hội) dùng `--size-icon-xs` = 12px; không quy tắc nào lớn hơn 12px. (4) Mục 9 dòng Border / outline mới đối chiếu `var(--border-*)` và `border:` trong `src/**/*.css`: `--border-chip` ở `Skills.module.css:103`, `Projects.module.css:99`, `Experience.module.css:126` (chip); `Personal.module.css:147` viền `1px solid var(--color-text)` (`.secondaryCta`); `--border-subtle` ở `.skillsSection` (`Skills.module.css:6`), khối chứa của Projects và Experience (dòng 7), `.detailItem` (`Personal.module.css:176`), nhãn thời gian (`Education.module.css:119`, `Experience.module.css:102`); `--border-control` ở `Header.module.css:139,165,252` và `.projectLink` (`Projects.module.css:128`); `--border-ink` chỉ ở `.marker` (`Education.module.css:71`); bảy lớp thẻ dùng `border: 1px solid transparent` cộng nền border-box `--gradient-card-border` (đúng "fading edge"). Phản ví dụ: `--border-muted` khai ở `variables.css:124` nhưng không có chỗ dùng trong `src/`, và câu mới không nêu nó. (5) `RESPONSIVE.md` dòng 9–10: truy vấn `@media` theo chiều rộng trong `src/**/*.css` là 479 (`Header.module.css:273`), 480 (`index.css`, `App.module.css`), 767 (Skills, Projects, Education, Footer, Header, Experience, Personal), 768, 1023 (Footer, Personal), 1024; danh sách mới có đủ sáu ngưỡng. `global.css` còn hai khối `prefers-reduced-motion` và một khối `print`, không phải ngưỡng chiều rộng nên chữ "width" trong câu mới đúng. (6) Còn lại: mục 4 các dòng viền (146, 155, 166, 172, 176, 177, 182, 187, 193, 199) khớp các quy tắc trên; `DOCUMENTATION_COMPLETE.md` chỉ có khối token độ sâu ở dòng 602–603, 625–627, 1350–1351, 1373–1375 khớp `variables.css` và không có câu giới hạn bóng hay viền
- layout_verification: N/A (diff chỉ ở `docs/DESIGN.md` và `docs/RESPONSIVE.md`, không đổi giao diện; lần chụp của lượt đầu giữ làm bằng chứng lịch sử ở `.tmp/layout-snapshots/portfolio-gaps_20261014-233844/T06/20261017-003727`)
- repair_closure_evidence: FIND-01 -> REQ-05, QG-03; nguyên nhân: câu "Don't" viết cho theme sáng (độ mờ 0,06–0,16) khi T05 chưa thêm khối theme tối, sau đó không được đối chiếu lại; giải pháp: nêu giới hạn theo từng theme và trỏ mục 6; trước: mục 7 "at most 16% opacity" mâu thuẫn mục 6 dòng 265 và `variables.css:53–54` (0,35 và 0,50); sau: câu mới khớp cả hai khối. Đồng bộ kèm lượt này (RISK-03 của report T05, không phải mục của report T06): dòng Border / outline của mục 9 và danh sách media query ở `RESPONSIVE.md`; việc đóng RISK-03 thuộc Review T05. Đính chính ghi chú truy vết của EVAL-01 trong report: khoảng cách liên kết header là `clamp(var(--space-3), 12vw - 100px, var(--nav-link-gap))` = `clamp(24px, 12vw - 100px, 48px)` (`Header.module.css:109`; `variables.css` `--space-3` 24px và `--nav-link-gap` 48px), khớp `RESPONSIVE.md` dòng 28 và `DESIGN.md` mục 8; Implementation Record lượt đầu ghi `clamp(24px, 6vw - 28px, 48px)` là sai, bản này thay thế nó
- root_cause_revalidation: FIND-01=confirmed/trước sửa `DESIGN.md` mục 7 nêu "at most 16% opacity" cho elevation; `variables.css:53–54` (theme tối) có 0,4, 0,35, 0,5, 0,5 cho `--elevation-1/2`; mục 6 dòng 265 của chính file nêu 40%/35% và 50%/50%. Giải thích cạnh tranh đã xét: câu nói về `--shadow-elevated` (0,08, trong 16%). Không đứng vững vì câu dùng từ "elevation", tên của `--elevation-*`
- review_item_disposition: FIND-01=resolved/dòng bóng ở mục 7 khớp hai khối theme và mục 6; đối chiếu mục 7 và mục 9 với cả hai khối theme theo chỉ dẫn, tìm thêm một câu sai ở mục 9 (Border / outline) và đã sửa
- role_challenge_results: frontend-developer=PASS (tự phản biện: câu mới chỉ đúng nếu cả lớp nhỏ lẫn lớp lớn tuân theo, nên giới hạn nói rõ "lớp lớn"; gợi ý RISK-03 cho dòng Border / outline khớp CSS nhưng bỏ sót viền gradient của thẻ và nơi dùng `--border-subtle` ở ô liên hệ, nhãn thời gian nên viết lại từ grep; không còn nghi vấn mở); code-reviewer=PASS (QG-01; diff không chạm source nên không có nhánh mới); ux-designer=PASS (QG-02; không đổi phần hiển thị); code-analyst=PASS (QG-03; đã đọc cả câu quy tắc, không chỉ bảng giá trị)
- residual_risk: Kiểm chứng là tự thực hiện, không có phản biện độc lập. Sửa này chưa được Review vòng 02 xác nhận nên kết luận FAIL của report vòng 1 vẫn là kết luận hiện hành cho tới khi Review chạy lại. `--border-muted` còn khai ở `variables.css` và `DESIGN.md` mục 2 nhưng không có chỗ dùng (không thuộc FIND-01, ghi lại để chủ sản phẩm quyết định giữ hay bỏ)
- review_handoff: file Plan này; thay đổi chưa commit trong `.repos/Portfolio` (nhánh `develop`, HEAD `745f1aa`: `docs/DESIGN.md`, `docs/RESPONSIVE.md`); report nguồn `.agents/review/portfolio-gaps_20261014-233844/t06-typography-cards-accents/round-01-review-typography-cards-accents-20261017-130000.md`
- role_selection_source: .agents/review/portfolio-gaps_20261014-233844/t06-typography-cards-accents/round-01-review-typography-cards-accents-20261017-130000.md
- effective_implementation_roles: frontend-developer
- Next allowed owner/layer: Review T06 vòng 02 khi người dùng yêu cầu
- Authorization condition: Review chỉ chạy khi người dùng yêu cầu; vòng 02 chỉ cần đối chiếu các dòng đã sửa với `src/styles/variables.css` và `src/**/*.css`
1. Review vòng 02 cho `.agents/plan/portfolio-gaps_20261014-233844/06-plan-typography-cards-accents-20261014-233844.md`: đối chiếu `docs/DESIGN.md` mục 7 (dòng bóng), mục 9 (dòng Border / outline) và `docs/RESPONSIVE.md` dòng 9–10
