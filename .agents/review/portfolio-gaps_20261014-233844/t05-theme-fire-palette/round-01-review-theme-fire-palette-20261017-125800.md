---
schema: pirl-review/v1
content_language: vi
plan_file: ".agents/plan/portfolio-gaps_20261014-233844/05-plan-theme-fire-palette-20261014-233844.md"
task_id: T05
review_round: 1
prior_review: null
review_roles: [code-analyst, code-reviewer, business-analyst, solution-architect, ux-designer]
repair_roles: []
business_verdict: BLOCKED
verdict: BLOCKED
status: completed
reviewed_at: "2026-10-17T12:58:00+07:00"
implementation_target: ".repos/Portfolio commit 745f1aa (a50912c..745f1aa, một commit gồm cả T01–T07) và Hub e079707; tự thực hiện (mode: self), không có phản biện độc lập"
---

# Review 01: T05 — Theme sáng/tối có nút chuyển, bảng màu hợp mệnh Sơn Đầu Hỏa

Phạm vi snapshot: bảy task T01–T07 nằm chung commit `745f1aa`, không có diff riêng từng task. T06 và T07 sửa tiếp CSS dùng token của T05 (thẻ, chip, kính mờ); Review đánh giá phần T05 sở hữu (token, cơ chế theme, nút, tài liệu) trên source cuối.

Business `BLOCKED` chỉ vì QG-03: bảng giá trị của chính Plan mâu thuẫn với quy tắc đo được của Plan ở một ô, nên không có bản triển khai nào thỏa cả hai. Đây không phải lỗi của code; bốn QG còn lại đạt.

## Business

### Quality gates

