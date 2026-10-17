---
schema: pirl-review/v1
content_language: vi
plan_file: ".agents/plan/portfolio-gaps_20261014-233844/01-plan-data-single-source-20261014-233844.md"
task_id: T01
review_round: 1
prior_review: null
review_roles: [code-analyst, code-reviewer, business-analyst, solution-architect, ux-designer]
repair_roles: []
business_verdict: PASS
verdict: PASS
status: completed
reviewed_at: "2026-10-17T12:53:00+07:00"
implementation_target: ".repos/Portfolio commit 745f1aa (a50912c..745f1aa, một commit gồm cả T01–T07) và Hub e079707; tự thực hiện (mode: self), không có phản biện độc lập"
---

# Review 01: T01 — Nội dung hồ sơ chỉ khai báo một lần trong src/data/

Phạm vi snapshot: bảy task T01–T07 của gói nằm chung một commit `745f1aa` của `.repos/Portfolio`, không có diff riêng từng task. Mọi kết luận lấy từ source cuối. Phần nội dung (chữ, `href`, thứ tự mục) so với `a50912c` bằng `git show a50912c:<file>`. Markup và `className` của T01 không còn so nguyên văn được vì T02, T06, T07 sửa cùng file (nút ngôn ngữ, số eyebrow, thuộc tính `data-*`); khác biệt do REQ của task sau sở hữu không tính là lỗi của T01.

## Business

### Quality gates

| QG | Kết quả | Bằng chứng |
| --- | --- | --- |
| QG-01 | PASS | Đối chiếu literal ở `a50912c` (`Personal.tsx`, `Skills.tsx`, `Education.tsx`, `Experience.tsx`, `Certifications.tsx`, `Achievements.tsx`, `Footer.tsx`, `Header.tsx`) với trường `en` và trường `string` của `src/data/*.ts` tại HEAD: họ tên, chức danh, đoạn giới thiệu, hai thẻ highlight (tiêu đề, mô tả, bốn mục mỗi thẻ), bốn nhóm kỹ năng cùng thứ tự thẻ, hai mục học vấn, hai mục kinh nghiệm (mảng `technologies` cùng thứ tự), bốn chứng chỉ (URL trùng ký tự), hai thành tích, cột Contact/Connect và `short` của Footer đều trùng.<br>Phản ví dụ của QG: điện thoại hiển thị `+84 363 551 555`, `href` là `contactLinks.phone` = `tel:` + `phone.replace(/[^\d+]/g, '')` = `tel:+84363551555`; `Address` không có liên kết vì `Personal.tsx` chỉ gán `href` cho Phone và Email; `expiryDate`, `credentialId` còn nằm sau `&&`, `credentialUrl` còn render `View Certificate →`; "Front-end Web" và "Developer Tools" không có `subgroups` nên `Skills.tsx` render `group.tags` trực tiếp.<br>Ảnh `T01/20261016-224604/1280x800-after-top.png` đã xem: header, hero, bốn ô liên hệ khớp nội dung trên. |
| QG-02 | PASS | Lần từ `src/App.tsx`: grep chuỗi hồ sơ (`Dang Tien Dat`, `tiendat107`, `363 551`, `Da Nang`, `Java Developer`, `linkedin.com`, `github.com`, `FPT`, `Udacity`, `Oracle`, `Quang Binh`) trong `src/components/*.tsx` (trừ test) không còn khớp.<br>`personalInfo.fullName` do `Header.tsx`, `Personal.tsx`, `Footer.tsx` đọc; `personalInfo.email` và `contactLinks.email` do chi tiết Email, nút `Contact via email` của `Personal.tsx` và `Email support`, cột Contact của `Footer.tsx` đọc; `socialLinks` do CTA của `Personal.tsx`, cột Connect và icon của `Footer.tsx` đọc.<br>Mọi export của `src/data/index.ts` (`personalInfo`, `contactLinks`, `socialLinks`, `highlights`, `skillsData`, `educations`, `experiences`, `projects`, `certifications`, `achievements`) có consumer; `git ls-files` không còn `services.ts`, `portfolio.ts`; grep `Your Full Name\|example.com\|XYZ University\|Tech Startup XYZ` trong `src/**/*.ts*` = 0 (chuỗi mẫu `your.email@example.com` chỉ còn trong ví dụ của tài liệu). |
| QG-03 | PASS | `src/types/index.ts` khai báo mỗi kiểu miền một lần; grep `interface\|type` ở các file khác chỉ ra kiểu cục bộ của provider, context và test, không có kiểu trùng tên miền. Không còn `Service`, `year`, `duration`, `level`. Trường tùy chọn (`Project.link/github`, `Certification.expiryDate/credentialId/credentialUrl`, `SkillGroup.subgroups/tags`) chỉ dùng sau `&&`, `?.map` hoặc `? :`; trường bắt buộc có ở mọi mục của bảy file dữ liệu (đã đọc từng mảng). Import `@data`, `@types` trỏ tới symbol có thật; alias có trong `vite.config.ts`. |
| QG-04 | PASS | `src/data/README.md`: danh sách tám file, bảng export, trường từng kiểu, bảng "Component nào đọc dữ liệu nào" khớp `src/data/index.ts`, `src/types/index.ts` và import của component. `DOCUMENTATION_COMPLETE.md` (hai ngôn ngữ): bước 3, "Cấu Trúc Dự Án", "Hướng Dẫn Cá Nhân Hóa", "Quản Lý Dữ Liệu" chỉ tới đúng file `src/data/`; grep `TODO` = 0.<br>`.agents/llm-docs/repos/Portfolio.md`: mục Kiến trúc nêu component đọc nội dung từ `src/data/`; không còn GAP-01; câu cảnh báo trỏ GAP-06 và không nêu `src/data/README.md`; hai mục của GAP-06 ("7 Sections" thiếu `Projects`, `Skills`; "CSS Classes Pattern" nêu `.section`, `.content`, `.item`, `.button`) còn đúng trong `DOCUMENTATION_COMPLETE.md` (grep `^\.(section\|content\|item\|button)` trong `src/**/*.css` = 0). |

