---
schema: pirl-review/v1
content_language: vi
plan_file: ".agents/plan/portfolio-gaps_20261014-233844/05-plan-theme-fire-palette-20261014-233844.md"
task_id: T05
review_round: 2
prior_review: ".agents/review/portfolio-gaps_20261014-233844/t05-theme-fire-palette/round-01-review-theme-fire-palette-20261017-125800.md"
review_roles: [code-analyst, code-reviewer, business-analyst, solution-architect]
repair_roles: []
business_verdict: PASS
verdict: PASS
status: completed
reviewed_at: "2026-10-17T22:26:00+07:00"
implementation_target: ".repos/Portfolio commit a49bfe1 (745f1aa..a49bfe1 chỉ đổi docs/DESIGN.md, docs/RESPONSIVE.md, src/data/education.ts; không có CSS/TSX của T05) và Hub 73d55f6 (Plan T05 sửa theo record plan-20261017-142513-T05 và plan-20261017-145032-T05); không có lượt Implement T05 mới, lượt được đánh giá vẫn là implement-20261017-002027-T05. Bốn vai trò Review chạy bằng agent riêng (mode: agent); agent code-reviewer đã đọc bản nháp của người điều phối, các agent còn lại độc lập. Hai thay đổi chưa có chủ (không Implementation Record nào ghi): công thức khoảng cách liên kết header ở src/components/Header.module.css (6vw - 28px -> 12vw - 100px, trước 745f1aa) và chuỗi vi ở src/data/education.ts (trong a49bfe1); không thay đổi nào làm vỡ QG của T05"
---

# Review 02: T05 — Theme sáng/tối có nút chuyển, bảng màu hợp mệnh Sơn Đầu Hỏa

Bản sửa report: bản đầu của vòng này do người điều phối tự đảm nhận mọi vai trò. Bản này thay bản đầu, sau khi bốn vai trò Review đã chạy bằng agent riêng và người điều phối hợp nhất kết quả theo source. So với bản đầu, bản này đổi ba điểm:

- Dòng Border / outline nay được kết luận ở T06.
- Thêm RISK-03: câu về hover của nút đóng menu.
- Đính chính EVAL-01.

Vòng này đánh giá lại T05 sau hai thay đổi:

- Plan T05 được sửa theo quyết định của người dùng cho BLOCK-01.
- Lượt sửa T06 sửa danh sách media query của `docs/RESPONSIVE.md` theo RISK-03 của vòng 1.

Source theme, CSS và TSX của T05 không đổi. `src/data/education.ts` trong `a49bfe1` không thuộc T05.

Dấu vết của các chú thích `Thay đổi đã xác nhận`:

| Chỗ sửa | Record | Xác nhận của người dùng |
| --- | --- | --- |
| REQ-03 (`--color-footer-bg` tối) và REQ-05 (tỉ số 8.15) | `plan-20261017-142513-T05` | Người dùng chọn phương án (a) của BLOCK-01: giữ `#0F261F` |
| Phạm vi (ẩn dòng phụ logo dưới 480px) và REQ-06 (viết lại toàn bộ `docs/DESIGN.md`) | `plan-20261017-145032-T05` | Tin nhắn 2026-10-17 12:02 (+07:00): người dùng giao agent chọn phương án cho mục "Cần bạn xác nhận". Đây là giao quyền chọn; router xếp giao quyền chọn là một quyết định của người dùng |

Record `plan-20261017-220847-T05` thay record `plan-20261017-145032-T05` chỉ để áp dụng FIX-01 đang `pending_user`. `issues` và `fixes` của nó rỗng, và nó không rút lại chú thích nào. Chỉ chú thích REQ-03 quyết một QG (QG-03). Các chú thích Phạm vi và REQ-06 không đổi kết quả QG nào.

Business `PASS`. BLOCK-01 đã gỡ. Phần media query của RISK-03 vòng 1 đã sửa; phần Border / outline của RISK-03 thuộc T06 (xem QG-05).

