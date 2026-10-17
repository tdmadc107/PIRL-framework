---
schema: pirl-review/v1
content_language: vi
plan_file: ".agents/plan/portfolio-gaps_20261014-233844/06-plan-typography-cards-accents-20261014-233844.md"
task_id: T06
review_round: 1
prior_review: null
review_roles: [code-analyst, code-reviewer, business-analyst, solution-architect, ux-designer]
repair_roles: [frontend-developer]
business_verdict: FAIL
verdict: FAIL
status: completed
reviewed_at: "2026-10-17T13:00:00+07:00"
implementation_target: ".repos/Portfolio commit 745f1aa (a50912c..745f1aa, một commit gồm cả T01–T07) và Hub e079707; tự thực hiện (mode: self), không có phản biện độc lập"
---

# Review 01: T06 — Nâng cấp typography, độ sâu thẻ và chi tiết nhấn

Phạm vi snapshot: bảy task T01–T07 nằm chung commit `745f1aa`, không có diff riêng từng task. T07 gắn thêm `data-reveal`, viền sáng khi hover và hiệu ứng vào các thẻ của T06; những phần đó thuộc REQ của T07 và không tính vào T06.

Business `FAIL` chỉ vì QG-03: một câu của `docs/DESIGN.md` nêu giới hạn độ mờ bóng sai với theme tối. Phần giao diện (QG-01, QG-02) đạt; sửa chỉ là một dòng tài liệu, không đổi source.

## Business

### Quality gates

| QG | Kết quả | Bằng chứng |
| --- | --- | --- |
| QG-01 | PASS | `src/styles/variables.css`: `--font-size-h1` `clamp(2.75rem, 1.6rem + 4.8vw, 5rem)`, `--font-size-h2` `clamp(1.875rem, 1.3rem + 2.4vw, 3rem)`, `--font-size-logo` `clamp(1.125rem, 1rem + 0.5vw, 1.5rem)`, `--font-size-h3` `clamp(1.1875rem, 1rem + 0.6vw, 1.5rem)`, `--font-size-lead` `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)`, `--font-size-body` 1rem, `--font-size-eyebrow` 0.75rem, `--font-size-caption` 0.8125rem; `--font-weight-semibold` 600; line-height 1,15 / 1,2 / 1,2 / 1,3 / 1,65 / 1,65 / 1,4; `--letter-spacing-eyebrow` 0,16em; `--measure` 68ch; `--radius-card` 24px. Mỗi token khai đúng một lần; `--elevation-1`, `--elevation-2` khai một lần mỗi theme. Áp dụng: `global.css` cho `h1`, `h2`, `h3`, thân; `Header.module.css` `.title` cho logo; `.intro`, `.role` cho lead; các lớp eyebrow, `.subcategoryLabel`, `.detailLabel`, `.columnTitle` cho eyebrow; chip, nhãn ngày, `.issuer` cho caption. grep `font-size: <số>px\|rem\|em` trong `src/**/*.css` = 0 (mọi `font-size` là `var(--…)`).<br>Bảy loại thẻ (`.highlightCard`, `.skillCategory`, `.card` của Education, `.experienceCard`, `.projectCard`, `.certCard`, `.achievementCard`) đều có `border: 1px solid transparent`, nền padding-box với `--gradient-card-border` ở border-box, `box-shadow: var(--elevation-1)`, `border-radius: var(--radius-card)`; `:hover` và `:focus-within` nằm chung một quy tắc (`translateY(-4px)`, `--elevation-2`); `transition` chỉ liệt kê `transform` và `box-shadow` nên hover không làm xê dịch phần tử khác. Dòng "theme tối có vệt sáng mảnh và quầng accent ở mức 2" có trong `--elevation-1/2` của `:root[data-theme='dark']`.<br>Eyebrow `01`–`07` đúng thứ tự `App.tsx` (Personal 01, Skills 02, Education 03, Experience 04, Projects 05, Certifications 06, Achievements 07), mỗi số trong `<span aria-hidden="true">`; tên truy cập của heading và liên kết không đổi (`git diff a50912c 745f1aa --stat` cho `Header.test.tsx`, `Personal.test.tsx`, `Projects.test.tsx` rỗng, các test này khẳng định tên). CTA chính `.primaryCta` nền `--color-accent`, chữ `--color-on-accent`; `--gradient-flame` chỉ ở vạch eyebrow, vòng `.orbit` và gạch chân hover, không có chữ nằm trên nó.<br>REQ-04: thứ tự section, nội dung và lưới không đổi; ngưỡng 480/768/1024px còn nguyên. Hai khối `@media (max-width: 767px)` bị bỏ khỏi `Certifications.module.css` và `Achievements.module.css` chỉ chứa `.heading { font-size: var(--heading-mobile) }` (`git show a50912c:src/components/Certifications.module.css`, `Achievements.module.css`), nay do `--font-size-h2` co giãn đảm nhận; truy vấn `max-width: 479px` mới ở `Header.module.css` do T05 thêm. Vì vậy không có media query nào đổi ngưỡng. |
| QG-02 | PASS | Ảnh đã xem: `T06/20261017-003727/vi-dark-360x800-t06b-hover4.png`; trạng thái cuối `T07/20261017-010446/fx-glow-hover-dark.png`, `fx-hero-t300ms-light-1280.png`, `fx-header-scrolled-light-1280.png`; `T05/20261017-000207/vi-light-360x800-t05c-top.png`. Cỡ chữ: từ công thức, `h1` = 1,6rem + 4,8vw = 42,9px ở 360 nên lấy cận dưới 44px, và 87px ở 1280 nên lấy cận trên 80px; `h2` 30px và 48px; khớp bảng REQ-01. Dấu tiếng Việt của Playfair ("HỒ SƠ", "Kinh nghiệm", "Chúng tôi luôn sẵn sàng khi bạn cần.") không bị cắt hay chồng dòng. Thẻ có viền và bóng thấy rõ ở cả hai theme; ảnh hover cho thẻ nâng lên với bóng đậm hơn (theme tối có quầng san hô). Eyebrow có số `01` và vạch chuyển màu; chip có chấm lục ngọc và viền tím; nhãn thời gian là viên thuốc; CTA phụ viền 1px không nền; vòng chân dung tô gradient lửa. URL dự án xuống dòng trong hộp liên kết ở 360px, không tràn thẻ.<br>Không cuộn ngang ở 1280; ở 360 cuộn ngang 426/360 có từ trước (GAP-07, `T01/20261016-224201/results.md`). Tràn hàng liên kết ở 768–1023px có từ trước (GAP-08, xem RISK-01 của T05). |
| QG-03 | FAIL | Hầu hết đoạn đúng: `docs/DESIGN.md` bảng Hierarchy, Principles, mục 1, mục 4 (thẻ, chip, ô icon, eyebrow), mục 5 (14/20/24px), mục 6 (hai mức bóng; số của theme sáng và tối khớp `--elevation-1/2`), mục 8; `docs/RESPONSIVE.md` bảng Typography Scale (44/80px, 30/48px, 18/22,4px, 19/23,7px, 17,1/19,8px); `DOCUMENTATION_COMPLETE.md` danh sách token cỡ chữ và bán kính; grep `--font-size-h1: 64px`, `--heading-mobile`, `--font-size-xs`, `14px / 700`, `+4%`, `64/48/40` = 0.<br>Một câu sai: `docs/DESIGN.md` mục 7 "Don't" dòng 292 ("Don't use hard shadows — elevation uses a 24px+ blur on its large layer and at most 16% opacity") trái với mục 6 của chính file (theme tối 40%/35% và 50%/50%) và với `--elevation-1/2` của `:root[data-theme='dark']`. Xem FIND-01. |

