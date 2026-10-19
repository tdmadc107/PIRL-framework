---
schema: pirl-plan/v1
content_language: vi
plan_set: portfolio-known-gaps_20261018-152917
task_id: T03
title: "Đồng bộ danh sách section và mục class của DOCUMENTATION_COMPLETE.md với source (GAP-06)"
layer: implement
status: implemented
depends_on: []
created_at: "2026-10-18T15:29:17+07:00"
target_repo: ".repos/Portfolio"
source_request: "Lập Plan cho GAP-06 (người dùng 2026-10-18: \"đồng thời tiến hành tạo luôn plan cho các GAP khác\")"
planning_roles: [business-analyst, code-analyst, solution-architect, ux-designer]
implementation_roles: [technical-writer]
verification_roles: [code-analyst]
---

# T03: Đồng bộ danh sách section và mục class của DOCUMENTATION_COMPLETE.md với source (GAP-06)

## Cần làm gì

- REQ-01 | Nguồn: agent quyết. Căn cứ: GAP-06; `docs/DESIGN.md:205` nêu bảy section có số eyebrow `01` Personal, `02` Skills, `03` Education, `04` Experience, `05` Projects, `06` Certifications, `07` Achievements; số eyebrow ở `Personal.tsx:31`, `Skills.tsx:20` và dòng 13 của `Education.tsx`, `Experience.tsx`, `Projects.tsx`, `Certifications.tsx`, `Achievements.tsx`; `Footer` là thẻ `<footer>` không có số. Hiện trạng: `DOCUMENTATION_COMPLETE.md:37-43` (bản Việt, "7 Sections Hoàn Chỉnh") và `:785-791` (bản Anh, "7 Complete Sections") liệt kê sáu mục gồm Footer, thiếu Skills và Projects | Yêu cầu: Hai danh sách liệt kê đủ bảy section theo thứ tự `01`–`07` của `DESIGN.md:205`, ở cả bản Việt và bản Anh; số ở tiêu đề bằng số mục; Footer không tính vào bảy, nếu giữ thì ghi tách khỏi danh sách đếm. Câu chữ cụ thể do vai trò triển khai chọn.
- REQ-02 | Nguồn: agent quyết. Căn cứ: GAP-06 và hướng xử lý của nó; mục "CSS Classes Pattern" chỉ có ở bản Việt (`DOCUMENTATION_COMPLETE.md:698-716`), bản Anh không có mục tương ứng; trong khối mã `:702-709`, `.section`, `.content`, `.item`, `.button` không có trong `src/components/*.module.css`, `.heading` có ở 5 file (Achievements, Certifications, Education, Experience, Projects), `.card` chỉ có ở `Education.module.css` | Yêu cầu: Viết lại mục "CSS Classes Pattern" của bản Việt để chỉ nêu tên class có thật và mô tả đúng phạm vi dùng; không trình bày `.heading` hay `.card` như class chung của mọi component. Không tạo mục tương ứng ở bản Anh.
- REQ-03 | Nguồn: agent quyết. Căn cứ: quy tắc của `Portfolio.md` ("Sửa xong thì xóa mục"); câu `.agents/llm-docs/repos/Portfolio.md:17-18` ("`DOCUMENTATION_COMPLETE.md` còn mục lệch source (xem GAP-06); xem mục Khoảng trống đã biết trước khi dựa vào nó") thành sai sau khi sửa | Yêu cầu: Bỏ vế về `DOCUMENTATION_COMPLETE.md` và "xem GAP-06" ở câu đó, giữ vế về `docs/UPDATE_SUMMARY.md`; xóa dòng GAP-06.
- Phạm vi: hai nhóm lệch của GAP-06. Không sửa đoạn khác của `DOCUMENTATION_COMPLETE.md`, nhất là `:254-255` và `:1002-1003` (thuộc T01). Không sửa `docs/UPDATE_SUMMARY.md`.
- Đường dẫn được phép sửa: `.repos/Portfolio/DOCUMENTATION_COMPLETE.md` (`:37-43`, `:698-716`, `:785-791`; T01 sửa cùng file, nên khi T01 đã chạy trước thì xác định các vùng này theo nội dung); Hub: `.agents/llm-docs/repos/Portfolio.md` (câu `:17-18`, dòng GAP-06). Không có test: task chỉ có tài liệu.
- Kết quả riêng của task: danh sách section ở hai ngôn ngữ và mục class ở bản Việt khớp source; tài liệu ngữ cảnh không còn cảnh báo về `DOCUMENTATION_COMPLETE.md`.

