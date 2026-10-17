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
- updated_at: "2026-10-17T00:49:59+07:00"
- changed_paths: [".repos/Portfolio: src/styles/variables.css", "src/styles/global.css", "src/components/Header.module.css", "src/components/Personal.module.css", "src/components/Skills.module.css", "src/components/Education.module.css", "src/components/Experience.module.css", "src/components/Projects.module.css", "src/components/Certifications.module.css", "src/components/Achievements.module.css", "src/components/Footer.module.css", "src/components/Personal.tsx", "src/components/Skills.tsx", "src/components/Education.tsx", "src/components/Experience.tsx", "src/components/Projects.tsx", "src/components/Certifications.tsx", "src/components/Achievements.tsx", "docs/DESIGN.md", "docs/RESPONSIVE.md", "DOCUMENTATION_COMPLETE.md", "Hub: file Plan này (ghi sổ)"]
- role_work: frontend-developer=done: token thang chữ trong `variables.css` đúng bảng REQ-01 (`--font-size-h1/h2/logo/h3/lead/body/eyebrow/caption`, trọng số `--font-weight-semibold: 600`, line-height h1 1.15, h2 và logo 1.2, h3 1.3, lead và body 1.65, nhãn 1.4, `--letter-spacing-eyebrow: 0.16em`, `--measure: 68ch`); bỏ mọi cỡ chữ px viết thẳng, kể cả biến cục bộ (`--heading-mobile`, `--position-mobile`, `--logo-size`, `--subtitle-size`, `--nav-link-*`, `--hero-*`, `--footer-headline-*`) và các token không còn dùng (`--font-size-footer`, `--font-weight-bold`, `--radius-consent`, `--radius-hero`, `--size-icon-sm|lg|xl|xxl`, `--size-badge`); `global.css` áp thang chữ cho `h1`, `h2`, `h3`, thân, và gạch chân 2px tô `--gradient-flame` khi hover liên kết chữ (`a:not([class]):hover`, kèm `.helpLink` ở Footer). Độ sâu thẻ: `--radius-card: 24px`, `--elevation-1` và `--elevation-2` khai theo từng theme từ `--color-shadow-rgb` (theme tối thêm vệt sáng mảnh ở cạnh trên và quầng `--color-accent` ở mức 2), `--gradient-card-border`; 7 loại thẻ (`highlightCard`, `skillCategory`, thẻ học vấn, `experienceCard`, `projectCard`, `certCard`, `achievementCard`) dùng viền 1px gradient, `--elevation-1`, `--radius-card` và nâng 4px cùng `--elevation-2` khi `:hover` hoặc `:focus-within`, chuyển tiếp chỉ trên `transform` và `box-shadow`. Chi tiết nhấn: số thứ tự eyebrow `01`–`07` (`aria-hidden`) và vạch 24px tô `--gradient-flame` thay chấm tròn ở 7 component; chip kỹ năng và công nghệ nền `--color-surface-raised`, viền `--border-chip` pha violet, chấm 6px `--color-jade`; nhãn khoảng thời gian, ngày cấp, năm thành tích là viên thuốc raised chữ `--color-text-muted`, chữ số tabular; CTA phụ viền 1px không nền (CTA chính đã là nền đặc `--color-accent` từ T05); ô icon 48px bo 14px nền raised viền gradient cho chứng chỉ và thành tích; `.orbit` tô `--gradient-flame` cắt thành vòng và cung bằng mặt nạ; mô tả có `max-width: 68ch`; URL dự án xuống dòng (`overflow-wrap: anywhere`, giữ từ trước). Sửa bố cục do diff (bắt bằng số đo): logo to hơn khiến nút theme nhô ra khỏi viên thuốc ở 1000–1042px nên đổi khoảng cách giữa các liên kết thành `clamp(24px, 6vw - 28px, 48px)` (đúng 48px từ 1280px; trước đó `3.75vw` của T05 chưa đủ cho logo mới). Quyết định ngoài chữ Plan: bỏ chấm tròn eyebrow, thay bằng số và vạch theo thứ tự "số, vạch, nhãn" của REQ-03; chip kỹ năng và công nghệ nằm trong thẻ raised nên nền chip trùng màu thẻ, chip chỉ phân biệt bằng viền violet và chấm jade; nhãn thời gian có thêm viền `--border-subtle` để hiện hình trên thẻ raised. Test: không viết mới (chỉ trình bày); chạy test hiện có từ `.repos/Portfolio`: `npx vitest run --pool=forks src/components/Personal.test.tsx src/components/Projects.test.tsx src/components/Header.test.tsx src/components/Footer.test.tsx src/App.test.tsx` = 5 file, 11 test đạt (và `src/theme/theme.test.tsx` trong lần chạy trước, 17 test đạt) để chắc tên truy cập không đổi. Tài liệu REQ-05: `docs/DESIGN.md` (mục 1, 2 gradient và bảng token trang trí, 3 Hierarchy, Principles, 4 Component Stylings, 5 radius, 6 Depth & Elevation, 7 Do/Don't, 8 phần cỡ chữ theo khổ, 9 prompt mẫu), `docs/RESPONSIVE.md` (Header, từng component, bảng Typography Scale, Notes), `DOCUMENTATION_COMPLETE.md` hai ngôn ngữ (danh sách token cỡ chữ, thêm mục Radius & Depth, dòng màu chip). Rà thêm chỗ còn nhắc chấm eyebrow (bảng token và bảng ngũ hành của `docs/DESIGN.md`, bảng màu của `DOCUMENTATION_COMPLETE.md` hai ngôn ngữ) và sửa thành viền thẻ mờ dần. Quét token cũ: `--font-size-footer|--radius-consent|--radius-hero|--size-icon-(sm|lg|xl|xxl)|--size-badge|--heading-mobile|--position-mobile|--logo-size|--subtitle-size|--nav-link-size|--hero-*|--footer-headline-*` trong `src/`: 0 tham chiếu; code-reviewer=PASS QG-01; ux-designer=PASS QG-02; code-analyst=PASS QG-03
- execution_mode: tự thực hiện lần lượt (người điều phối đảm nhận frontend-developer, rồi code-reviewer, ux-designer, code-analyst); không có kiểm chứng độc lập
- checkpoint_evidence: N/A
- quality_gate_results: QG-01=PASS; QG-02=PASS; QG-03=PASS
- quality_gate_evidence: QG-01 -> code-reviewer, `src/styles/variables.css`, `src/styles/global.css`, `src/components/*.module.css`, `*.tsx`: script đối chiếu: mỗi token REQ-01 (`--font-size-h1/h2/logo/h3/lead/body/eyebrow/caption`) và `--radius-card` khai đúng một lần với giá trị đúng bảng (`clamp(2.75rem, 1.6rem + 4.8vw, 5rem)`, `clamp(1.875rem, 1.3rem + 2.4vw, 3rem)`, `clamp(1.125rem, 1rem + 0.5vw, 1.5rem)`, `clamp(1.1875rem, 1rem + 0.6vw, 1.5rem)`, `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)`, `1rem`, `0.75rem`, `0.8125rem`, `24px`); `--elevation-1` và `--elevation-2` khai đúng một lần mỗi theme; `font-size` px viết thẳng ngoài `variables.css` = 0 (hàng dò khớp chỉ là `--marker-size`, `--social-size`, `--portrait-size`, là kích thước hộp, không phải cỡ chữ). Đo thật trong trình duyệt (`T06/20261017-003727/typography-probe.txt`): `h1` 80px/44px, 600, line-height 1.15; `h2` 48/30px, 600, 1.2 (cả footer); logo 22,4/18px, 600, 1,2; `h3` 23,68/19px, 600, 1,3; lead 19,84/17,08px, 400, 1,65; thân 16px, 1,65; eyebrow và tiêu đề cột footer 12px, 600, 1,4, chữ hoa, +1,92px (0,16em); chip, nhãn ngày, caption 13px, 500, 1,4; chữ số tabular ở nhãn ngày; `max-width` của mô tả theo `68ch`. Mọi thẻ ở REQ-02: đọc từng lớp, cả 7 lớp có `border: 1px solid transparent`, nền border-box `--gradient-card-border`, `--elevation-1`, `--radius-card`; `:hover` và `:focus-within` cùng một quy tắc (`translateY(-4px)`, `--elevation-2`); `transition` chỉ liệt kê `transform` và `box-shadow` nên hover không làm xê dịch phần tử khác; đo thật hover: cả 7 loại thẻ `matrix(1, 0, 0, 1, 0, -4)`, bóng đổi, bán kính 24px, `transition-property: transform, box-shadow`. Eyebrow: `01`–`07` đúng thứ tự `App.tsx` (Personal 01, Skills 02, Education 03, Experience 04, Projects 05, Certifications 06, Achievements 07), mỗi số `aria-hidden`; tên truy cập của heading và liên kết không đổi (test `Personal`, `Projects`, `Header`, `Footer`, `App` đạt). CTA chính nền `--color-accent`; grep `gradient-flame` trong CSS: chỉ vạch eyebrow, vòng `.orbit` và gạch chân liên kết, không có chữ nằm trên đó. Không đổi nội dung, thứ tự section hay lưới; các điều kiện media query (479, 480, 767, 768, 1023, 1024px) giữ nguyên, chỉ bỏ hai khối `@media (max-width: 767px)` của Certifications và Achievements vì quy tắc duy nhất trong đó là cỡ chữ tiêu đề trên điện thoại, nay do thang chữ co giãn đảm nhận (so với bản sau T05 bằng `diff` danh sách `@media`). QG-02 -> ux-designer, ảnh `T06/20261017-003727` (100 ảnh), `typography-probe.txt`, số đo header: ở 2 theme × `en`/`vi` × 1280×800/360×800: cỡ chữ hiển thị khớp bảng ở hai khổ (h1 44px ở 360 và 80px ở 1280); dấu tiếng Việt trong Playfair ("Hồ sơ" ở eyebrow, h2, footer "Chúng tôi luôn sẵn sàng khi bạn cần.") không bị cắt hay chồng dòng (đã xem ảnh `vi`); thẻ thấy rõ viền và bóng ở hai theme, ảnh hover cho thấy thẻ nâng lên và bóng đậm hơn (theme tối có quầng coral); eyebrow có số và vạch chuyển màu, chip có chấm jade và viền violet, nhãn thời gian, CTA phụ viền 1px, ô icon 48px, vòng chân dung flame (đã xem ảnh đầu trang, hover thẻ, chứng chỉ, thành tích, nhóm kỹ năng); URL dự án xuống dòng trong hộp liên kết ở 360 (ảnh hover thẻ dự án), không tràn; không cuộn ngang ở 1280. Không đạt có từ trước, không do diff: cuộn ngang 360×800 (426/360, `span.orbit`, GAP-07), tràn hàng liên kết 768–1023px (GAP-08). Điểm không đạt do diff đã sửa trong lượt: nút theme nhô ra khỏi viên thuốc ở 1000–1042px (đo: logo [72,317] nên nút kết thúc 1014 > 1000); sau khi đổi công thức khoảng cách, 1000–1280px đều vừa ở cả hai ngôn ngữ (1024: nút kết thúc 989 ≤ 1000); ở 360 logo [48,161], nút theme [200,248], nút menu [264,312] trong viên thuốc [24,336]. QG-03 -> code-analyst, `docs/DESIGN.md`, `docs/RESPONSIVE.md`, `DOCUMENTATION_COMPLETE.md` đối chiếu token và CSS: bảng Hierarchy, Principles, mục 1 và mục 8 của `DESIGN.md` nêu `clamp()` và 600, 1,15, 1,2, 1,3, 1,65, 12px, +0,16em, 13px, 68ch đúng như đo; mục 4 mô tả thẻ 24px, viền gradient, bóng, nâng 4px, chip, nhãn, ô icon, eyebrow đúng như CSS; mục 5 và 6 nêu bán kính 14/20/24 và hai mức bóng đúng giá trị token; bảng Typography Scale của `RESPONSIVE.md` khớp số đo ở 360 và 1280; `DOCUMENTATION_COMPLETE.md` nêu đúng danh sách token cỡ chữ, bán kính; script đối chiếu 28 và 15 dòng bảng token với `variables.css`: 0 sai lệch, mọi mã hex là giá trị token, mọi tên token tồn tại; grep giá trị cũ ("bo góc 40px", `--font-size-h1: 64px`, eyebrow 14px, chữ 700, weight 500 của tiêu đề, "hero 64/48/40px", `--heading-mobile`) trong ba tài liệu: chỉ còn các mô tả khác (marker timeline 40px) không phải giá trị đang dùng cho các mục trên
- layout_verification: đã chụp. Chiều: theme `light`/`dark` × ngôn ngữ `en`/`vi` × khổ 1280×800 và 360×800. Số ảnh: 100 ở lần chụp cuối (đầu trang, toàn trang, cuối trang, header đã cuộn, vòng focus nút theme, hover của 7 loại thẻ, menu mở ở 360); lần chụp đầu (`20261017-002940`, 92 ảnh) dùng CSS cũ hơn nên không dùng làm bằng chứng. Kiểm đạt: như QG-02; `<html lang>`, tiêu đề tab, `data-theme` đúng; menu 360 đủ 6 mục và nút đóng; vòng focus 2px `--color-accent-text`. Không đạt có từ trước: cuộn ngang 360×800 (426/360, GAP-07), tràn hàng liên kết 768–1023px (GAP-08), lỗi console 404 `/vite.svg`. Thư mục: `.tmp/layout-snapshots/portfolio-gaps_20261014-233844/T06/20261017-003727` (cuối, kèm `typography-probe.txt`, `nav-measure-*.txt`, `header-measure-phones.txt`), `.../20261017-002940`
- repair_closure_evidence: N/A
- root_cause_revalidation: N/A
- review_item_disposition: N/A
- role_challenge_results: frontend-developer=PASS (tự phản biện: biến cục bộ chứa px giấu cỡ chữ, `border-color` không cần chuyển tiếp vì viền gradient vẽ bằng nền border-box, logo to hơn làm hồi quy header đã bắt bằng số đo, chấm eyebrow thay bằng số và vạch; không còn nghi vấn mở nhưng có hai quyết định ngoài chữ Plan nêu trong role_work); code-reviewer=PASS (QG-01; không tìm thấy thẻ thiếu viền, bóng hay quy tắc `:focus-within`); ux-designer=PASS (QG-02; điểm do diff đã sửa trong một lần); code-analyst=PASS (QG-03)
- residual_risk: Kiểm chứng là tự thực hiện, không có phản biện độc lập. GAP-08: ở 768–1023px hàng liên kết tiếng Anh vẫn tràn viên thuốc (có từ trước, chưa sửa). Chữ trong các chip kỹ năng nằm trên thẻ raised cùng màu nền nên chip chỉ phân biệt bằng viền violet và chấm jade (đúng chữ Plan). Hover thẻ chỉ kiểm bằng giả lập con trỏ và `:focus-within` bằng đọc CSS, không kiểm trên thiết bị cảm ứng. Việc build và chạy ứng dụng nghiệm thu thuộc giai đoạn của người dùng
- review_handoff: file Plan này; thay đổi chưa commit trong `.repos/Portfolio` (nhánh `develop`, HEAD `a50912c`); không có report nguồn
- role_selection_source: plan
- effective_implementation_roles: frontend-developer
- Next allowed owner/layer: Implement T07 (đã được người dùng giao cùng yêu cầu; T05, T06 đã `implemented`), hoặc Review T06 khi người dùng yêu cầu
- Authorization condition: Review chỉ chạy khi người dùng yêu cầu
1. Implement T07 trong `.agents/plan/portfolio-gaps_20261014-233844/07-plan-motion-effects-20261014-233844.md`
