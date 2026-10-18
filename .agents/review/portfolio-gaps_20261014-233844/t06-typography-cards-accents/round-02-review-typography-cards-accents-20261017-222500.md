---
schema: pirl-review/v1
content_language: vi
plan_file: ".agents/plan/portfolio-gaps_20261014-233844/06-plan-typography-cards-accents-20261014-233844.md"
task_id: T06
review_round: 2
prior_review: ".agents/review/portfolio-gaps_20261014-233844/t06-typography-cards-accents/round-01-review-typography-cards-accents-20261017-130000.md"
review_roles: [code-analyst, code-reviewer, business-analyst, solution-architect]
repair_roles: []
business_verdict: PASS
verdict: PASS
status: completed
reviewed_at: "2026-10-17T22:25:00+07:00"
implementation_target: ".repos/Portfolio commit a49bfe1 (745f1aa..a49bfe1: docs/DESIGN.md, docs/RESPONSIVE.md, src/data/education.ts) và Hub 73d55f6; lượt sửa theo record implement-20261017-135419-T06. Bốn vai trò Review chạy bằng agent riêng (mode: agent). Agent code-reviewer đã đọc bản nháp của người điều phối, và agent solution-architect thấy vài dòng của bản nháp qua grep; code-analyst và business-analyst độc lập. hai thay đổi chưa có chủ (không Implementation Record nào ghi): công thức khoảng cách liên kết header ở src/components/Header.module.css (6vw - 28px -> 12vw - 100px, trước 745f1aa) và chuỗi vi ở src/data/education.ts (trong a49bfe1); không thay đổi nào làm vỡ QG của T06"
---

# Review 02: T06 — Nâng cấp typography, độ sâu thẻ và chi tiết nhấn

Bản sửa report: bản đầu của vòng này do người điều phối tự thực hiện mọi vai trò. Bản này thay bản đầu, sau khi bốn vai trò Review đã chạy bằng agent riêng và người điều phối hợp nhất kết quả theo source. Bản đầu sai ở ba điểm:

- quy dòng Border / outline cho T05;
- không thấy hai câu tài liệu lệch CSS có từ trước;
- không thấy câu đính chính sai trong Implementation Record.

Phạm vi snapshot: lượt sửa T06 nằm trong commit `a49bfe1` của Portfolio. Giữa `745f1aa` và `a49bfe1` không có file `*.css`, `*.tsx` hay test nào đổi. Commit này còn đổi `src/data/education.ts`: chuỗi `vi` của "Good Standing", tức vùng RISK-01 của report T02. Thay đổi đó không nằm trong `changed_paths` của T06, không có trong Implementation Record nào, và không ảnh hưởng QG nào của T06. Vì vậy nó không được tính cho T06 hay cho `frontend-developer`.

Plan hiện hành có chú thích `Thay đổi đã xác nhận` ở REQ-03: bỏ chấm tròn của eyebrow và bỏ token `--font-weight-bold`.

- Dấu vết: record `plan-20261017-145032-T05` (task T05, T06, T07) dẫn tin nhắn 2026-10-17 12:02 (+07:00) của người dùng, giao agent chọn phương án cho mục "Cần bạn xác nhận", và nêu đúng mục này.
- Record `plan-20261017-220847-T05` thay record đó chỉ để áp dụng FIX-01 đang `pending_user`. `issues` và `fixes` của nó rỗng, và nó không rút lại chú thích nào.
- Kết luận: Plan đã sửa là baseline.

Business `PASS`. FIND-01 đã sửa đúng. Dòng Border / outline (thuộc T06, xem QG-03) cũng đã sửa và khớp CSS.

## Business

### Quality gates