## Làm như thế nào

Không phụ thuộc task khác. Task không đổi phần người dùng nhìn thấy, nên không chụp layout.

1. ROLE-01 (`technical-writer`) sửa hai danh sách theo REQ-01 và mục class theo REQ-02, dò từng tên class trong `src/components/*.module.css` trước khi viết.
2. ROLE-01 sửa `Portfolio.md` theo REQ-03.
3. ROLE-02 (`code-analyst`) kết luận QG-01, QG-02, QG-03.

Bước tiếp theo: người dùng chỉ định file Plan này để Implement; Implement chỉ thực hiện task này trong phạm vi trên.

## Vai trò tham gia

- ROLE-01 | Loại: triển khai | Vai trò: technical-writer | Phụ trách: `DOCUMENTATION_COMPLETE.md` theo REQ-01, REQ-02; `Portfolio.md` theo REQ-03 | Đầu vào: Plan này, `src/App.tsx`, `src/components/*.tsx`, `src/components/*.module.css`, `docs/DESIGN.md` | Hoàn tất khi: REQ-01..REQ-03 có thay đổi tương ứng; mỗi tên section và tên class viết ra đã dò trong source
- ROLE-02 | Loại: kiểm chứng | Vai trò: code-analyst | Phụ trách: QG-01, QG-02, QG-03 | Đầu vào: diff của ROLE-01 | Hoàn tất khi: PASS/FAIL/BLOCKED cho từng QG kèm khẳng định đã đối chiếu, nguồn
- Lập Plan | Vai trò: business-analyst, code-analyst, solution-architect, ux-designer | Cách thực hiện: mỗi vai trò một agent riêng, chạy song song, không đọc bản nháp của nhau hay của người điều phối; người điều phối hợp nhất và viết Plan. Agent `code-analyst` đã dựng một trang mô phỏng trong thư mục tạm và chạy trình duyệt để đo; số đo đó không được dùng làm căn cứ trong Plan này

## Tiêu chí chất lượng bắt buộc

- QG-01 | Yêu cầu: REQ-01 | Logic bắt buộc: Mỗi mục trong hai danh sách (bản Việt và bản Anh) ứng với đúng một section có số eyebrow trong source; đủ bảy mục theo thứ tự `01`–`07`; Footer không nằm trong phần đếm; số ở tiêu đề bằng số mục.
- QG-02 | Yêu cầu: REQ-02 | Logic bắt buộc: Mỗi tên class nêu trong mục "CSS Classes Pattern" tồn tại trong ít nhất một `src/components/*.module.css` của component được nêu; `.section`, `.content`, `.item`, `.button` không còn xuất hiện như class có thật; mô tả phạm vi dùng của từng class khớp số file chứa nó; bản Anh không có mục mới.
- QG-03 | Yêu cầu: REQ-03 | Logic bắt buộc: Câu `Portfolio.md:17-18` không còn nhắc `DOCUMENTATION_COMPLETE.md` lệch source; dòng GAP-06 đã xóa; diff của `DOCUMENTATION_COMPLETE.md` chỉ nằm ở ba vùng của REQ-01, REQ-02; mọi khẳng định trong câu đã đổi, kể cả phần giữ nguyên, khớp source.

