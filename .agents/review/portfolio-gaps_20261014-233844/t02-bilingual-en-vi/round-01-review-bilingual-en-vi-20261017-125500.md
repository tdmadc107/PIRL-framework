---
schema: pirl-review/v1
content_language: vi
plan_file: ".agents/plan/portfolio-gaps_20261014-233844/02-plan-bilingual-en-vi-20261014-233844.md"
task_id: T02
review_round: 1
prior_review: null
review_roles: [code-analyst, code-reviewer, business-analyst, solution-architect, ux-designer]
repair_roles: []
business_verdict: PASS
verdict: PASS
status: completed
reviewed_at: "2026-10-17T12:55:00+07:00"
implementation_target: ".repos/Portfolio commit 745f1aa (a50912c..745f1aa, một commit gồm cả T01–T07) và Hub e079707; tự thực hiện (mode: self), không có phản biện độc lập"
---

# Review 01: T02 — Trang song ngữ Anh–Việt, nút đổi ngôn ngữ ở footer

Phạm vi snapshot: bảy task T01–T07 nằm chung commit `745f1aa`, không có diff riêng từng task. Kết luận lấy từ source cuối; chỗ T03–T07 sửa tiếp (font, theme, class, hiệu ứng) thuộc REQ của task đó. Ảnh của T02 chụp trước T04 (font còn là Arial dự phòng), nên phần bố cục ở trạng thái cuối còn được đối chiếu thêm với ảnh tĩnh của T07.

## Business

### Quality gates