| QG | Kết quả | Bằng chứng |
| --- | --- | --- |
| QG-01 | PASS | `src/theme/theme.ts` `resolveTheme` = `storedTheme() ?? systemTheme()`. Lần từng hàng của bảng: lưu `dark` hoặc `light` → `isTheme` trả đúng giá trị đó, bất kể hệ điều hành; không có khóa, giá trị khác (`purple`) hoặc `getItem` ném lỗi → `storedTheme()` trả `null`, rồi `systemTheme()`: `matchMedia('(prefers-color-scheme: dark)').matches` → `dark`, ngược lại `light`; `window.matchMedia` thiếu hoặc ném lỗi → `catch` trả `light`.<br>`index.html` có script nội tuyến trong `<head>` cùng quy tắc, đặt `data-theme` đồng bộ trước `<script type="module">` ở cuối `<body>`. `ThemeProvider.tsx` `readInitialTheme` lấy `document.documentElement.dataset.theme` nếu hợp lệ nên lần render đầu cùng theme; không có script (test) thì `resolveTheme()` cho kết quả như bảng. |
| QG-02 | PASS | `Header.tsx`: nút gọi `toggleTheme` → `setTheme`: đặt `hasChoice`, thêm lớp `theme-switching` (gỡ sau 300ms), `setThemeState` trước, rồi `setItem` trong `try/catch`, nên ghi lỗi không chặn đổi và không có thông báo. `useLayoutEffect` đặt `data-theme` (kèm `color-scheme` từ khối token) và `<meta name="theme-color">` từ `--color-bg`. `subscribeToSystemTheme` trả hàm gỡ listener, `useEffect` trả hàm đó nên gỡ khi unmount; callback chỉ `setThemeState` khi `hasChoice.current` sai. Chỉ `ThemeProvider` có `useState<Theme>`.<br>Nút là `<button type="button">`; `aria-label` lấy `t.header.switchToDark` hoặc `switchToLight` theo theme và ngôn ngữ; icon SVG `aria-hidden="true"`; `--size-button` 48px nên vùng bấm 48×48px; `:focus-visible` toàn cục có `outline: 2px solid var(--color-accent-text)`, ảnh `T05/20261017-000207/en-dark-1280x800-t05c-focus-theme-button.png` đã xem: vòng focus san hô thấy rõ.<br>Test trong diff đối chiếu FUT: sáu test của `src/theme/theme.test.tsx` truy về REQ-01, REQ-02 (bảng khởi tạo, bấm đổi và lưu, ghi lỗi, đổi theo hệ điều hành rồi bỏ qua sau khi chọn), khẳng định thuộc tính `data-theme`, khóa lưu và tên nút lấy từ bảng chuỗi; không khóa chi tiết cài đặt. |
| QG-03 | BLOCKED | Xem BLOCK-01. 33 trên 34 giá trị token (17 token × 2 theme) đúng bảng REQ-03; `--color-footer-bg` của theme tối là `#0F261F`, bảng ghi `#0E241D`. Các ý còn lại của QG đạt: hai khối theme cùng 17 token; grep màu viết thẳng (`#hex`, `rgb`, `hsl`, tên màu) trong `src/**/*.css` ngoài `variables.css` chỉ khớp `transparent` và `color-mix(...)`/`rgba(var(--color-shadow-rgb), …)` dẫn từ token; không còn `#3860BE`, `#141413`, `rgba(0, 0, 0`; không `style` màu nội tuyến trong `src/**/*.tsx` (chỉ `animationDelay` ở `Personal.tsx`); không tham chiếu token đã bỏ.<br>Nhóm màu cấm (tính tay hue/saturation các token có nguy cơ cao): nền tối `#10261F`, `#173229`, `#1F3E34`, `jade` hue 154–160° (dưới 180°); `violet` `#7B3FA0` 277°, `#CDA6EE` 272,5° (trên 260°); `ember` 13,5° và 17°, `accent-text` 13°, `accent` 3° và 358°; không màu nào trong 180°–260° hay 35°–65°, không màu đen hay xám đen. Độ sáng HSL nền tối: `--color-bg` 10,59%, `--color-surface` 14,31%, `--color-surface-raised` 18,24%, `--color-footer-bg` (`#0F261F`) 10,39%. |
| QG-04 | PASS | Ảnh đã xem: `T05/20261017-000207/en-dark-1280x800-t05c-top.png`, `vi-light-360x800-t05c-top.png`, `vi-dark-360x800-t05c-top.png`, `en-dark-1280x800-t05c-focus-theme-button.png`; trạng thái cuối `T07/20261017-010446/fx-header-scrolled-light-1280.png`, `en-light-rm-1280x800-static-bottom.png`, `vi-dark-rm-360x800-static-bottom.png`, `fx-menu-open-scrolled-dark-360.png`. Mọi section và footer dùng màu của theme đang chọn, không còn nền kem hay đen cũ; ở 1280 sáu mục điều hướng và nút theme nằm trên một hàng trong viên thuốc, không chồng khối tên; ở 360 logo, nút theme và nút menu nằm trong viên thuốc, không chồng nhau; menu mở có sáu mục và nút đóng.<br>Tương phản: với các cặp Plan đã tính (REQ-05) giá trị token đứng vững; cặp phát sinh khi triển khai tính tay: `--color-accent-text` (`#A21F2A`) trên `--color-bg` sáng 7,0:1, `#FF8A6B` trên `--color-bg` tối 6,9:1; viền nút tròn `--border-control` (55% `--color-text`) trên `--color-surface` đạt khoảng 4:1 sáng và 4,7:1 tối. `--color-ember` chỉ ở trang trí (đường timeline, chấm danh sách, thanh thẻ thành tích, vòng ảnh, màu của viền sáng); không chữ nào nằm trên `--gradient-flame` (chỉ vạch eyebrow 2px, vòng `.orbit` và gạch chân hover).<br>Không cuộn ngang ở 1280. Điểm không đạt có từ trước (cuộn ngang 360px do `span.orbit`, GAP-07; tràn hàng liên kết ở 768–1023px, GAP-08) không do diff; riêng ảnh hưởng của GAP-08 lên nút theme xem RISK-01. |
| QG-05 | PASS | `docs/DESIGN.md`: tiêu đề "Sơn Đầu Hỏa Design System"; mục 1, 2 mô tả hai theme; bảng token, bảng ngũ hành, quy tắc tương phản và gradient khớp `variables.css`; mục 10 (cách chọn theme, `data-theme`, nút, `meta theme-color`, 250ms, giảm chuyển động) khớp `theme.ts`, `ThemeProvider.tsx`, `index.html`; grep `Mastercard`, `Signal Orange`, `Link Blue`, `cream`, `#141413` = 0. Nội dung font của T04 giữ nguyên. `docs/RESPONSIVE.md` không còn `--color-lifted` hay tên hệ cũ; ghi chú đầu `docs/UPDATE_SUMMARY.md` và chú thích đầu `variables.css` nêu "Sơn Đầu Hỏa"; `DOCUMENTATION_COMPLETE.md` (hai ngôn ngữ) có bảng màu hai theme khớp token, mục sáng/tối, `src/theme/` trong cây và bảng thư mục. `.agents/llm-docs/repos/Portfolio.md`: mục Kiến trúc, "Kiểm chứng layout bằng mock" (chiều theme và cách đặt `portfolio_theme`), dòng `docs/DESIGN.md` khớp source. Hai chỗ sai nhỏ ngoài các kiểm của QG-05 ghi ở RISK-03. |