| QG | Kết quả | Bằng chứng |
| --- | --- | --- |
| QG-01 | PASS | `git -C .repos/Portfolio diff --stat 745f1aa a49bfe1` không có `variables.css`, `global.css`, `*.module.css` hay `*.tsx`. Kết luận vòng 1 vẫn đúng trên cùng source:<br>- token REQ-01, REQ-02 khai đúng một lần; `--elevation-1/2` khai một lần mỗi theme ở `variables.css:27–28` và `:53–54`;<br>- bảy lớp thẻ có viền `--gradient-card-border`, `--elevation-1`, `--radius-card`; `:hover` và `:focus-within` dùng chung một quy tắc; `transition` chỉ trên `transform` và `box-shadow`;<br>- eyebrow `01`–`07` có `aria-hidden`, đúng thứ tự `App.tsx`, với `Skills` render trong `Personal.tsx`;<br>- CTA chính dùng nền `--color-accent`;<br>- media query không đổi.<br>REQ-03 đã sửa: grep `font-weight-bold` trong `src/`, `docs/`, `DOCUMENTATION_COMPLETE.md` cho 0 kết quả.<br>`education.ts` chỉ đổi một chuỗi `description.vi`, không đổi cấu trúc hay tên truy cập. Nó không thuộc diff của lượt sửa T06, nên không tính vào ý "không đổi nội dung" của REQ-04. |
| QG-02 | PASS | Lượt sửa không đổi markup, style, trạng thái hay chuỗi giao diện. Router miễn chụp layout khi diff chỉ ở tài liệu, nên `layout_verification: N/A` là đúng.<br>Ảnh vòng 1 (`T06/20261017-003727/*`, `T07/20261017-010446/*`) được chụp khi khoảng cách liên kết header còn là `6vw - 28px` (theo `T06/20261017-003727/NOTE.md`). Source cuối là `clamp(var(--space-3), 12vw - 100px, var(--nav-link-gap))` (`Header.module.css:109`). Ở hai khổ của QG, ảnh vẫn đúng với source cuối:<br>- 1280px: 6 × 12,8 − 28 = 48,8 và 12 × 12,8 − 100 = 53,6; cả hai bị kẹp ở `--nav-link-gap` = 48px.<br>- 360px: `.navLinks` là lớp phủ cố định với khoảng cách `--space-3`, nên công thức này không áp dụng.<br>Cỡ chữ, thẻ, eyebrow, chip và URL dự án vẫn như kết luận vòng 1. |
| QG-03 | PASS | **Mục 7, dòng 292 (FIND-01).** Câu mới: lớp lớn của `--elevation-1` và `--elevation-2` có blur từ 24px, độ mờ tối đa 16% ở theme sáng và 35–50% ở theme tối. Đối chiếu `variables.css`:<br>- theme sáng: `0 8px 24px` ở 0,08 (`:27`) và `0 20px 48px` ở 0,16 (`:28`);<br>- theme tối: `0 8px 24px` ở 0,35 (`:53`) và `0 20px 48px` ở 0,50 (`:54`).<br>Các giá trị này khớp câu mới. Phản ví dụ đã xét và bác:<br>- Quầng `0 0 32px` `--color-accent` 22% của `--elevation-2` tối: mục 6 (`DESIGN.md:265`) mô tả quầng này riêng, tách khỏi "the same two layers".<br>- Vệt sáng `inset` (blur 0) và hai lớp nhỏ (0,40 và 0,50, blur 2–4px): nằm ngoài "the large layer".<br>**Mục 9, dòng 330 (Border / outline).** Dòng này thuộc T06. Tại `a50912c`, chip (`Skills.module.css:96`) và CTA (`Personal.module.css:87`, `:93`) đều dùng `--border-ink`. Phạm vi của T05 chỉ là màu. Vì vậy câu "`--border-ink` for chips and secondary buttons" vẫn đúng sau T05 (đây là suy luận, vì T01–T07 nằm chung một commit). Câu thành sai khi T06 đổi viền chip (`--border-chip`), viền nút phụ (1px `--color-text`) và viền thẻ (`--gradient-card-border`). Đó đều là giá trị hình dáng thành phần mà REQ-05 đòi đồng bộ ("Mọi đoạn nêu giá trị mà task này đổi ..., gồm ít nhất"). Vòng 1 đã ghi nhầm chỗ lệch này vào RISK-03 của T05. Dòng mới khớp CSS:<br>- `--border-chip`: `Skills:103`, `Projects:99`, `Experience:126`;<br>- `.secondaryCta`: `Personal:147`;<br>- `--border-subtle`: `Skills:6`, `Experience:7`, `Projects:7`, `Personal:176`, `Education:119`, `Experience:102`;<br>- `--border-control`: `Header:139`, `:165`, `:252`, `Projects:128`;<br>- `--border-ink` chỉ ở `.marker` (`Education:71`);<br>- thẻ dùng `--gradient-card-border`.<br>Phản ví dụ đã xét và bác: `border-top: var(--border-subtle)` ở `Certifications:99` và `Achievements:115` không được liệt kê. Câu không nói danh sách là đầy đủ; chỉ `--border-ink` có chữ "only".<br>Cụm "round buttons" dùng với nghĩa nút tròn ở header, như `DESIGN.md:57` và `:165` ghi "round header buttons". Nút vệ tinh và icon mạng xã hội được gọi bằng tên riêng, nên câu không sai.<br>**Ngoài T06.** Danh sách media query ở `RESPONSIVE.md` dòng 9–11 không thuộc REQ-05 của T06; nội dung của nó được kết luận ở report vòng 2 của T05.<br>**Phần còn lại.** Các đoạn thuộc REQ-05 không đổi ở lượt này, và grep giá trị cũ cho 0 kết quả. Hai câu lệch CSS có từ trước, nằm ngoài các thuộc tính QG-03 kiểm hoặc mơ hồ, ghi ở RISK-01. |