## Business

### Quality gates

| QG | Kết quả | Bằng chứng |
| --- | --- | --- |
| QG-01 | PASS | `src/theme/`, `index.html`, `Header.tsx` không nằm trong diff `745f1aa..a49bfe1`. Lần lại trên source cuối:<br>- `resolveTheme` = `storedTheme() ?? systemTheme()` (`theme.ts:12–31`). `isTheme` chỉ nhận `light` hoặc `dark`. Thiếu `matchMedia` hoặc lời gọi ném lỗi thì `catch` trả `light`.<br>- Script trong `<head>` (`index.html:15–35`) dùng cùng quy tắc và chạy trước `<script type="module">` (dòng 39).<br>- `readInitialTheme` (`ThemeProvider.tsx:18–21`) lấy `dataset.theme` nếu hợp lệ, không thì gọi `resolveTheme()`.<br>Kết quả khớp năm hàng của bảng QG-01. |
| QG-02 | PASS | Nút `<button type="button">` (`Header.tsx:92–100`). `aria-label` lấy `switchToDark` hoặc `switchToLight` (`en.ts:17–18`, `vi.ts:19–20`). Icon `aria-hidden`. Kích thước 48px (`--size-button`).<br>`setTheme` gọi `setThemeState` trước, rồi `setItem` trong `try/catch`. `hasChoice` chặn đổi theo hệ điều hành khi đã có lựa chọn. `subscribeToSystemTheme` trả hàm gỡ, và `useEffect` trả lại hàm đó. Chỉ `ThemeProvider.tsx:42` có `useState<Theme>`.<br>Viền `:focus-visible` là 2px `--color-accent-text` (`global.css:107–110`). Tỉ số (L1 + 0,05) / (L2 + 0,05) trên `--color-surface`:<br>- sáng: `#A21F2A` có L = 0,0883, `#FFFDFC` có L = 0,9855, tỉ số = 1,0355 / 0,1383 = 7,49;<br>- tối: `#FF8A6B` có L = 0,4051, `#173229` có L = 0,0263, tỉ số = 0,4551 / 0,0763 = 5,97.<br>Cả hai ≥ 3:1. |
| QG-03 | PASS | Theo Plan đã sửa, ô `--color-footer-bg` tối là `#0F261F`. `variables.css:46` khớp, nên 34/34 giá trị (17 token × 2 theme) đúng bảng REQ-03.<br>Độ sáng HSL = (max + min) / 2 / 255:<br>- `#10261F`: (38 + 16) / 2 / 255 = 10,59%;<br>- `#173229`: (50 + 23) / 2 / 255 = 14,31%;<br>- `#1F3E34`: (62 + 31) / 2 / 255 = 18,24%;<br>- `#0F261F`: (38 + 15) / 2 / 255 = 10,39%.<br>Cả bốn nền tối ≥ 10%.<br>Nhóm màu cấm: hue của jade 154–160°, violet 272,5–277°, ember 13,5–17°, accent 3° và 358°. Không màu nào trong 180–260° hay 35–65°, và không có xám đen.<br>Grep `src/**/*.css`: không màu viết thẳng ngoài `variables.css`; không còn `#3860BE`, `#141413`, `rgba(0, 0, 0`; không tham chiếu token màu cũ. `*.tsx` không có `style` màu (chỉ `animationDelay`).<br>Phản ví dụ đã xét và bác: `--border-muted` (`variables.css:124`) không còn chỗ dùng. Đây là token viền suy từ `--color-text`, không phải "token màu cũ" của REQ-04, và QG-03 không đòi bỏ nó. |
| QG-04 | PASS | Không có diff hiển thị, nên ảnh vòng 1 (`T05/20261017-000207/*`, `T07/20261017-010446/*`) vẫn là nguồn.<br>Công thức khoảng cách liên kết header đã đổi sau lần chụp (`6vw - 28px` → `12vw - 100px`, xem EVAL-01 của report T06 vòng 2). Ở 1280px cả hai công thức bị kẹp ở 48px. Ở 360px hàng liên kết nằm trong lớp phủ, công thức không áp dụng. Vì vậy ảnh ở hai khổ của QG vẫn đúng với source cuối.<br>Tỉ số đã tính lại theo REQ-05, công thức (L1 + 0,05) / (L2 + 0,05) với mỗi kênh c = ((c/255 + 0,055) / 1,055)^2,4:<br>- L(`#CBB3BE`) = 0,4866;<br>- L(`#0F261F`) = 0,015875;<br>- tỉ số = 0,5366 / 0,065875 = 8,15, khớp Plan đã sửa và ≥ 4,5:1.<br>Điểm không đạt có từ trước giữ nguyên: GAP-07 và RISK-01. |
| QG-05 | PASS | `#0F261F` xuất hiện ở `docs/DESIGN.md:51` và `DOCUMENTATION_COMPLETE.md:62`, `:620`, `:810`, `:1368` (hai ngôn ngữ). Grep `0E241D`, `8.33`, `8,33` trong Portfolio và tài liệu ngữ cảnh ở Hub cho 0 kết quả.<br>Phần media query của RISK-03 vòng 1 đã sửa. `RESPONSIVE.md` dòng 9–11 liệt kê `max-width` 479, 767, 1023 và `min-width` 480, 768, 1024, khớp grep `@media` theo chiều rộng trong `src/**/*.css`. Các truy vấn còn lại là `prefers-reduced-motion`, `print` và `@supports`, không theo chiều rộng.<br>Phần Border / outline của RISK-03 vòng 1 không thuộc T05. Tại `a50912c`, chip và CTA đều dùng `--border-ink`, và T05 chỉ đổi màu. Vì vậy câu do T05 viết ("`--border-ink` for chips and secondary buttons") đúng ở trạng thái của T05 (đây là suy luận, vì T01–T07 nằm chung một commit). Câu thành sai do T06 đổi viền. Report T06 vòng 2 kết luận chỗ này ở QG-03; dòng mới khớp CSS. Vòng 1 ghi chỗ lệch này cho T05 là ghi nhầm.<br>Các đoạn khác của QG-05 không đổi; vòng 1 đã kết luận chúng. Câu về hover của nút đóng nằm ngoài các kiểm của QG-05, ghi ở RISK-03. |