### Findings

Không có FIND.

### Risks

#### RISK-01

| Trường | Nội dung |
| --- | --- |
| QG | QG-04 |
| Tác động | Người xem bản tiếng Anh (ngôn ngữ mặc định) ở khổ khoảng 768–900px (ví dụ máy tính bảng dọc 768, 810, 820px) không bấm được nút đổi theme: đo ở 768px nút ở x = 883–931, ở 900px nút ở x = 908–956, ngoài viên thuốc (kết thúc ở 744px và 876px) và ngoài khung nhìn. Header là `position: fixed` nên phần tràn bị cắt và không tạo thanh cuộn ngang; chuột và cảm ứng không tới được nút, bàn phím Tab tới được nhưng không nhìn thấy. Ở 1000px (đo ở T06) nút đã nằm trong viên thuốc; bản `vi` ngắn hơn nên vẫn vừa ở 768px (nút ở x = 696–744). |
| Nguồn | `T05/20261017-000207/nav-measure-after.txt` (dòng `after 768 en`, `after 900 en`), `nav-measure-baseline.txt` (trước diff: hàng liên kết `en` đã kết thúc ở x = 890, ngoài viên thuốc), `T06/20261017-003727/nav-measure-desktop.txt` (dòng `desktop 1000 en`); `src/components/Header.module.css` (`.navLinks` xếp ngang từ 768px, hamburger chỉ dưới 768px); `.agents/llm-docs/repos/Portfolio.md` GAP-08. |
| Nguyên nhân | Hàng sáu liên kết tiếng Anh rộng hơn viên thuốc ở khổ dưới khoảng 1000px (đo được ở 768 và 900px) từ trước diff (GAP-08); T05 thêm nút theme vào cuối hàng đã tràn đó. |
| Phản biện | QG-04 của Plan chỉ nêu khổ 1280 và 360 và yêu cầu so với ảnh trước diff; tràn hàng liên kết có từ trước (GAP-08: trước diff hàng `en` đã kết thúc ở x = 890 nên hai liên kết cuối đã ngoài khung ở 768px); sửa cần đổi ngưỡng hamburger từ 768 lên 1024px, tức đổi bố cục mà Phạm vi của T05 cấm và cần quyết định của người dùng. REQ-02 nói nút "hiển thị ở mọi khổ", nên rủi ro này có thật dù QG đạt; đây là điểm người dùng thấy rõ nhất trong gói vì nó gặp ở ngôn ngữ mặc định và khổ máy tính bảng dọc phổ biến. |
| Vai trò | ux-designer, frontend-developer |
| Đích | `.repos/Portfolio/src/components/Header.module.css`, `.agents/llm-docs/repos/Portfolio.md` (GAP-08) |
| Chỉ dẫn | Khi người dùng chọn xử lý GAP-08: đưa menu hamburger lên dưới 1024px (hoặc rút gọn hàng liên kết ở 768–1023px) để nút theme luôn trong viên thuốc; đo hộp bao ở 768, 900, 1023 và 1024px cho cả `en` và `vi`. |
| Xem lại khi | Người dùng muốn hỗ trợ máy tính bảng dọc, hoặc khi giao xử lý GAP-08. |