## Implementation Record
- status: implemented
- updated_at: "2026-10-18T21:02:00+07:00"
- changed_paths: [".repos/Portfolio: DOCUMENTATION_COMPLETE.md (danh sách bản Việt dòng 37-44; mục CSS Classes Pattern dòng 698-714; danh sách bản Anh dòng 783-790)", "Hub: .agents/llm-docs/repos/Portfolio.md (câu về `docs/UPDATE_SUMMARY.md` dòng 16-17 bỏ vế `DOCUMENTATION_COMPLETE.md` và 'xem GAP-06'; xóa dòng GAP-06)", "Hub: file Plan này (ghi sổ)"]
- role_work: technical-writer=xong/hai danh sách liệt kê đủ bảy section `01`-`07` kèm nhãn `Skills` và `Projects`, Footer bỏ khỏi cả hai danh sách; mục CSS Classes Pattern viết lại thành bảng ba dòng (`.eyebrow`/`.eyebrowNumber`/`.eyebrowBar` ở 7 file, `.sectionHeader`/`.heading` ở 5 file, `.card` ở 1 file là Education) kèm đoạn nêu `.name`, `.skillsSectionTitle` và sáu class thẻ riêng; dò tên class bằng cách bóc comment khỏi 10 file `src/components/*.module.css` rồi đếm tên trong selector; bỏ `.section`, `.content`, `.item`, `.button`; xóa bullet 'Type-safe imports' trong mục class (nằm trong khoảng dòng REQ-02 được sửa; `src/vite-env.d.ts` khai báo `*.module.css` là `{ [key: string]: string }`, không có plugin typed-CSS-modules, nên gõ sai tên class vẫn qua kiểm kiểu), giữ ba lợi ích còn lại; không tạo mục tương ứng ở bản Anh; câu `Portfolio.md` và dòng GAP-06 theo REQ-03, không khôi phục GAP-09; diff so với bản sao nền chỉ có năm hunk của task, không đụng dòng hamburger của T01; lần sửa 1/2 sau FAIL của code-analyst: câu dẫn dòng 701 'Một số tên lặp lại ở nhiều file (...)' đổi thành 'Bảng dưới nêu số file `src/components/*.module.css` chứa từng nhóm class:' và bỏ vế 'đặt tên class theo từng component'; code-analyst=PASS QG-01, QG-02 (FAIL lần đầu, PASS sau lần sửa 1/2), QG-03 (FAIL lần đầu, PASS sau lần sửa 1/2)
- execution_mode: agent riêng theo vai trò; mỗi vai trò chạy trong một sub-agent riêng; lần sửa gọi lại đúng agent triển khai và đúng agent kiểm chứng. `code-analyst` nhận diff riêng của task (đã tách khỏi thay đổi chưa commit của T01, T02 và lượt cũ) và tuyên bố của `technical-writer` như điều cần kiểm; không có bản nháp kết luận của người điều phối; Implementation Record chưa tồn tại khi nó chạy; được dặn không đọc `.tmp/`. Người phản biện ngoài đội vai trò (công cụ `advisor` của host, chỉ thấy transcript của chính agent gọi nó, không thấy bản nháp hay kết luận của vai trò khác) được hỏi: `technical-writer` 2 lần, `code-analyst` 1 lần (đếm từ transcript của phiên bởi `process-auditor`; `code-analyst` tự nêu trong báo cáo, `technical-writer` không nêu), nên kết luận của `code-analyst` không độc lập hoàn toàn khỏi phản biện thêm
- checkpoint_evidence: N/A
- quality_gate_results: QG-01=PASS; QG-02=PASS; QG-03=PASS
- quality_gate_evidence: QG-01 -> code-analyst: hai danh sách (`DOCUMENTATION_COMPLETE.md:37-44` và `:783-790`) khớp từng mục với số eyebrow trong source: `Personal.tsx:31` (01), `Skills.tsx:20` (02, render bên trong Personal ở `Personal.tsx:122`), `Education.tsx:13` (03), `Experience.tsx:13` (04), `Projects.tsx:13` (05), `Certifications.tsx:13` (06), `Achievements.tsx:13` (07), cùng thứ tự DOM `App.tsx:27-32` và `docs/DESIGN.md:205`; grep `eyebrow` trong `src/components/*.tsx` chỉ ra bảy file; Footer là thẻ `<footer>` (`Footer.tsx:29`) không có số và không còn trong hai danh sách; nhãn '(Timeline)' có `.timeline` ở `Education.tsx:20`, '(Grid Cards)' có `.certificationsGrid` `display: grid` ở `Certifications.module.css:39`. QG-02 -> code-analyst: lần đầu FAIL vì câu dẫn dòng 701 mô tả cả bảng là 'tên lặp lại ở nhiều file' trong khi `.card` chỉ ở một file (trigger: người đọc dùng bảng để biết class nào dùng chung; hậu quả: `.card` hiện ra như class chung, đúng cách đọc REQ-02 cấm); sau lần sửa 1/2 câu dẫn nói bảng nêu số file chứa từng nhóm class, đúng với cả ba dòng. Số file đã đếm từ selector: `.eyebrow`/`.eyebrowNumber`/`.eyebrowBar` ở Certifications, Achievements, Education, Experience, Personal, Projects, Skills; `.sectionHeader`/`.heading` ở Certifications, Achievements, Experience, Education, Projects; `.card` chỉ ở `Education.module.css:78` và `:90-91`, dùng ở `Education.tsx:24` cạnh `.marker` trong `.timelineItem`; `.name` của `<h1>` ở `Personal.tsx:35`, `.skillsSectionTitle` của `<h2>` ở `Skills.tsx:24`; sáu class thẻ riêng có trong TSX và CSS của đúng section, và `data-card` trong `src/components/*.tsx` ra đúng bảy phần tử; 'không có class nào ở cả mười file' đúng vì `EmberBackground.module.css` chỉ có `.canvas`; `.section`/`.content`/`.item`/`.button` không có trong CSS nào và không còn trong tài liệu; bản Anh không có mục mới. QG-03 -> code-analyst: `Portfolio.md:16-17` chỉ còn câu về `docs/UPDATE_SUMMARY.md` khớp `docs/UPDATE_SUMMARY.md:1`; bảng chỉ còn GAP-07 và GAP-10 (GAP-06 xóa đúng một dòng, GAP-09 đã xóa bởi T02 và không được khôi phục); diff `DOCUMENTATION_COMPLETE.md` chỉ ở ba vùng REQ-01/REQ-02, việc xóa bullet 'Type-safe imports' nằm trong khoảng dòng 698-716 mà Plan cho phép và đúng với `vite-env.d.ts:5-8`, `tsconfig.json`, `package.json`, `vite.config.ts:9`; hai hunk của T01 (dòng 255-256 và 1001-1002) ngoài diff; quét `*.md` của repo, `.agents/llm-docs/` và `.repos/manifest.yaml` không còn danh sách 'sáu section' hay class chung giả
- layout_verification: N/A (task chỉ sửa tài liệu, không đổi giao diện)
- repair_closure_evidence: N/A
- root_cause_revalidation: N/A
- review_item_disposition: N/A
- plan_amendments: N/A
- role_challenge_results: technical-writer=PASS/xét section có số eyebrow khác `DESIGN.md:205` (không có), `.heading` hoặc `.card` bị nói là chung (bảng ghi 5 và 1 file), Footer bị đếm (đã bỏ), bullet 'Type-safe imports' mâu thuẫn source (đã xóa), vế 'đặt tên class theo từng component' đọc thành 'mỗi component có bộ tên riêng' lệch với bảng (đã bỏ); câu dẫn dòng 701 sai ở lần giao đầu, sửa ở lần 1/2; code-analyst=PASS/xem quality_gate_evidence QG-01, QG-02, QG-03
- residual_risk: (1) Ngoài phạm vi, chưa sửa: `DOCUMENTATION_COMPLETE.md:695` và `:1441` gọi Footer là 'Footer section' và `Portfolio.md:24-27` gọi `Header` và `Footer` là 'section', trong khi '7 Sections' loại Footer; không vi phạm QG nào. (2) `DOCUMENTATION_COMPLETE.md:35` và `:781` ('TypeScript Type-Safe') cùng loại nghi vấn với bullet đã xóa nhưng nghĩa khác (kiểm kiểu nói chung) nên không đổi. (3) Câu dẫn dòng 701 viết 'từng nhóm class' và bảng không liệt kê mọi nhóm lặp lại (`.badge` ở 3 file, `.description` ở 4 file); câu không dùng từ 'mọi' nên đúng. (4) Emoji 🛠️ và 🚀 ở hai danh sách do vai trò triển khai chọn theo phong cách, không lấy từ source; nhãn 'Dự Án' và 'Projects' là rút gọn từ heading 'Dự án & Đường dẫn' và 'Projects & URLs'
- review_handoff: file Plan này; thay đổi chưa commit trong `.repos/Portfolio` (nhánh `develop`, HEAD `a49bfe1`) và Hub ở các dòng nêu trong changed_paths, nằm chung working tree với thay đổi chưa commit của T01, T02 và lượt cũ. Căn cứ giao việc: người dùng yêu cầu triển khai các plan trong thư mục `.agents/plan/portfolio-known-gaps_20261018-152917` (2026-10-18)
- role_selection_source: plan
- effective_implementation_roles: technical-writer
- Next allowed owner/layer: Review T03 khi người dùng yêu cầu
- Authorization condition: Review chỉ chạy khi người dùng yêu cầu
1. Review T03 cho `.agents/plan/portfolio-known-gaps_20261018-152917/03-plan-documentation-complete-sync-20261018-152917.md`: đối chiếu ba vùng của `.repos/Portfolio/DOCUMENTATION_COMPLETE.md` (dòng 37-44, 698-714, 783-790) và hai thay đổi ở `.agents/llm-docs/repos/Portfolio.md` với source `src/components/*`