### Findings

Không có FIND.

### Risks

#### RISK-01

| Trường | Nội dung |
| --- | --- |
| QG | QG-04 |
| Tác động | Người xem bản tiếng Anh (ngôn ngữ mặc định) ở khổ 768px tới khoảng 950px (máy tính bảng dọc 768, 810, 820px) không bấm được nút đổi theme bằng chuột hay cảm ứng. Nút nằm ngoài viên thuốc và ngoài khung nhìn. Số đo ở T06: tại 768px, nút ở x = 878–926; tại 900px, nút ở x = 888–936 trong khi viên thuốc kết thúc ở 876. Bàn phím Tab tới được nút nhưng không nhìn thấy nó. Bản `vi` vẫn vừa ở 768px. Ngoài ra `DESIGN.md:169` ("Visible at every width") và `RESPONSIVE.md:30` ("always shown") nói quá so với hiện trạng ở khổ này. |
| Nguồn | `T05/20261017-000207/nav-measure-after.txt`, `nav-measure-baseline.txt`; `T06/20261017-003727/nav-measure-desktop.txt`; `src/components/Header.module.css` (`.navLinks` xếp ngang từ 768px); `.agents/llm-docs/repos/Portfolio.md` GAP-08. |
| Nguyên nhân | Hàng sáu liên kết tiếng Anh đã rộng hơn viên thuốc ở khổ dưới khoảng 1000px từ trước diff (GAP-08). T05 thêm nút theme vào cuối hàng đó. |
| Phản biện | QG-04 chỉ nêu khổ 1280 và 360, và lỗi tràn có từ trước. Muốn sửa phải đổi ngưỡng hamburger, tức đổi bố cục; Phạm vi T05 không cho việc đó. Không tìm thấy quyết định nào của người dùng giao xử lý GAP-08. |
| Vai trò | ux-designer, frontend-developer |
| Đích | `.repos/Portfolio/src/components/Header.module.css`, `docs/DESIGN.md`, `docs/RESPONSIVE.md`, `.agents/llm-docs/repos/Portfolio.md` (GAP-08) |
| Chỉ dẫn | Khi người dùng giao xử lý GAP-08: đưa menu hamburger lên dưới 1024px, hoặc rút gọn hàng liên kết ở 768–1023px. Đo hộp bao ở 768, 900, 1023 và 1024px cho cả `en` và `vi`. Sau đó sửa hai câu "Visible at every width" và "always shown" theo hiện trạng mới. |
| Xem lại khi | Người dùng muốn hỗ trợ máy tính bảng dọc, hoặc giao xử lý GAP-08. |

