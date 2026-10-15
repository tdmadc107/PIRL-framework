---
schema: pirl-plan/v1
content_language: vi
plan_set: portfolio-gaps_20261014-233844
task_id: T06
title: "Nâng cấp typography, độ sâu thẻ và chi tiết nhấn"
layer: implement
status: planned
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
