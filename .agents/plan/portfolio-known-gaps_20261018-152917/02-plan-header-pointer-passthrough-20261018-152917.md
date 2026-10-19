---
schema: pirl-plan/v1
content_language: vi
plan_set: portfolio-known-gaps_20261018-152917
task_id: T02
title: "Vùng trong suốt của header không chặn nhấn vào nội dung (GAP-09)"
layer: implement
status: implemented
depends_on: []
created_at: "2026-10-18T15:29:17+07:00"
target_repo: ".repos/Portfolio"
source_request: "Lập Plan cho GAP-09 (người dùng 2026-10-18: \"đồng thời tiến hành tạo luôn plan cho các GAP khác\")"
planning_roles: [business-analyst, code-analyst, solution-architect, ux-designer]
implementation_roles: [frontend-developer]
verification_roles: [code-analyst, code-reviewer]
---

# T02: Vùng trong suốt của header không chặn nhấn vào nội dung (GAP-09)

## Cần làm gì

- REQ-01 | Nguồn: agent quyết. Căn cứ: GAP-09 trong `.agents/llm-docs/repos/Portfolio.md`; `.header` (`Header.module.css:2-13`) là `position: fixed`, `left: 0`, `right: 0`, `padding: var(--nav-top-offset) var(--outer-gutter)`, không có nền và không đặt `pointer-events`; `Header.tsx:65-66` cho thấy `.header` chỉ có một con là `.nav`. Người dùng giao lập Plan và chưa chọn cách xử lý; cách dưới đây chỉ sửa lỗi, không đổi điều người xem thấy | Yêu cầu: Ở mọi khổ, mọi điểm thuộc hộp `.header` nằm ngoài `.nav` (dải 24px trên và dưới viên thuốc, hai lề bên cạnh viên thuốc) cho nhấn, chạm và rê chuột đi xuyên tới nội dung bên dưới.
- REQ-02 | Nguồn: agent quyết. Căn cứ: viên thuốc là bề mặt đặc nhìn thấy | Yêu cầu: Mọi điểm trong `.nav` vẫn do header nhận: logo, hàng liên kết ngang, nút đổi sáng/tối, nút menu và khoảng trống giữa chúng. Các giá trị `pointer-events` tường minh đang có giữ nguyên: `.nav::before` (`none`), `.navLinks` trong khối media của overlay (`none`), `.navLinksOpen` trong cùng khối (`auto`), `.subtitle` trong khối `max-width: 479px` (`none`). Định danh theo selector và khối media, vì T01 dời khối overlay nên số dòng đổi.
- REQ-03 | Nguồn: agent quyết. Căn cứ: overlay menu là phần tử cố định, đục, con DOM của `.nav` (`Header.tsx:73-91`) | Yêu cầu: Ở mọi khổ mà overlay menu được dùng: khi mở, overlay nhận con trỏ trên toàn khung nhìn và chặn nội dung bên dưới, nút đóng nhận nhấn; khi đóng, overlay không chặn con trỏ.
- REQ-04 | Nguồn: agent quyết | Yêu cầu: Không đổi điều người xem thấy: chỉ thêm `pointer-events: none` trên `.header` và `pointer-events: auto` trên `.nav`, ở khai báo gốc ngoài mọi media query; không đổi nền, bóng, kích thước, vị trí, `z-index`, thứ tự Tab hay focus.
- REQ-05 | Nguồn: agent quyết. Căn cứ: `docs/RESPONSIVE.md` ghi mỗi quy tắc kèm luật CSS nguồn; quy tắc của `Portfolio.md` ("Sửa xong thì xóa mục") | Yêu cầu:
  - `docs/RESPONSIVE.md`, mục Header: thêm một bullet mới mô tả vùng nhận con trỏ của header kèm luật CSS nguồn.
  - `docs/DESIGN.md`, mục Navigation: thêm một câu tương ứng.
  - `.agents/llm-docs/repos/Portfolio.md`: xóa dòng GAP-09.
  - Không sửa bullet hay câu do T01 sở hữu (ngưỡng hamburger, kích thước viên thuốc).
