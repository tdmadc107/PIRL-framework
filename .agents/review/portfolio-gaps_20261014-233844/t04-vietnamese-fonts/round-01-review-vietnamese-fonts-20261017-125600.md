---
schema: pirl-review/v1
content_language: vi
plan_file: ".agents/plan/portfolio-gaps_20261014-233844/04-plan-vietnamese-fonts-20261014-233844.md"
task_id: T04
review_round: 1
prior_review: null
review_roles: [code-analyst, code-reviewer, business-analyst, solution-architect, ux-designer]
repair_roles: []
business_verdict: PASS
verdict: PASS
status: completed
reviewed_at: "2026-10-17T12:56:00+07:00"
implementation_target: ".repos/Portfolio commit 745f1aa (a50912c..745f1aa, một commit gồm cả T01–T07) và Hub e079707; tự thực hiện (mode: self), không có phản biện độc lập"
---

# Review 01: T04 — Font hỗ trợ tiếng Việt: Playfair Display cho tiêu đề, Be Vietnam Pro cho nội dung

Phạm vi snapshot: bảy task T01–T07 nằm chung commit `745f1aa`, không có diff riêng từng task. T06 đổi trọng số tiêu đề từ 500 lên 600 và cỡ chữ; các giá trị đó thuộc REQ của T06 và vẫn nằm trong khoảng cho phép của REQ-03 của T04 (Be Vietnam Pro thuộc 300–700, Playfair Display thuộc 400–700).

## Business

### Quality gates

| QG | Kết quả | Bằng chứng |
| --- | --- | --- |
| QG-01 | PASS | `index.html`: thẻ `link` là `family=Be+Vietnam+Pro:wght@300;400;500;600;700&family=Playfair+Display:wght@400..700&display=swap`; Be Vietnam Pro khai từng trọng số, Playfair Display khai khoảng, có `display=swap`, không có `opsz`; hai thẻ `preconnect` còn nguyên. grep `sofia`, `opsz`, `MarkForMC` trong `src/` và `index.html` = 0.<br>`font-family` trong `src/**/*.css`: chỉ `var(--font-family-primary)` (`index.css`, `global.css`), `var(--font-family-display)` (`h1`, `h2` trong `global.css`) và `inherit` cho `button`, `input`. Phần tử `<h1>` là logo `Header` và tên hero `Personal`; `<h2>` là bảy tiêu đề (Skills, Education, Experience, Projects, Certifications, Achievements, `Footer`); mọi `h3` và chữ còn lại dùng `--font-family-primary`. Logo có class riêng (`.title`) nhưng không khai báo `font-family`, nên nhận font tiêu đề từ `h1`.<br>`font-weight` trong CSS đều là `var(--font-weight-regular\|medium\|semibold)` = 400/500/600, không còn 450. `line-height` của phần tử dùng font tiêu đề: `h1` 1,15 (`--line-height-h1`), `h2` 1,2, logo 1,2, đều ≥ 1,15. `overflow: hidden` chỉ có ở `.achievementCard`, `.portrait` và `.srOnly` (bản chữ dành cho trình đọc màn hình bên trong `h1`, các ký tự nhìn thấy nằm ở `<span aria-hidden>` khác); không phần tử tiêu đề nào bị cắt chữ hay có chiều cao cố định. |
| QG-02 | PASS | Ảnh đã xem: `T04/20261016-233137/vi-1280x800-t04c-bottom.png` và `vi-360x800-t04c-top.png` (trạng thái lúc T04), trạng thái cuối `T07/20261017-010446/en-light-rm-1280x800-static-bottom.png`, `vi-dark-rm-360x800-static-bottom.png`. Tiêu đề (logo, tên hero, `h2` "Chúng tôi luôn sẵn sàng khi bạn cần.") hiển thị bằng chữ serif, phần còn lại bằng chữ không chân; dấu tiếng Việt trong Playfair ("ú", "ô", "ẵ", "à", "ầ") nét rõ, không bị cắt hay chồng dòng trên, một họ font trong một từ.<br>Không cuộn ngang ở 1280. Ở 360 `scrollWidth` 426 so với 360 do `span.orbit` giống hệt baseline (`T01/20261016-224201/results.md`), có từ trước (GAP-07), không tính là FAIL của T04. Hồi quy do diff mà lượt Implement bắt được (nút hamburger nhô 10px ra viên thuốc ở 360 vì Be Vietnam Pro rộng hơn Arial) đã được sửa một lần trong lượt (`gap: var(--space-1)` trong `@media (max-width: 767px) .nav`, còn trong `Header.module.css`), dưới giới hạn hai lần sửa; ảnh cuối ở 360 cho logo, nút theme và nút menu nằm trong viên thuốc. |
| QG-03 | PASS | `docs/DESIGN.md` mục 3 ("Font Family", "Hierarchy", "Principles", "Note on Font Choices"), mục 4, mục 7, mục 9: tên font, hai token `--font-family-primary` và `--font-family-display`, trọng số 400/500/600, line-height của `h1` 1,15 và `h2` 1,2, cách tải font (từng trọng số cho Be Vietnam Pro, khoảng 400–700 cho Playfair) khớp `variables.css`, `global.css`, `index.html`. `docs/RESPONSIVE.md` dòng "Font families" và đoạn trọng số, line-height khớp. grep `MarkForMC`, `Sofia`, `450`, `1:1` (nghĩa H1 line-height 1) trong `docs/DESIGN.md`, `docs/RESPONSIVE.md`, `DOCUMENTATION_COMPLETE.md` = 0. `.agents/llm-docs/repos/Portfolio.md`: không có GAP-05; mục Kiến trúc nêu cặp font. Kết luận đúng dù T02 hoàn tất trước hay sau T04. |