#### RISK-02

| Trường | Nội dung |
| --- | --- |
| QG | QG-04 |
| Tác động | Người xem trên điện thoại dưới 480px không còn thấy dòng chức danh `Java Developer \| Salesforce Developer` trong header; chức danh vẫn hiện ngay bên dưới ở hero và ở chi tiết Position. Bản trước diff hiển thị dòng này ở 360px. |
| Nguồn | `src/components/Header.module.css` (`@media (max-width: 479px) .subtitle { display: none }`); Implementation Record T05 `role_work` ("Tự quyết định ngoài chữ Plan ... ẩn dòng phụ logo dưới 480px"); Plan T05 mục Phạm vi ("Không đổi ... bố cục, nội dung"). |
| Nguyên nhân | QG-04 đòi logo, nút theme và nút menu nằm trong viên thuốc rộng 312px ở 360px; logo kèm dòng phụ (khoảng 226px) cộng hai nút 48px và khoảng cách không vừa. |
| Phản biện | QG-04 đòi điều kiện hình học, không đòi giữ dòng phụ; cách khác (cho dòng phụ xuống dòng, thu nhỏ chữ) cũng đổi bố cục hoặc cỡ chữ ngoài phạm vi, nên ẩn dòng phụ là lựa chọn nhỏ nhất và thông tin không mất. QG vẫn đạt; quyết định thuộc chủ sản phẩm và Implement đã nêu rõ để chờ xác nhận. |
| Vai trò | ux-designer, business-analyst |
| Đích | `.repos/Portfolio/src/components/Header.module.css` |
| Chỉ dẫn | Nếu người dùng muốn giữ dòng chức danh ở header điện thoại: chọn một trong các cách (viên thuốc cao hơn, dòng chức danh xuống dòng hoặc chỉ hiện sau khi cuộn), rồi sửa `Header.module.css`, `docs/RESPONSIVE.md` và `docs/DESIGN.md` (mục Mobile Nav). |
| Xem lại khi | Người dùng xác nhận hoặc bác bỏ việc ẩn dòng chức danh dưới 480px. |

#### RISK-03

| Trường | Nội dung |
| --- | --- |
| QG | QG-05 |
| Tác động | Người hoặc agent đọc `docs/DESIGN.md` mục 9 sẽ dùng sai token viền: dòng "Border / outline: `--border-ink` (1.5px) for chips and secondary buttons" không đúng với CSS (chip dùng `--border-chip`, nút phụ dùng `1px solid var(--color-text)`, `--border-ink` chỉ còn ở `.marker` của timeline trong `Education.module.css`). `docs/RESPONSIVE.md` dòng 9 liệt kê năm media query, thiếu `max-width: 479px` của `Header.module.css`. |
| Nguồn | `docs/DESIGN.md` mục 9 "Quick Color Reference"; `grep border-ink src` chỉ khớp `Education.module.css`; `docs/RESPONSIVE.md` dòng 9–10; `Header.module.css` dòng 273. |
| Nguyên nhân | Tài liệu được viết lại cùng lượt thêm token nhưng các câu về token viền và danh sách media query không đối chiếu lại với CSS. |
| Phản biện | Cả hai nằm ngoài các kiểm liệt kê của QG-05 (mã màu, bảng ngũ hành, mục theme, tên hệ, token đã bỏ), nên QG vẫn đạt; vẫn là sai lệch tài liệu có căn cứ nên ghi lại, không bỏ. |
| Vai trò | frontend-developer, technical-writer |
| Đích | `.repos/Portfolio/docs/DESIGN.md`, `.repos/Portfolio/docs/RESPONSIVE.md` |
| Chỉ dẫn | Sửa dòng Border / outline theo CSS (`--border-chip` cho chip, nút phụ viền 1px `--color-text`, `--border-subtle` cho khối chứa, `--border-control` cho nút tròn, `--border-ink` cho marker timeline); thêm `max-width: 479px` vào danh sách media query. Gộp vào lượt sửa tài liệu tiếp theo, không cần lượt riêng. |
| Xem lại khi | Lần kế tiếp chỉnh `docs/DESIGN.md` hoặc `docs/RESPONSIVE.md`. |