- Phạm vi: REQ và QG viết theo class và trạng thái (đóng, mở), không theo ngưỡng 768px hay 1024px, nên đúng cả trước và sau T01.
- Đường dẫn được phép sửa: `.repos/Portfolio`: `src/components/Header.module.css` (khai báo gốc `.header` và `.nav`), `docs/RESPONSIVE.md` và `docs/DESIGN.md` (chỉ câu thêm mới ở REQ-05); Hub: `.agents/llm-docs/repos/Portfolio.md` (dòng GAP-09). Không giao test: jsdom không có hit-test, `pointer-events` không kiểm được bằng test theo FUT.
- Kết quả riêng của task: dải trong suốt quanh viên thuốc không còn chặn nhấn vào nội dung; viên thuốc, overlay menu và nút đóng vẫn nhận nhấn; giao diện không đổi; tài liệu khớp.

## Làm như thế nào

Không phụ thuộc task khác. Source nền là working tree hiện tại của `.repos/Portfolio`, cộng đầu ra của T01 nếu T01 đã triển khai trước.

1. ROLE-01 (`frontend-developer`) thêm `pointer-events: none` vào `.header` và `pointer-events: auto` vào `.nav` (khai báo gốc). Cập nhật tài liệu theo REQ-05.
2. ROLE-02 (`code-analyst`) kết luận QG-01 và QG-03.
3. ROLE-03 (`code-reviewer`) kết luận QG-02 trên diff.

Bước tiếp theo: người dùng chỉ định file Plan này để Implement; Implement chỉ thực hiện task này trong phạm vi trên.

## Vai trò tham gia

- ROLE-01 | Loại: triển khai | Vai trò: frontend-developer | Phụ trách: CSS `.header` và `.nav`, tài liệu REQ-05, chụp layout theo router | Đầu vào: Plan này, working tree hiện tại | Hoàn tất khi: REQ-01..REQ-05 có thay đổi tương ứng; `layout_verification` có lần chụp đạt (đầu trang, đã cuộn, menu mở) kèm `pointer-events` tính toán của `.header`, `.nav`, `.subtitle`, `.navLinks` (đóng và mở) và nút đóng, so với trạng thái chưa có diff
- ROLE-02 | Loại: kiểm chứng | Vai trò: code-analyst | Phụ trách: QG-01, QG-03 | Đầu vào: diff của ROLE-01, `Header.tsx` | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-01 và QG-03 kèm bảng kịch bản, phản ví dụ, nguồn
- ROLE-03 | Loại: kiểm chứng | Vai trò: code-reviewer | Phụ trách: QG-02 | Đầu vào: diff của ROLE-01 | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-02 kèm đường đã lần, phản ví dụ, nguồn
- Lập Plan | Vai trò: business-analyst, code-analyst, solution-architect, ux-designer | Cách thực hiện: mỗi vai trò một agent riêng, chạy song song, không đọc bản nháp của nhau hay của người điều phối; người điều phối hợp nhất và viết Plan. Agent `code-analyst` đã dựng một trang mô phỏng trong thư mục tạm và chạy trình duyệt để đo; số đo đó không được dùng làm căn cứ trong Plan này

## Tiêu chí chất lượng bắt buộc

- QG-01 | Yêu cầu: REQ-01, REQ-02, REQ-03 | Logic bắt buộc: Bảng kịch bản "điểm trỏ → phần tử nhận", lần theo cây DOM `Header.tsx:65-113` và tính kế thừa của `pointer-events` (theo cây DOM, không theo khối chứa):
  - Dải trên, dải dưới, hai lề của `.header` ngoài `.nav` → `.header` có `none` nên điểm đi xuyên tới nội dung bên dưới.
  - Trong `.nav` (logo, liên kết hàng ngang, nút theme, nút menu, khoảng trống) → `.nav` có `auto`, các con không đặt giá trị khác thì kế thừa `auto`, nên header nhận.
  - Overlay đóng → `none` tường minh, đi xuyên. Overlay mở → `auto` tường minh, phủ khung nhìn, nhận. Nút đóng (con DOM của `.nav`, `z-index: 91`) → kế thừa `auto`, nhận.
  - Chức danh dưới 480px → `none` tường minh, đi xuyên. `.nav::before` → `none`.
  - Phản ví dụ phải xét: `.header` có `none` mà `.nav` thiếu `auto` thì mọi con mất con trỏ; overlay đóng mất `none` tường minh thì thành tấm chặn vô hình toàn màn hình.