#### RISK-02

| Trường | Nội dung |
| --- | --- |
| QG | QG-04 |
| Tác động | Người xem trên điện thoại dưới 480px không thấy dòng chức danh `Java Developer \| Salesforce Developer` trong header; chức danh vẫn hiện ở hero ngay bên dưới. Việc ẩn đã được ghi vào Phạm vi của Plan như thay đổi đã xác nhận. Sau đó người dùng chọn hiện lại chức danh bằng cách khác, nhưng source chưa đổi. |
| Nguồn | `src/components/Header.module.css:273–276` (`@media (max-width: 479px)` ẩn `.subtitle`); Plan T05 mục Phạm vi (chú thích `Thay đổi đã xác nhận`); Plan `.agents/plan/portfolio-header-subtitle-mobile_20261017-142710/01-plan-header-subtitle-mobile-20261017-142710.md` (REQ-01, record `plan-20261017-142910-T01`, chưa Implement). |
| Nguyên nhân | Ở 360px, logo kèm dòng phụ cộng hai nút 48px không vừa viên thuốc rộng 312px. |
| Phản biện | QG-04 đòi điều kiện hình học, không đòi giữ dòng phụ, và người dùng đã duyệt việc ẩn. Rủi ro còn đứng vì người dùng muốn chức danh hiện lại mà gói sửa chưa triển khai. Gói đó phụ thuộc đầu ra của T05 và T07 (cả hai đã `implemented`), nên không có vòng phụ thuộc. |
| Vai trò | frontend-developer, ux-designer |
| Đích | `.repos/Portfolio/src/components/Header.module.css`, `docs/RESPONSIVE.md`, `docs/DESIGN.md` |
| Chỉ dẫn | Triển khai Plan T01 của gói `portfolio-header-subtitle-mobile_20261017-142710`; không sửa trong T05. Sau khi gói đó vào, câu "ẩn dưới 480px" của T05 trở thành hồ sơ lịch sử, không còn là lỗi của T05. |
| Xem lại khi | Plan T01 của gói `portfolio-header-subtitle-mobile_20261017-142710` được Implement và Review. |

#### RISK-03