### Blockers

#### BLOCK-01

| Trường | Nội dung |
| --- | --- |
| QG | QG-03 |
| Thiếu | Quyết định của chủ Plan/người dùng: giữ giá trị `--color-footer-bg` tối trong bảng REQ-03 (`#0E241D`) hay giữ quy tắc "nền tối có độ sáng HSL ≥ 10%" (REQ-03 và QG-03). |
| Nguồn | Plan T05 REQ-03 (hàng `--color-footer-bg`, cột tối `#0E241D`; ý "Nền (`--color-bg`, `--color-surface`, `--color-surface-raised`, `--color-footer-bg`) của theme tối có độ sáng HSL ≥ 10%") và `Logic bắt buộc` của QG-03. Tính: `#0E241D` có max = 0x24 = 36, min = 0x0E = 14, độ sáng = (36 + 14) / 2 / 255 = 9,80%; `#0F261F` có (38 + 15) / 2 / 255 = 10,39%. `src/styles/variables.css` hiện dùng `#0F261F`; Implementation Record T05 (`role_work`, `residual_risk`) và record `implement-20261017-002027-T05` (`plan-table-violates-own-numeric-rule`) đã ghi lệch này. |
| Nguyên nhân | Plan chốt một bảng giá trị và một quy tắc đo được mâu thuẫn nhau ở một ô; Implement chọn giá trị nhỏ nhất thỏa quy tắc chặt hơn (chênh một đơn vị mỗi kênh, không phân biệt được bằng mắt). Không thể kết luận PASS (giá trị khác bảng) hay FAIL (không có bản nào đúng cả hai) nếu chưa biết ràng buộc nào thắng. Ghi chú thêm: ở theme tối footer (`#0F261F`) gần trùng nền trang (`#10261F`) nên gần như hòa vào trang; đó là hệ quả của chính bảng Plan (`#0E241D` cũng gần như vậy), không do triển khai. |
| Owner | Người dùng (chủ quyết định), rồi layer Plan nếu chọn sửa Plan |
| Đích | `.agents/plan/portfolio-gaps_20261014-233844/05-plan-theme-fire-palette-20261014-233844.md` (REQ-03, QG-03); nếu chọn khôi phục `#0E241D`: `.repos/Portfolio/src/styles/variables.css`, `docs/DESIGN.md`, `DOCUMENTATION_COMPLETE.md` |
| Chỉ dẫn | Chọn một: (a) giữ `#0F261F`: sửa ô `--color-footer-bg` tối trong REQ-03 (và QG-03 nếu cần) của Plan thành `#0F261F`; không đổi source, QG-03 chuyển PASS. (b) nới ngưỡng thành ≥ 9,8% và khôi phục `#0E241D`: sửa Plan và giao Implement sửa `variables.css` cùng các bảng màu của hai tài liệu (khối tối trong `DOCUMENTATION_COMPLETE.md` hai ngôn ngữ và bảng token của `docs/DESIGN.md`). |
| Disposition | escalate |
| Điều kiện | Người dùng chọn (a) hoặc (b). Không cần kết quả build, test hay ảnh chụp để đóng QG này. |

### Tiếp theo

| Trường | Nội dung |
| --- | --- |
| Tiếp theo | Người dùng quyết định BLOCK-01 (chọn (a) hoặc (b)); chỉ khi chọn (b) mới cần Implement lại. RISK-01, RISK-02 chờ quyết định bố cục của người dùng; RISK-03 gộp vào lượt sửa tài liệu tiếp theo. Không có FIND cần `repair`. |

## Evaluations

### EVAL-01