- QG-02 | Yêu cầu: REQ-02, REQ-04 | Logic bắt buộc: Diff CSS chỉ thêm `pointer-events: none` ở `.header` và `pointer-events: auto` ở `.nav`, đều ở khai báo gốc; không quy tắc nào của con `.nav` mất giá trị tường minh đang có (`.nav::before`, `.navLinks` và `.navLinksOpen` trong khối media của overlay, `.subtitle` trong khối `max-width: 479px`); không đổi thuộc tính hiển thị, `z-index`, `Header.tsx` hay chuỗi giao diện.
- QG-03 | Yêu cầu: REQ-05 | Logic bắt buộc: Câu mới ở `docs/RESPONSIVE.md` và `docs/DESIGN.md` mô tả đúng CSS sau diff (vùng nào nhận, vùng nào đi xuyên, overlay và nút đóng); mọi khẳng định trong câu khớp source; dòng GAP-09 đã xóa; các câu về ngưỡng hamburger và kích thước viên thuốc không bị đổi bởi task này.

## Implementation Record
- status: implemented
- updated_at: "2026-10-18T20:45:00+07:00"
- changed_paths: [".repos/Portfolio: src/components/Header.module.css (thêm `pointer-events: none` vào khai báo gốc `.header`, dòng 8; thêm `pointer-events: auto` vào khai báo gốc `.nav`, dòng 56)", "docs/RESPONSIVE.md (một bullet mới ở dòng 34, cuối mục Header)", "docs/DESIGN.md (một bullet 'Pointer:' ở dòng 215, cuối danh sách Floating Nav Pill)", "Hub: .agents/llm-docs/repos/Portfolio.md (xóa dòng GAP-09)", "Hub: file Plan này (ghi sổ)"]
- role_work: frontend-developer=xong/hai dòng CSS ở khai báo gốc; bullet RESPONSIVE.md và câu DESIGN.md nêu vùng nhận con trỏ kèm luật CSS nguồn; xóa dòng GAP-09; diff riêng của task so với bản sao nền cho đúng 4 dòng thêm ở repo và 1 dòng xóa ở Hub, không hunk lạ; quét `docs/`, `DOCUMENTATION_COMPLETE.md` (cả từ khóa tiếng Việt), `AGENTS.md` của repo, `*.test.tsx` và `.agents/llm-docs` tìm câu còn mô tả vùng nhận con trỏ của header: không có câu cần đổi; không giao test (Plan nêu rõ); code-analyst=PASS QG-01, QG-03; code-reviewer=PASS QG-02
- execution_mode: agent riêng theo vai trò; mỗi vai trò chạy trong một sub-agent riêng. Hai vai trò kiểm chứng nhận diff riêng của task (đã tách khỏi thay đổi chưa commit của T01 và các lượt trước) và tuyên bố của `frontend-developer` như điều cần kiểm; không có bản nháp kết luận của người điều phối; Implementation Record chưa tồn tại khi chúng chạy; cả hai được dặn không đọc `.tmp/` và không chạy ứng dụng. `code-analyst` tự nêu có đọc `git diff HEAD` của Portfolio để tách T01 khỏi T02; `code-reviewer` đọc `git log -S`. Vai trò kiểm chứng không dùng ảnh hay số đo layout. Người phản biện ngoài đội vai trò (công cụ `advisor` của host, chỉ thấy transcript của chính agent gọi nó, không thấy bản nháp hay kết luận của vai trò khác) được hỏi: `frontend-developer` 2 lần, `code-analyst` 2 lần, `code-reviewer` 0 lần (đếm từ transcript của phiên bởi `process-auditor`)
- checkpoint_evidence: N/A
- quality_gate_results: QG-01=PASS; QG-02=PASS; QG-03=PASS
- quality_gate_evidence: QG-01 -> code-analyst: trước diff không nơi nào đặt `pointer-events` cho `.header` hay `.nav`, nên mọi phần tử trong cây `.nav` có giá trị tính toán `auto`; sau diff `.nav` khai báo `auto` tường minh (`Header.module.css:56`, ngoài mọi media query; ba khối media của `.nav` `:214-220`, `:302-307`, `:309-314` và `.headerScrolled .nav` `:18-21` không đặt `pointer-events`), nên giá trị của mọi phần tử trong cây `.nav` không đổi; chỉ `.header` (`:8`) đổi sang `none`. Bảng 17 kịch bản: dải trên, dải dưới và hai lề (`.header`=none) đi xuyên; khoảng trống trong viên thuốc, logo, `.subtitle` từ 480px, liên kết ngang từ 1024px, nút theme, nút menu kế thừa `auto`; `.subtitle` dưới 480px `none` tường minh (`:293`); overlay đóng `none` (`:239`) và mở `auto` (`:247`) cùng khối `@media (max-width: 1023px)` `:226-280` với `position: fixed; inset: 0` (`:232-233`), `.navLinksOpen` đứng sau `.navLinks` cùng độ đặc hiệu nên thắng; nút đóng là anh em của `ul` (`Header.tsx:73-91`), kế thừa `auto` từ `.nav`, z-index 91 (`:272`); từ 1024px có `isMenuOpen=true` không tạo tấm chặn vì `.navLinksOpen` chỉ có trong khối 1023px và `.mobileCloseButton` là `display: none`; canvas `EmberBackground` `none` z-index 0 dưới `.container` z-index 1; `html`/`body`/`#root` không đặt `pointer-events`. Phản ví dụ đã xét: `.nav` thiếu `auto` (bác), overlay đóng mất `none` (bác), nút đóng kế thừa `none` từ `.navLinks` (bác vì là anh em), con nhô ra dải (chỉ `.subtitle`, đã `none`), góc bo viên thuốc (hit-test theo bo góc là hành vi trình duyệt, ngoài nguồn bằng chứng được phép, REQ-02 định nghĩa viên thuốc là `.nav`). QG-02 -> code-reviewer: diff đúng hai hunk CSS một dòng mỗi hunk; mã băm blob của ba file ở phía sau khớp `index` của patch; bản đồ mọi `pointer-events` trong `src/` là sáu chỗ ở `Header.module.css` cộng `EmberBackground.module.css:8`, không giá trị tường minh nào của con `.nav` mất; không selector thẻ `header` hay `nav`, không `:global`; `Header.tsx` và `src/i18n` không đổi; không `onMouse*`/`onPointer*` trên `<header>`, không `.header:hover`; `Header.test.tsx:28,36` dùng `fireEvent.click` không hit-test; `git log -S"pointer-events"` cho thấy `.header` và `.nav` chưa từng có giá trị chủ ý. QG-03 -> code-analyst: đối chiếu từng mệnh đề của bullet `RESPONSIVE.md:34` và câu `DESIGN.md:215` với `Header.module.css`, `Header.tsx`, `variables.css:101,104` (24px) và `:58` (`--container-max`); khoảng dư mỗi bên viên thuốc khi vw > 1328px là (vw − 48 − 1280) / 2 (1440px: 24 + 56 = 80px), câu tài liệu không nêu số nên đúng; dải dưới đúng 24px vì `.nav` là con duy nhất của `.header`; dòng GAP-09 xóa đúng một dòng, GAP-06, GAP-07, GAP-10 nguyên vẹn; diff chỉ có dòng thêm nên không đổi câu về ngưỡng hamburger hay kích thước viên thuốc
- layout_verification: thư mục `.tmp/layout-snapshots/portfolio-known-gaps_20261018-152917/T02/20261018-181000/`; nền là bản sao nguyên vẹn working tree trước khi sửa (HEAD `a49bfe1` cộng thay đổi chưa commit ở `Header.module.css`, `docs/RESPONSIVE.md`, `docs/DESIGN.md`, `DOCUMENTATION_COMPLETE.md`, gồm đầu ra T01), `diff -rq` bằng working tree trước khi sửa, hai server Vite riêng cho nền và sau diff, tải `Header.module.css` từ từng server để chắc nền không lẫn diff (nền 4 khai báo `pointer-events`, sau diff 6); `en`/`vi`; `light`/`dark`; khổ 360, 480, 767, 768, 900, 1023, 1024, 1280 (cao 800); trạng thái đầu trang, đã cuộn (scrollY 700), menu mở và mở rồi đóng (đầu trang và đã cuộn, chỉ dưới 1024px); ảnh tĩnh với `prefers-reduced-motion: reduce`; 320 ảnh; 160 ô so nền với sau diff: hộp bao, `position`, `z-index`, `display`, `opacity`, `visibility` của `.header`, `.nav`, `.nav::before`, logo, tiêu đề, `.subtitle`, `.navLinks`, liên kết đầu, nút theme, nút menu, nút đóng và `scrollWidth`/`clientWidth` bằng nhau 160/160; `pointer-events` tính toán khác ở 160/160 ô, chỉ ở `.header` (`auto` thành `none`), mọi giá trị khác khớp giá trị suy ra từ CSS; ảnh trùng từng byte 130/160, 30 ảnh khác ở vùng ảnh chân dung hoặc khung hiệu ứng vào, chụp lại cùng quy trình cho thấy cách chụp không ổn định từng byte kể cả khi không có diff (9/34 cặp khác), nên căn cứ 'giao diện không đổi' là số đo; không viết bài thử nhấn. Không đạt có từ trước, không do diff: cuộn ngang 426/360, 486/480 (GAP-07) và 1056/1024 ở `en` và `vi` bằng nền; 767, 768, 900, 1023, 1280 không tràn
- repair_closure_evidence: N/A
- root_cause_revalidation: N/A
- review_item_disposition: N/A
- plan_amendments: N/A
- role_challenge_results: frontend-developer=PASS/xét `.header` none mà `.nav` thiếu auto, overlay đóng mất none, nút đóng, chức danh dưới 480px, `.nav::before`, mở lại menu sau khi cuộn; không còn nghi vấn mở; code-analyst=PASS/xem quality_gate_evidence QG-01 và QG-03; code-reviewer=PASS/xem quality_gate_evidence QG-02
- residual_risk: (1) Đính chính (người điều phối, 2026-10-18, sau lượt, khi người dùng hỏi về các mục còn mở): ghi nhận ban đầu ở mục này rằng `docs/DESIGN.md` dòng 214 ('Text links show a 2px flame underline on hover, at once') lệch source là SAI. Các thẻ `<a>` điều hướng ở `Header.tsx:76` không có class nên khớp luật toàn cục `a:not([class]):hover` ở `src/styles/global.css:69-75` (nền `--gradient-flame`, cao 2px, đặt ở đáy), nên câu tài liệu đúng và không có việc cần làm ở dòng 214. Vai trò triển khai chỉ đọc `Header.module.css` và bỏ sót luật toàn cục; người điều phối chép lại mà không đối chiếu với source. (2) Cuộn ngang 1056/1024 ở 1024px có từ trước, chưa có trong dòng GAP-07; Plan T04 cùng gói sở hữu và xóa GAP-07. (3) Vùng nhận con trỏ theo bo góc viên thuốc là hành vi trình duyệt, không có bằng chứng được phép; tài liệu viết 'the pill' nên không mâu thuẫn. (4) Bullet `RESPONSIVE.md:34` nêu nút menu kế thừa `auto` mà không ghi 'dưới 1024px' dù nút `display: none` từ 1024px; câu vẫn đúng với phần tử khi nó tồn tại
- review_handoff: file Plan này; thay đổi chưa commit trong `.repos/Portfolio` (nhánh `develop`, HEAD `a49bfe1`) ở các dòng nêu trong changed_paths, nằm chung working tree với thay đổi chưa commit của T01 cùng gói và của các lượt trước. Căn cứ giao việc: người dùng yêu cầu triển khai các plan trong thư mục `.agents/plan/portfolio-known-gaps_20261018-152917` (2026-10-18)
- role_selection_source: plan
- effective_implementation_roles: frontend-developer
- Next allowed owner/layer: Review T02 khi người dùng yêu cầu
- Authorization condition: Review chỉ chạy khi người dùng yêu cầu
1. Review T02 cho `.agents/plan/portfolio-known-gaps_20261018-152917/02-plan-header-pointer-passthrough-20261018-152917.md`: đối chiếu hai dòng `pointer-events` ở `.repos/Portfolio/src/components/Header.module.css`, bullet `docs/RESPONSIVE.md:34`, câu `docs/DESIGN.md:215` và ảnh trong `.tmp/layout-snapshots/portfolio-known-gaps_20261018-152917/T02/20261018-181000/`