### Findings

Không có FIND.

### Risks

Không có RISK.

### Blockers

Không có BLOCK.

### Tiếp theo

| Trường | Nội dung |
| --- | --- |
| Tiếp theo | Không có việc sửa. Font tải từ Google Fonts khi chạy; không có mạng thì dùng font dự phòng đều có chữ tiếng Việt (đã nêu trong `docs/DESIGN.md`). |

## Evaluations

### EVAL-01

| Trường | Nội dung |
| --- | --- |
| Vai trò | frontend-developer |
| Kết quả | PASS |
| Lỗi | Không có lỗi đầu ra còn lại. Hồi quy do đổi font (`header-overflow-after-font-swap`, nguyên nhân execution) đã được chính vai trò bắt bằng số đo hộp bao và sửa trong lượt; cải tiến framework tương ứng đã áp dụng ở record `implement-20261017-121847-T04` (cột "Hoàn tất khi" của `frontend-developer` trong `implement.instructions.md` nay đòi số đo hộp bao). Hai lỗi framework khác (`layout-tooling-notes-missing`, `layout-baseline-method-undefined`) cũng đã xử lý. |
| Nguyên nhân | Không có lỗi mới |
| Cải tiến | Không cần |
| Bằng chứng | Implementation Record T04 (`role_work`), record `implement-20261016-233907-T04` và record sửa `implement-20261017-121847-T04`; `index.html`, `variables.css`, `global.css`, `Header.module.css`. |

### EVAL-02

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-reviewer |
| Kết quả | PASS |
| Lỗi | Không có. QG-01 dựa vào grep và đọc từng khai báo CSS, không dựa vào kết quả chạy; phản ví dụ (logo có class riêng) đúng. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `quality_gate_evidence` QG-01; `src/**/*.css`, `index.html`. |

### EVAL-03

| Trường | Nội dung |
| --- | --- |
| Vai trò | ux-designer |
| Kết quả | PASS |
| Lỗi | Không có. QG-02 đứng vững; phân biệt đúng điểm không đạt do diff (hamburger nhô ra, đã sửa) với điểm có từ trước (cuộn ngang 360px). Số đo kiểu chữ trên toàn trang thuộc dữ liệu của lần chụp layout. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `layout_verification` của Implementation Record T04; ảnh `T04/20261016-233137/*` và `T07/20261017-010446/*` đã xem. |

### EVAL-04

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-analyst |
| Kết quả | PASS |
| Lỗi | Không có. QG-03 đứng vững: đối chiếu từng đoạn tài liệu nêu font với source, không dựa vào kết quả chạy. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `quality_gate_evidence` QG-03; `docs/DESIGN.md`, `docs/RESPONSIVE.md`, `.agents/llm-docs/repos/Portfolio.md`. |