### Findings

Không có FIND.

### Risks

#### RISK-01

| Trường | Nội dung |
| --- | --- |
| QG | QG-03 |
| Tác động | Mức thấp, chỉ tài liệu. Người hoặc agent làm theo `docs/DESIGN.md` có thể đổi sai CSS ở hai chỗ:<br>(1) Mục Principles (`DESIGN.md:129`) ghi "Don't use uppercase anywhere else" (ngoài eyebrow). Nhưng icon mạng xã hội ở footer viết hoa "IN" và "GH" ở 12px (`Footer.module.css:150`, dữ liệu chữ thường ở `personal.ts`). Người làm theo câu này có thể bỏ `uppercase` của icon.<br>(2) Hàng "Caption, chip, date label" của bảng Hierarchy (`DESIGN.md:122`) ghi letter-spacing "-3% (chips and buttons)". Nhãn ngày Education, Experience, Achievements dùng -3%, còn ngày cấp và ngày hết hạn của chứng chỉ dùng `letter-spacing: 0` (`Certifications.module.css:111`). Mục 4 (`DESIGN.md:177`) xếp các nhãn này chung một nhóm. Người đọc có thể đặt -3% cho ngày chứng chỉ; chênh khoảng 0,4px ở chữ 13px. |
| Nguồn | `DESIGN.md:122`, `:129`, `:177`, `:288`; `Footer.module.css:150`; `Certifications.module.css:111`; `git show a50912c` cho `Footer.module.css` (`.socialIcons a` đã `uppercase`) và `Certifications.module.css` (`.expiryDate` đã `letter-spacing: 0`). |
| Nguyên nhân | Cả hai cách dùng CSS đều có từ trước gói. T06 viết lại phần giá trị của hai câu nhưng không đối chiếu phạm vi của câu với mọi nơi dùng. |
| Phản biện | QG-03 kiểm cỡ chữ, trọng số, letter-spacing, line-height, bo góc, độ sâu, hình dáng. `text-transform` không nằm trong danh sách đó. Câu Do/Don't ở `:288` ("anything larger than the 12px eyebrow label") vẫn đúng. Cụm "(chips and buttons)" giới hạn -3% cho chip và nút, không khẳng định cho nhãn ngày. Cả hai không phải giá trị do diff tạo ra, nên QG vẫn đạt. |
| Vai trò | frontend-developer, technical-writer |
| Đích | `.repos/Portfolio/docs/DESIGN.md` |
| Chỉ dẫn | Chưa có task chủ. Người dùng giao việc sửa tài liệu này (task độc lập hoặc Plan mới, layer Implement). Khi đó:<br>- `:129`: nêu ngoại lệ cho icon mạng xã hội hai chữ cái.<br>- `:122`, `:177`: ghi rõ ngày chứng chỉ dùng letter-spacing 0. |
| Xem lại khi | Người dùng giao task sửa `docs/DESIGN.md` mục 1, 4 hoặc bảng Hierarchy. |

### Blockers

Không có BLOCK.

### Tiếp theo

| Trường | Nội dung |
| --- | --- |
| Tiếp theo | Không có việc sửa bắt buộc. T06 đóng ở vòng 2.<br>- RISK-01: chờ người dùng giao task sửa tài liệu.<br>- Hai thay đổi chưa có chủ: công thức khoảng cách liên kết header (`Header.module.css:109`, trước `745f1aa`) và chuỗi `vi` của `src/data/education.ts` (trong `a49bfe1`). Muốn Review chúng thì người dùng giao một lượt Implement hoặc task độc lập để ghi chúng trước. |