| QG | Kết quả | Bằng chứng |
| --- | --- | --- |
| QG-01 | PASS | `src/i18n/LanguageProvider.tsx` `readStoredLanguage` theo bảng: không có khóa (`getItem` trả `null`) → `en`; `vi` → `vi`; `en` → `en`; `fr` hoặc chuỗi rỗng → `en` (so sánh chặt `=== 'en' \|\| === 'vi'`); `getItem` hay truy cập `window.localStorage` ném lỗi → `catch` trả `en`, trang vẫn render. Hàm là initializer của `useState`, chạy ở lần render đầu, nên với `vi` đã lưu lần render đầu đã là tiếng Việt; `useLayoutEffect` đặt `document.documentElement.lang` và `document.title` trước lần vẽ. `index.html` có `<html lang="en">` và `<title>Portfolio - Personal Profile</title>`.<br>Phản ví dụ đã xét: giá trị `VI` hoa hoặc `vi ` có khoảng trắng → `en`; REQ-04 chỉ nhận `en` và `vi` nên đúng. |
| QG-02 | PASS | `Footer.tsx`: `onClick={toggleLanguage}` → `setLanguage(language === 'en' ? 'vi' : 'en')` → `setLanguageState` trước, rồi `setItem` trong `try/catch`; ghi lỗi không chặn đổi ngôn ngữ và không có thông báo. Effect đặt `lang="vi"` và tiêu đề `Portfolio - Hồ Sơ Cá Nhân`; bấm lần nữa về `en`.<br>Chỉ `LanguageProvider` có `useState<Language>`; `Footer` suy `targetLanguage` từ context, nên mọi section đổi trong một lần render. Nút là `<button type="button">` không `href`, không điều hướng hay tải lại. Tên truy cập là chữ trong `<span lang={targetLanguage}>`: `Tiếng Việt` mang `lang="vi"`, `English` mang `lang="en"`. grep `Select country\|▾\|Vietnam (EN)` trong `src/` = 0.<br>Test trong diff đối chiếu FUT: sáu test của `src/App.test.tsx` và một của `Footer.test.tsx` truy về REQ-01..REQ-04, khẳng định hành vi quan sát được (`lang`, tiêu đề, khóa lưu, tên nút); chuỗi `vi` lấy từ `viStrings`, không chép cứng; mỗi hàng của QG-01/QG-02 có đúng một test, không trùng. |
| QG-03 | PASS | Lần từ `App.tsx` qua chín component: grep thuộc tính `aria-label`, `alt`, `title`, `placeholder` có giá trị chữ cứng và grep chữ Latin nằm trực tiếp trong JSX của `src/components/*.tsx` (trừ test) = 0; mọi chữ hiển thị lấy từ `t.*` hoặc `text(LocalizedText)`. Phần còn là emoji, ký hiệu (`↗`, `→`), `platform` (`LinkedIn`, `GitHub`) và `short`, đều thuộc danh sách giữ nguyên của REQ-05.<br>Kiểu: `LocalizedText = Record<Language, string>` trong `src/types/index.ts`; trường cần dịch của bảy file dữ liệu có kiểu này, họ tên, chức danh, công ty, dự án, chứng chỉ, tổ chức cấp, công nghệ là `string`. `src/i18n/vi.ts` khai báo `const vi: Strings` với `Strings` suy từ `en.ts` bằng `Widen`, nên thiếu hoặc thừa khóa là lỗi kiểu. Đọc `vi.ts` và `src/data/*.ts`: giá trị `vi` là tiếng Việt, trừ danh sách giữ nguyên (`FPT Software Education`, `Full Stack Java Web Developer`, `Salesforce:`, `Business Unit R17`, `Value Player` là tên riêng hoặc tên khóa học). |
| QG-04 | PASS | Ảnh đã xem: `T02/20261016-230458/vi-1280x800-t02b-bottom.png` (trạng thái lúc T02); trạng thái cuối `T07/20261017-010446/en-light-rm-1280x800-static-bottom.png`, `vi-dark-rm-360x800-static-bottom.png`, `fx-header-scrolled-light-1280.png`. Ở 1280 header có sáu mục trên một hàng, không chồng khối tên; ở 360 menu mở đủ sáu mục và nút đóng (`fx-menu-open-scrolled-dark-360.png`); hàng cuối footer có nút ngôn ngữ và icon `IN`, `GH` trong khung nhìn, không chồng nhau ở cả hai khổ; chữ tiếng Việt đủ dấu.<br>Không cuộn ngang ở 1280. Ở 360 `scrollWidth` 426 so với 360 (`T07/.../results.md`) do `span.orbit` rộng hơn khung; `T01/20261016-224201/results.md` (baseline `a50912c`, `360x800-before`) cho cùng số đo 426/360, nên có từ trước diff và nằm trong GAP-07 theo [kiểm chứng layout](../../../instructions/layered-task-execution.instructions.md#kiểm-chứng-layout-bằng-mock); không tính là FAIL của T02. |
| QG-05 | PASS | `DOCUMENTATION_COMPLETE.md` (hai ngôn ngữ): cây thư mục và bảng "Folder Purposes" có `src/i18n/` với đủ bảy file đúng như thư mục thật; mục Song ngữ nêu `LocalizedText`, khóa `portfolio_language`, mặc định `en`, ví dụ `text()` khớp `useLanguage`. `src/data/README.md` có mục `LocalizedText` và ví dụ `en`/`vi` khớp kiểu. `.agents/llm-docs/repos/Portfolio.md`: mục Kiến trúc và "Kiểm chứng layout bằng mock" nêu `en`/`vi` và cách đặt `portfolio_language`; không còn GAP-02, GAP-03; `index.html` đã dùng font của T04 nên không có GAP-05. |

### Findings

Không có FIND.

### Risks

#### RISK-01

| Trường | Nội dung |
| --- | --- |
| QG | QG-03 |
| Tác động | Người xem bản `vi` đọc `src/data/education.ts` mục đầu: "GPA: 2.98/4.0 - Tốt nghiệp với kết quả học tập tốt". Bản `en` ghi `Good Standing`, một trạng thái học vụ, không phải xếp loại. Cụm "kết quả học tập tốt" có thể bị hiểu là xếp loại cao hơn mức GPA 2.98/4.0 (giả định: thang 4.0 thông dụng ở Việt Nam xếp mức này là loại Khá). |
| Nguồn | `.repos/Portfolio/src/data/education.ts` (`description.vi`); Implementation Record T02 (`residual_risk`: bản dịch chưa có người đọc tiếng Việt khác rà). |
| Nguyên nhân | Bản `vi` do người điều phối Implement viết, nghĩa gốc của `Good Standing` mơ hồ, không có người rà thứ hai. |
| Phản biện | QG-03 chỉ đòi bản `vi` là tiếng Việt, không chép tiếng Anh, giữ nghĩa; câu đang dùng vẫn là tiếng Việt đúng ngữ pháp và mơ hồ như bản gốc, nên QG đạt. Rủi ro nằm ở độ chính xác thông tin hồ sơ, không phải ở hành vi trang. |
| Vai trò | business-analyst, frontend-developer |
| Đích | `.repos/Portfolio/src/data/education.ts` |
| Chỉ dẫn | Chủ hồ sơ chọn cách diễn đạt đúng với bảng điểm thật (ví dụ chỉ ghi GPA, hoặc ghi xếp loại thật); khi được giao thì sửa `description.vi` và để `description.en` khớp. |
| Xem lại khi | Trước khi đưa trang `vi` lên môi trường công khai, hoặc khi người dùng cung cấp xếp loại tốt nghiệp. |

### Blockers

Không có BLOCK.

### Tiếp theo

| Trường | Nội dung |
| --- | --- |
| Tiếp theo | Không có việc sửa bắt buộc. RISK-01 chờ chủ hồ sơ quyết định cách diễn đạt; chỉ đổi khi người dùng giao. |

## Evaluations

### EVAL-01

| Trường | Nội dung |
| --- | --- |
| Vai trò | frontend-developer |
| Kết quả | PASS |
| Lỗi | Không có lỗi đầu ra. Lỗi framework do chính lượt ghi (`layout-baseline-method-undefined`) đã được xử lý ở record `implement-20261017-121847-T02`; không phát hiện lỗi mới. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | Implementation Record T02, record `implement-20261016-231214-T02` và record sửa `implement-20261017-121847-T02`; `src/i18n/*`, `src/data/*.ts`, chín component. |

### EVAL-02

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-reviewer |
| Kết quả | PASS |
| Lỗi | Không có. QG-01, QG-02 đứng vững trước source; kết luận về test theo FUT khớp: test truy về REQ-01..REQ-04, không khóa chi tiết cài đặt. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `quality_gate_evidence` QG-01, QG-02; `src/App.test.tsx`, `src/components/Footer.test.tsx`, `LanguageProvider.tsx`. |

### EVAL-03

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-analyst |
| Kết quả | PASS |
| Lỗi | Không có. QG-03 và QG-05 đứng vững; việc so dòng chữ `vi` với `en` dùng dữ liệu của lần chụp layout, thuộc kiểm chứng layout cho phép. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `quality_gate_evidence` QG-03, QG-05; `src/i18n/en.ts`, `vi.ts`, `DOCUMENTATION_COMPLETE.md`. |

### EVAL-04

| Trường | Nội dung |
| --- | --- |
| Vai trò | ux-designer |
| Kết quả | PASS |
| Lỗi | Không có. QG-04 đứng vững; phân biệt đúng lỗi cuộn ngang 360px có từ trước (GAP-07) với lỗi do diff gây ra. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `layout_verification` của Implementation Record T02; ảnh `T02/20261016-230458/*`, `T07/20261017-010446/*` đã xem. |