| Trường | Nội dung |
| --- | --- |
| QG | QG-05 |
| Tác động | Mức thấp, chỉ tài liệu. `DESIGN.md:165–167` gộp nút theme, nút menu và nút đóng menu (`.mobileCloseButton`) dưới một dòng "Hover: background `--color-bg`". Nút đóng thực ra giữ nền `--color-surface` và phóng `scale(1.02)` khi hover (`Header.module.css:266–269`). Người làm theo tài liệu có thể đổi hover của nút đóng cho khớp câu sai. |
| Nguồn | `docs/DESIGN.md:165–167`; `Header.module.css:148–150` (`.themeButton:hover`), `:174–176` (`.menuButton:hover`), `:266–269` (`.mobileCloseButton:hover`); `git show a50912c:src/components/Header.module.css` (hover nút đóng khi đó là màu trắng). |
| Nguyên nhân | T05 viết lại `DESIGN.md` (REQ-06, sửa mọi câu nhắc màu) và gộp ba nút vào một nhóm, nhưng không đối chiếu quy tắc hover của từng nút. |
| Phản biện | QG-05 kiểm mã màu, bảng ngũ hành, mục theme, tên hệ cũ và token đã bỏ; câu này không nêu mã màu nào sai. Vì vậy QG vẫn đạt. Chỗ lệch có căn cứ trên source nên được ghi lại. |
| Vai trò | frontend-developer, technical-writer |
| Đích | `.repos/Portfolio/docs/DESIGN.md` |
| Chỉ dẫn | Chưa có task chủ. Người dùng giao việc sửa tài liệu này (task độc lập hoặc Plan mới, layer Implement). Khi đó tách hover của nút đóng ra khỏi dòng chung (nền `--color-surface`, `scale(1.02)`), hoặc đổi CSS cho đồng nhất nếu người dùng muốn. |
| Xem lại khi | Người dùng giao task sửa `docs/DESIGN.md` mục 4 hoặc `Header.module.css`. |

### Blockers

Không có BLOCK. BLOCK-01 của vòng 1 đã gỡ: người dùng chọn phương án (a), và Plan đã sửa theo record `plan-20261017-142513-T05`.

### Tiếp theo

| Trường | Nội dung |
| --- | --- |
| Tiếp theo | Không có việc sửa bắt buộc. T05 đóng ở vòng 2.<br>- RISK-01: chờ người dùng giao xử lý GAP-08.<br>- RISK-02: chuyển sang Implement Plan T01 của gói `portfolio-header-subtitle-mobile_20261017-142710` khi người dùng yêu cầu.<br>- RISK-03: chờ người dùng giao task sửa tài liệu.<br>- Hai thay đổi chưa có chủ: công thức khoảng cách liên kết header (`Header.module.css:109`, trước `745f1aa`) và chuỗi `vi` của `src/data/education.ts` (trong `a49bfe1`). Muốn Review chúng thì người dùng giao một lượt Implement hoặc task độc lập để ghi chúng trước. |

## Evaluations

Không có lượt Implement T05 mới kể từ vòng 1. `layer_record.py query --layer implement --task T05` cho hai record:

- `implement-20261017-002027-T05`: có đủ bốn vai trò; đây là record được đánh giá.
- `implement-20261017-121848-T05`: chỉ có `coordinator` và có `supersedes`, tức chỉ là record áp dụng cải tiến.

Vòng 1 đã ghi các lỗi của lượt này ở record `review-20261017-130356-T05` (ISSUE-03..06), và cải tiến đã áp dụng ở `review-20261017-132340-T05`. Vòng 2 có thêm bằng chứng, nên đánh giá lại. Nguyên nhân và cải tiến của phần mới do `process-auditor` (agent riêng) phân loại.

### EVAL-01