| Trường | Nội dung |
| --- | --- |
| Vai trò | frontend-developer |
| Kết quả | FAIL |
| Lỗi | Mức thấp, không ảnh hưởng QG: dòng "Border / outline: `--border-ink` (1.5px) for chips and secondary buttons" trong `docs/DESIGN.md` mục 9 sai so với CSS. Các quyết định ngoài chữ Plan (footer-bg, ẩn dòng phụ dưới 480px, viết lại cả `docs/DESIGN.md`) đã được nêu rõ trong `role_work` để chờ xác nhận, là cách xử lý đúng; bản thân mâu thuẫn footer-bg thuộc Plan (`plan-table-violates-own-numeric-rule`, đã xử lý ở record `implement-20261017-121848-T05`). |
| Nguyên nhân | execution (`doc-prose-claim-contradicts-source`): vai trò viết lại tài liệu nhưng không đối chiếu câu mô tả token viền với CSS. |
| Cải tiến | Chờ người dùng (mode_self): thêm điều kiện đối chiếu lời mô tả với CSS vào "Hoàn tất khi" của `frontend-developer` và `technical-writer` (xem FIX-04 của record Review). |
| Bằng chứng | `docs/DESIGN.md` mục 9; `grep border-ink src` (chỉ `Education.module.css`); Implementation Record T05 `role_work`. |

### EVAL-02

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-reviewer |
| Kết quả | FAIL |
| Lỗi | Kết luận QG-01 và QG-02 đúng, nhưng dòng bằng chứng dựa vào "đầu dò `PerformanceObserver`" ghi first-paint, "Đo thật: sau bấm `data-theme` dark ... lớp `theme-switching` gỡ sau 300ms ... giả lập hệ điều hành" chạy trong Chrome. Plan T05 bước 6 ghi "bằng lập luận trên diff"; router xếp chạy trình duyệt để nghiệm thu và script kiểm chứng mới ngoài vòng đời task (ngoại lệ chỉ cho chụp và đo layout). Review lập luận lại trên source và nhận cùng kết quả. |
| Nguyên nhân | execution (`verification-evidence-from-scripts-and-runs`): quy tắc rõ, vai trò vẫn dùng kết quả chạy làm dòng bằng chứng. |
| Cải tiến | Chờ người dùng (mode_self): FIX-03 của record Review (cột "Hoàn tất khi" của ba vai trò kiểm chứng). |
| Bằng chứng | `quality_gate_evidence` QG-01, QG-02 của Implementation Record T05; Plan T05 `Làm như thế nào` bước 6; router `#kiểm-chứng-bằng-lập-luận`. |

### EVAL-03

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-analyst |
| Kết quả | FAIL |
| Lỗi | QG-03 và QG-05 dựa chính vào "script đối chiếu" (17 token × 2 theme, 62 màu thuộc nhóm cấm, 28 và 15 dòng bảng token của hai tài liệu) thay vì lập luận đọc từng giá trị. Ngoài ra QG-03 ghi PASS "với độ lệch footer-bg" trong khi Plan đòi giá trị đúng bảng; lệch này là xung đột của Plan nên phải là BLOCK `escalate`, không phải PASS có điều kiện. |
| Nguyên nhân | execution (`verification-evidence-from-scripts-and-runs`) cho phần script; phần kết luận QG-03 liên quan `plan-table-violates-own-numeric-rule` (input, đã có record và đã xử lý). |
| Cải tiến | Chờ người dùng (mode_self): FIX-03 của record Review. |
| Bằng chứng | `quality_gate_evidence` QG-03, QG-05 của Implementation Record T05; Review BLOCK-01. |

### EVAL-04

| Trường | Nội dung |
| --- | --- |
| Vai trò | ux-designer |
| Kết quả | FAIL |
| Lỗi | QG-04 đúng ở phần ảnh và hộp bao, nhưng "mọi cặp chữ/nền đã dùng đạt tỉ số (script, 23 cặp mỗi theme)" dùng script làm bằng chứng. Vai trò cũng phân loại tràn hàng liên kết ở 768–1023px là có từ trước nhưng không nêu hệ quả với nút theme (nút nằm ngoài khung nhìn của bản `en` ở 768–900px), nên điểm này phải thành RISK (RISK-01). |
| Nguyên nhân | execution (`verification-evidence-from-scripts-and-runs`). |
| Cải tiến | Chờ người dùng (mode_self): FIX-03 của record Review. |
| Bằng chứng | `quality_gate_evidence` QG-04; `T05/20261017-000207/nav-measure-after.txt`. |