### Findings

#### FIND-01

| Trường | Nội dung |
| --- | --- |
| QG | QG-03 |
| Tác động | Mức thấp, chỉ tài liệu. Người hoặc agent đổi độ sâu của thẻ ở theme tối làm theo mục 7 "Don't" sẽ giới hạn bóng ở 16% độ mờ, trong khi token tối thật dùng 35–50% để thấy được trên nền xanh thẫm; kết quả là bóng thẻ tối bị đổi lệch hệ hoặc tài liệu tự mâu thuẫn. |
| Nguồn | `.repos/Portfolio/docs/DESIGN.md` dòng 292 (mục 7); cùng file dòng 264–265 (mục 6: "Dark: the same two layers at 40%/35% (level 1) and 50%/50% (level 2)"); `src/styles/variables.css` `:root[data-theme='dark']` `--elevation-1`, `--elevation-2`. Bản cũ ở `a50912c` ghi "≤10% opacity" cho hệ một theme. |
| Nguyên nhân | Câu được viết lại cho bản sáng (0,06/0,08 và 0,08/0,16) và không đối chiếu lại với khối theme tối do T05 thêm. |
| Phản biện | "Large layer" của `--shadow-elevated` (0,08) đúng với câu; nhưng câu nói về "elevation", tức `--elevation-*`, mà theme tối vượt 16%. Không thể coi là bất biến có chủ đích vì mục 6 của chính tài liệu nêu số 35–50%. REQ-05 của T06 liệt kê rõ các mục Do/Don't về hình dáng, nên QG-03 áp dụng. |
| Vai trò | frontend-developer |
| Đích | `.repos/Portfolio/docs/DESIGN.md` |
| Chỉ dẫn | Sửa dòng 292 thành quy tắc đúng ở cả hai theme: lớp bóng lớn có blur từ 24px trở lên, độ mờ theo token `--elevation-*` của từng theme (sáng tối đa 16%, tối 35–50%), hoặc bỏ con số và dẫn tới mục 6. Chỉ sửa tài liệu; không đổi token hay CSS. Sau khi sửa, đối chiếu mục 7 và mục 9 với cả hai khối theme. |
| Disposition | repair |