| Trường | Nội dung |
| --- | --- |
| Vai trò | frontend-developer |
| Kết quả | FAIL |
| Lỗi | Mức thấp, không đổi QG. Đính chính vòng 1: dòng Border / outline không phải lỗi của T05 (xem QG-05); lỗi của T05 là hai câu tài liệu khác:<br>(1) Danh sách media query ở `RESPONSIVE.md` thiếu `max-width: 479px`, mà chính T05 thêm truy vấn này (nay đã sửa).<br>(2) Câu hover của nút đóng ở `DESIGN.md:165–167` (RISK-03).<br>Thông tin mới về các quyết định ngoài chữ Plan: người dùng chọn giữ `#0F261F` và đã duyệt việc ẩn dòng phụ cùng việc viết lại `DESIGN.md`. Vậy cách vai trò chọn giá trị thỏa quy tắc chặt hơn rồi nêu rõ để chờ xác nhận là đúng. |
| Nguyên nhân | execution (`doc-prose-claim-contradicts-source`), ISSUE-05 của `review-20261018-030330-T05`. Quy tắc quét tài liệu và REQ-06 đã rõ, nhưng cột "Hoàn tất khi" của vai trò không có điều kiện về tài liệu đi kèm. Record này đính chính ISSUE-03 của `review-20261017-130356-T05`: dòng Border / outline thuộc T06. |
| Cải tiến | Đã áp dụng: `implement.instructions.md` 1.4.0 → 1.5.0 (cột Hoàn tất khi của `backend-developer`, `frontend-developer` thừa kế: câu quy tắc, phạm vi hay danh sách trong tài liệu đã dò từng phần tử và nơi dùng); `technical-writer.role.md` 1.1.0 → 1.2.0. |
| Bằng chứng | Implementation Record T05 `role_work`; `git show a50912c` cho `Skills.module.css:96` và `Personal.module.css:87`, `:93`; `RESPONSIVE.md` trước và sau `a49bfe1`; `DESIGN.md:165–167`; `Header.module.css:266–269`. |

### EVAL-02

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-reviewer |
| Kết quả | FAIL |
| Lỗi | Giữ kết luận vòng 1: kết luận QG-01 và QG-02 đúng, nhưng dòng bằng chứng dựa vào đầu dò `PerformanceObserver` và đo trong trình duyệt. Vòng 2 không có bằng chứng mới làm đổi đánh giá này. |
| Nguyên nhân | execution (`verification-evidence-from-scripts-and-runs`), đã ghi ở `review-20261017-130356-T05` ISSUE-04 |
| Cải tiến | Đã áp dụng ở `review-20261017-132340-T05` (FIX-03 vòng 1) |
| Bằng chứng | `quality_gate_evidence` QG-01, QG-02 của Implementation Record T05. |

### EVAL-03

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-analyst |
| Kết quả | FAIL |
| Lỗi | Giữ kết luận vòng 1 ở hai điểm:<br>(1) QG-03, QG-05 dựa vào script đối chiếu.<br>(2) Ghi QG-03 PASS "với độ lệch footer-bg" thay vì BLOCKED, khi Plan còn mâu thuẫn. Plan sửa ở vòng 2 không hợp thức hóa điểm này, vì lúc Implement Plan chưa được sửa.<br>Vòng 2 không quy thêm cho vai trò này hai câu tài liệu ở EVAL-01: QG-05 không kiểm chúng. |
| Nguyên nhân | execution (`verification-evidence-from-scripts-and-runs`), đã ghi ở `review-20261017-130356-T05` ISSUE-05; phần Plan tự mâu thuẫn là input (`plan-table-violates-own-numeric-rule`), đã xử lý ở `implement-20261017-121848-T05` |
| Cải tiến | Đã áp dụng ở `review-20261017-132340-T05` (FIX-03 vòng 1) |
| Bằng chứng | `quality_gate_evidence` QG-03, QG-05 và `role_challenge_results` của Implementation Record T05. |

### EVAL-04

| Trường | Nội dung |
| --- | --- |
| Vai trò | ux-designer |
| Kết quả | FAIL |
| Lỗi | Giữ kết luận vòng 1: QG-04 đúng ở phần ảnh và hộp bao, nhưng tỉ số tương phản lấy từ script (23 cặp mỗi theme). |
| Nguyên nhân | execution (`verification-evidence-from-scripts-and-runs`), đã ghi ở `review-20261017-130356-T05` ISSUE-06 |
| Cải tiến | Đã áp dụng ở `review-20261017-132340-T05` (FIX-03 vòng 1) |
| Bằng chứng | `quality_gate_evidence` QG-04 của Implementation Record T05. |