### Findings

Không có FIND.

### Risks

Không có RISK.

### Blockers

Không có BLOCK.

### Tiếp theo

| Trường | Nội dung |
| --- | --- |
| Tiếp theo | Không có việc sửa. T01 kết thúc tại report này; việc khác (ví dụ xử lý GAP-06, GAP-07) cần chỉ thị riêng của người dùng. |

## Evaluations

### EVAL-01

| Trường | Nội dung |
| --- | --- |
| Vai trò | frontend-developer |
| Kết quả | PASS |
| Lỗi | Không có lỗi đầu ra. Hai lỗi framework do chính lượt Implement ghi (`layout-baseline-method-undefined`, `layout-tooling-notes-missing`) đã được xử lý ở record `implement-20261017-121847-T01`; không phát hiện lỗi mới. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | Implementation Record T01 (`role_work`), record `implement-20261016-225658-T01` và record sửa `implement-20261017-121847-T01`; đối chiếu `git show a50912c:src/components/*.tsx` với `src/data/*.ts` tại HEAD. |

### EVAL-02

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-reviewer |
| Kết quả | PASS |
| Lỗi | Không có. QG-01 và QG-03 đứng vững trước source; bằng chứng là đọc nguồn và so DOM của kiểm chứng layout, không dựa vào kết quả test. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `quality_gate_evidence` QG-01, QG-03 trong Implementation Record; đối chiếu với kết luận Review ở trên (không bỏ sót FIND). |

### EVAL-03

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-analyst |
| Kết quả | PASS |
| Lỗi | Không có. QG-02 và QG-04 đứng vững; GAP-06 ghi đúng mục còn lệch. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `quality_gate_evidence` QG-02, QG-04; `.agents/llm-docs/repos/Portfolio.md` (GAP-06), `DOCUMENTATION_COMPLETE.md`. |