### Risks

Không có RISK.

### Blockers

Không có BLOCK.

### Tiếp theo

| Trường | Nội dung |
| --- | --- |
| Tiếp theo | Implement (lượt sửa) bởi `frontend-developer`: sửa FIND-01 trong `.repos/Portfolio/docs/DESIGN.md` theo Plan T06 và report này; không cần chạy test (không đổi source). Khi người dùng yêu cầu, Review lại vòng 02 chỉ cần đối chiếu dòng đã sửa. |

## Evaluations

### EVAL-01

| Trường | Nội dung |
| --- | --- |
| Vai trò | frontend-developer |
| Kết quả | FAIL |
| Lỗi | Dòng 292 của `docs/DESIGN.md` nêu giới hạn độ mờ bóng chỉ đúng với theme sáng (FIND-01). Phần giao diện đạt QG-01, QG-02: token, thẻ, chi tiết nhấn đúng Plan; hồi quy do diff ở header (nút theme nhô ra ở 1000–1042px) được bắt bằng số đo và sửa trong lượt. Hai quyết định ngoài chữ Plan (bỏ chấm tròn eyebrow, thêm viền cho nhãn thời gian) được nêu rõ trong `role_work`. |
| Nguyên nhân | execution (`doc-prose-claim-contradicts-source`): vai trò viết lại một quy tắc dạng "tối đa" nhưng không đối chiếu với mọi theme khai báo token đó. |
| Cải tiến | Chờ người dùng (mode_self): FIX-04 của record Review. |
| Bằng chứng | `docs/DESIGN.md` dòng 264–265 và 292; `variables.css`; Implementation Record T06 `role_work`. Ghi chú truy vết: record ghi khoảng cách liên kết header là `clamp(24px, 6vw - 28px, 48px)`, source cuối và hai tài liệu dùng `clamp(var(--space-3), 12vw - 100px, var(--nav-link-gap))`; không record nào ghi thay đổi này. Công thức cuối cho khoảng cách nhỏ hơn hoặc bằng ở khổ dưới 1200px và lớn hơn tối đa khoảng 2px ở 1200–1233px, nên hộp bao vẫn vừa (số đo T06 ở 1024px vừa với khoảng cách lớn hơn); không đổi kết luận QG nhưng record không còn khớp source. |

### EVAL-02

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-reviewer |
| Kết quả | FAIL |
| Lỗi | Kết luận QG-01 đúng, nhưng bằng chứng dựa vào "script đối chiếu: mỗi token REQ-01 ... khai đúng một lần" và "Đo thật trong trình duyệt (`typography-probe.txt`)". Plan T06 bước 5 ghi "kết luận QG-01 trên diff"; router xếp script kiểm chứng mới và chạy trình duyệt để nghiệm thu ngoài vòng đời task. Review lập luận lại trên source và nhận cùng kết quả. |
| Nguyên nhân | execution (`verification-evidence-from-scripts-and-runs`). |
| Cải tiến | Chờ người dùng (mode_self): FIX-03 của record Review. |
| Bằng chứng | `quality_gate_evidence` QG-01 của Implementation Record T06; Plan T06 `Làm như thế nào` bước 5. |

### EVAL-03

| Trường | Nội dung |
| --- | --- |
| Vai trò | ux-designer |
| Kết quả | PASS |
| Lỗi | Không có. QG-02 đứng vững trước ảnh và source; số đo kiểu chữ và hộp bao thuộc dữ liệu của lần chụp layout; phân biệt đúng hồi quy do diff (đã sửa một lần) với điểm có từ trước (GAP-07, GAP-08). |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `layout_verification` của Implementation Record T06; ảnh `T06/20261017-003727/*`, `T07/20261017-010446/*` đã xem. |

### EVAL-04

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-analyst |
| Kết quả | FAIL |
| Lỗi | Hai điểm. (1) QG-03 ghi PASS nhưng bỏ sót câu mục 7 dòng 292 mâu thuẫn với mục 6 của cùng file: vai trò chỉ "script đối chiếu 28 và 15 dòng bảng token" và grep giá trị cũ, không đọc các câu quy tắc (FIND-01). (2) Dựa vào script làm bằng chứng thay vì đọc từng câu; Plan T06 bước 7 không giao chạy lệnh. |
| Nguyên nhân | execution: (1) `verification-missed-doc-claim`, (2) `verification-evidence-from-scripts-and-runs`. |
| Cải tiến | Chờ người dùng (mode_self): FIX-03 và FIX-04 của record Review. |
| Bằng chứng | `quality_gate_evidence` QG-03 của Implementation Record T06; Review FIND-01. |