## Evaluations

Record được đánh giá: `implement-20261017-135419-T06`, lượt sửa theo FIND-01; `roles` có đủ bốn vai trò. Nguyên nhân và cải tiến do `process-auditor` (agent riêng) phân loại theo router.

### EVAL-01

| Trường | Nội dung |
| --- | --- |
| Vai trò | frontend-developer |
| Kết quả | FAIL |
| Lỗi | Mức thấp, không đổi QG. Câu mục 7 và dòng Border / outline đã sửa đúng. Có ba lỗi:<br>(1) **Đính chính sai.** `repair_closure_evidence` ghi rằng Implementation Record lượt đầu "là sai" khi ghi khoảng cách liên kết header là `clamp(24px, 6vw - 28px, 48px)`. Thực tế `T06/20261017-003727/NOTE.md` ghi công thức này ở lần chụp cuối, nên record lượt đầu khớp source lúc đó. Công thức `12vw - 100px` đến từ một lần đổi `Header.module.css` trước commit `745f1aa` (12:30:55), và không record nào ghi lần đổi đó. Câu đính chính xóa dấu vết của lần đổi không được ghi lại.<br>(2) **Sửa ngoài phạm vi REQ.** Danh sách media query ở `RESPONSIVE.md` dòng 9–11 nằm ngoài REQ-05 của T06; câu sai do T05 thêm truy vấn 479px. Việc sửa có khai minh bạch trong `changed_paths`, và làm theo chỉ dẫn của RISK-03 trong report T05 vòng 1 ("gộp vào lượt sửa tài liệu tiếp theo"). Nội dung sửa đúng.<br>(3) **Hai trường tự mâu thuẫn.** `review_item_disposition` tính dòng mục 9 vào FIND-01, còn `repair_closure_evidence` gọi nó là RISK-03 của T05. Theo QG-03, dòng này thuộc T06. |
| Nguyên nhân | FAIL chỉ do điểm (1): instruction (`prior-record-judged-against-later-source`, ISSUE-01 của `review-20261018-030331-T06`); lúc đó Implement và router chưa có quy tắc về hồ sơ cũ. Điểm (2) và (3) không phải lỗi của vai trò: instruction (`cross-task-review-item-handled-without-owner`, ISSUE-02), vì report T05 vòng 1 dặn "gộp vào lượt sửa tài liệu tiếp theo" mà không nêu task chủ, và quy dòng Border / outline cho T05. |
| Cải tiến | Đã áp dụng: router 1.4.0 → 1.5.0 (mục Snapshot chung và hồ sơ cũ); `implement.instructions.md` 1.4.0 → 1.5.0 (đính chính record trước; mục của task khác trong lượt sửa); `review.instructions.md` 1.2.2 → 1.3.0 (RISK nêu task và layer chủ; thay đổi chưa có chủ). |
| Bằng chứng | Implementation Record T06 (`changed_paths`, `repair_closure_evidence`, `review_item_disposition`); `T06/20261017-003727/NOTE.md`; `git show 745f1aa:src/components/Header.module.css` dòng 109; grep `12vw` trong `.agents/` chỉ khớp Plan T06. |

### EVAL-02

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-reviewer |
| Kết quả | PASS |
| Lỗi | Không có. QG-01 được kết luận bằng lập luận trên diff: diff chỉ ở tài liệu, nên kết luận vòng 1 giữ nguyên. Vai trò không dùng lại các dòng bằng chứng từ script hay trình duyệt của lượt đầu. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `quality_gate_evidence` QG-01 của Implementation Record T06. |

### EVAL-03

| Trường | Nội dung |
| --- | --- |
| Vai trò | ux-designer |
| Kết quả | PASS |
| Lỗi | Không có. Diff không đổi phần hiển thị, nên vai trò không chụp lại, đúng theo router. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `quality_gate_evidence` QG-02, `layout_verification` của Implementation Record T06. |

### EVAL-04

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-analyst |
| Kết quả | PASS |
| Lỗi | Không có lỗi làm sai kết luận QG-03: vai trò đọc từng câu đã đổi và đối chiếu với hai khối theme. Vai trò tính danh sách media query cho QG-03 của T06, nhưng nội dung câu đúng, nên không đổi kết luận. Hai câu ở RISK-01 có từ trước, không nằm trong diff của lượt sửa. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `quality_gate_evidence` QG-03 của Implementation Record T06. |
