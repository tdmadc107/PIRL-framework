---
schema: pirl-plan/v1
content_language: vi
plan_set: portfolio-header-subtitle-mobile_20261017-142710
task_id: T01
title: "Hiện lại dòng chức danh trong header dưới 480px"
layer: implement
status: implemented
depends_on: []
created_at: "2026-10-17T14:28:00+07:00"
target_repo: ".repos/Portfolio"
source_request: "Hiện lại dòng chức danh 'Java Developer | Salesforce Developer' ở header điện thoại dưới 480px (RISK-02 của report Review vòng 1 của T05, gói portfolio-gaps) bằng cách khác với việc ẩn"
planning_roles: [business-analyst, code-analyst, ux-designer]
implementation_roles: [frontend-developer]
verification_roles: [code-reviewer, ux-designer, code-analyst]
---

# T01: Hiện lại dòng chức danh trong header dưới 480px

## Cần làm gì

- REQ-01 | Nguồn: người dùng chọn "Hiện lại bằng cách khác" cho RISK-02 của report `.agents/review/portfolio-gaps_20261014-233844/t05-theme-fire-palette/round-01-review-theme-fire-palette-20261017-125800.md`; mô tả lựa chọn người dùng đã thấy: "Lập Plan mới: viên thuốc cao hơn, dòng chức danh xuống dòng, hoặc chỉ hiện sau khi cuộn." Người dùng không chọn trong ba cách đó. Agent quyết cách hiện (vai trò `ux-designer`), căn cứ: (a) số đo ở 360px trong `.tmp/layout-snapshots/portfolio-gaps_20261014-233844/T06/20261017-003727/header-measure-phones.txt`: viên thuốc x 24–336 và y 24–88, logo x 48–161, nút theme x 200–248, nút menu x 264–312, nên cột còn lại cho logo là 200 - 8 - 48 = 144px; chức danh rộng khoảng 245px (logo ở 480px rộng 245px), không nằm vừa cạnh tên và hai nút; (b) đặt chức danh trong viên thuốc cần viên thuốc cao hơn và chức danh xuống hai dòng (dòng dài nhất "Salesforce Developer" ước tính khoảng 132px theo tỉ lệ ký tự của 245px, trong cột 144px, dư khoảng 12px), tức đổi `--nav-height-mobile`, `padding-top` của `.main` và `scroll-padding-top`; (c) ở khổ này còn dải trống 48px giữa đáy viên thuốc (y = 24 + 64 = 88) và đầu nội dung (`.main` `padding-top` = 64 + 24 + 48 = 136), đủ cho một dòng chú thích 13 × 1,4 = 18,2px cách đáy viên thuốc 8px | Yêu cầu: Dưới 480px, `personalInfo.title` hiện lại ngay dưới viên thuốc header, ngoài viên thuốc:
  - Căn trái với tên: mép trái chữ cách mép trái viên thuốc `--space-3` (bằng padding trái của viên thuốc ở khổ này) và nằm trong bề rộng viên thuốc (cách mép phải `--space-3`).
  - Cách đáy viên thuốc `--space-1` (8px). Cỡ chữ `--font-size-caption`, line-height `--line-height-label`, màu `--color-text-muted` (đã có ở `.subtitle`). Một dòng khi khổ từ 360px (chữ 245px so với chỗ 312 - 48 = 264px).
  - Hộp bao của viên thuốc, logo, nút theme, nút menu và vị trí đầu nội dung giữ nguyên so với trạng thái hiện tại; không đổi `--nav-height-mobile`, `padding-top` của `.main` (136px) hay `scroll-padding-top`.
- REQ-02 | Nguồn: agent suy ra từ source: `Header.tsx` thêm `subtitleHidden` khi `window.scrollY > 0`; `Header.module.css` có `.subtitleHidden { opacity: 0 }`, `.headerScrolled .title { transform: none }` trong khối dưới 480px, và overlay menu `.navLinks` là `position: fixed; z-index: 90` bên trong `.nav` (`isolation: isolate`) | Yêu cầu: Hành vi khi cuộn và khi tương tác dưới 480px:
  - Trang đã cuộn (`scrollY > 0`): chức danh mờ dần tới `opacity: 0` bằng chuyển tiếp hiện có (`--motion-base`), chỉ `opacity` đổi; tên vẫn ở giữa viên thuốc (`transform: none`).
  - Chức danh không nhận con trỏ (`pointer-events: none`), nên ở mọi trạng thái nó không chặn nhấn hoặc chạm vào nội dung bên dưới.
  - Menu hamburger mở: overlay vẫn phủ kín khung nhìn và che chức danh.
  - Chức danh vẫn là văn bản trong cây truy cập như ở khổ từ 480px (không `display: none`, `visibility: hidden` hay `aria-hidden`).
  - Màu chỉ dùng token; chuyển động chỉ `opacity` và `transform` (`docs/DESIGN.md` mục 7).
- REQ-03 | Nguồn: agent suy ra: yêu cầu chỉ về một khổ | Yêu cầu: Không đổi gì từ 480px trở lên: kiểu của `.subtitle`, `.title`, `.nav` và `--subtitle-shift` ở các khổ đó giữ nguyên. Không đổi nội dung (`personalInfo.title`), markup của `Header.tsx`, chuỗi giao diện, token hay test. Không xử lý GAP-07 (cuộn ngang 360px) và GAP-08 (hàng liên kết 768–1023px).
- REQ-04 | Nguồn: quy tắc giao tài liệu theo thay đổi (mọi đoạn nêu giá trị mà task này đổi). Agent quyết | Yêu cầu: Mọi đoạn đang nói chức danh bị ẩn hoặc nằm trong viên thuốc dưới 480px khớp source sau task:
  - `docs/RESPONSIVE.md`: hàng **xs** của bảng ("subtitle hidden"), bullet "**< 480px**" của mục Header, và bullet về cuộn trang có câu "none below 480px where the subtitle is hidden".
  - `docs/DESIGN.md`: mục 4 Navigation (dòng Content về chức danh và việc tên trượt xuống giữa viên thuốc, dòng "Below 768px ... below 480px the job title is hidden"), mục 8 "Collapsing Strategy" (dòng Nav), mục 11 (dòng "job-title line ... set to 0 below 480px where the line is hidden").
  - Không còn câu nào nói chức danh bị ẩn hoặc nằm trong viên thuốc ở khổ dưới 480px; câu về khổ từ 480px giữ nguyên.
- Phạm vi: chỉ dòng chức danh của header dưới 480px.
- Đường dẫn được phép sửa: `.repos/Portfolio`: `src/components/Header.module.css` (khối `@media (max-width: 479px)` và, nếu cần, các khai báo gốc của `.subtitle` mà khối đó ghi đè), `docs/RESPONSIVE.md` và `docs/DESIGN.md` (các đoạn ở REQ-04). Không giao test: thay đổi chỉ là CSS trình bày, không đổi markup nên không có test theo FUT cần cập nhật.
- Kết quả riêng của task: người xem điện thoại dưới 480px thấy lại chức danh ngay dưới viên thuốc header khi ở đầu trang; viên thuốc và bố cục trang không đổi; tài liệu khớp.

## Làm như thế nào

Không phụ thuộc task khác. Source hiện tại của `Header` (T05–T07 của gói `portfolio-gaps` đã triển khai) là đầu vào.

1. ROLE-01 (`frontend-developer`) sửa `src/components/Header.module.css`, khối `@media (max-width: 479px)`: thay `.subtitle { display: none }` bằng đặt chức danh ra ngoài dòng chảy của viên thuốc theo REQ-01, REQ-02. `.nav` đã là `position: relative`, nên `.subtitle` định vị tuyệt đối theo `.nav` (`top` tính từ đáy viên thuốc, `left` và `right` bằng `--space-3`), ghi đè `margin` của quy tắc gốc, thêm `pointer-events: none`; không đặt lại `opacity` trong khối này để `.subtitleHidden` vẫn thắng. Giữ `.headerScrolled .title { transform: none }`. Chọn giá trị chi tiết trong ràng buộc REQ-01.
2. ROLE-01 cập nhật tài liệu REQ-04.
3. ROLE-02 (`code-reviewer`) kết luận QG-01 trên diff.
4. ROLE-03 (`ux-designer`), sau khi ROLE-01 chụp layout theo router (đầu trang, đã cuộn, menu mở, hai theme, hai ngôn ngữ, khổ sát ngưỡng 479 và 480px), kết luận QG-02 từ ảnh, số đo hộp bao và source hiển thị.
5. ROLE-04 (`code-analyst`) kết luận QG-03 bằng đối chiếu tài liệu với CSS.

Bước tiếp theo: người dùng chỉ định file Plan này để Implement; Implement chỉ thực hiện task này trong phạm vi trên.

## Vai trò tham gia

- ROLE-01 | Loại: triển khai | Vai trò: frontend-developer | Phụ trách: CSS dòng chức danh dưới 480px, tài liệu REQ-04, chụp layout theo router | Đầu vào: Plan này, source `Header` hiện tại | Hoàn tất khi: REQ-01..REQ-04 có thay đổi tương ứng; `layout_verification` có lần chụp đạt kèm số đo hộp bao của viên thuốc, logo, hai nút, chức danh và phần tử đầu tiên của `Personal` ở 360, 479 và 480px, so với trạng thái chưa có diff
- ROLE-02 | Loại: kiểm chứng | Vai trò: code-reviewer | Phụ trách: QG-01 | Đầu vào: diff của ROLE-01 | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-01 kèm đường đã lần, phản ví dụ, nguồn
- ROLE-03 | Loại: kiểm chứng | Vai trò: ux-designer | Phụ trách: QG-02 | Đầu vào: ảnh và bảng kết quả layout, source hiển thị | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-02 kèm ảnh đã xem, phản ví dụ, nguồn
- ROLE-04 | Loại: kiểm chứng | Vai trò: code-analyst | Phụ trách: QG-03 | Đầu vào: diff của ROLE-01 | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-03 kèm khẳng định đã đối chiếu, nguồn
- Lập Plan | Vai trò: business-analyst, code-analyst, ux-designer | Cách thực hiện: người điều phối tự thực hiện lần lượt; không có phản biện độc lập

## Tiêu chí chất lượng bắt buộc

- QG-01 | Yêu cầu: REQ-01, REQ-02, REQ-03 | Logic bắt buộc:
  - Dưới 480px `.subtitle` không còn `display: none`. Nó định vị theo `.nav` (`position: relative`), nằm dưới đáy viên thuốc (`top` tính từ đáy, cách 8px), `left` và `right` bằng `--space-3`, `margin` không còn đẩy nó theo `--subtitle-gap`, và có `pointer-events: none`.
  - Khi trang đã cuộn, `.subtitleHidden` vẫn cho `opacity: 0` (khối dưới 480px không đặt `opacity`; xét thứ tự và độ đặc hiệu của hai quy tắc trong file), `.headerScrolled .title` vẫn `transform: none`.
  - Chỉ khối `@media (max-width: 479px)` (và khai báo gốc của `.subtitle` nếu cần) đổi; không quy tắc nào từ 480px, `.nav`, `--nav-height-mobile`, `App.module.css` hay `index.css` đổi; không có `display`, `visibility` hay `aria-hidden` ẩn chức danh.
  - Chỉ dùng token (không màu hay cỡ chữ viết thẳng); chuyển tiếp chỉ trên `opacity` và `transform`.
- QG-02 | Yêu cầu: REQ-01, REQ-02, REQ-03 | Logic bắt buộc: Với `light`/`dark` × `en`/`vi` × 360×800, cùng khổ sát ngưỡng 479 và 480px:
  - Đầu trang (chưa cuộn) dưới 480px: chức danh hiện đủ chữ, một dòng ở 360px, nằm trong khung nhìn, dưới đáy viên thuốc, căn trái với tên, không chồng viên thuốc, không chồng chữ hay nút của `Personal`; vòng trang trí `.orbit` (nằm sau, `aria-hidden`) không che chữ chức danh.
  - Hộp bao của viên thuốc, logo, nút theme, nút menu và vị trí đầu nội dung bằng trạng thái chưa có diff.
  - Chữ đọc được ở cả hai theme: tỉ số `--color-text-muted` trên `--color-bg` đã tính khi lập Plan bằng (L1 + 0,05) / (L2 + 0,05): sáng `#6E4A5C` (L = 0,08985) trên `#FBF4F1` (L = 0,91561) = 0,96561 / 0,13985 = 6,90; tối `#CBB3BE` (L = 0,48654) trên `#10261F` (L = 0,01595) = 0,53654 / 0,06595 = 8,14; cả hai ≥ 4,5:1.
  - Đã cuộn: chức danh không còn thấy, tên ở giữa viên thuốc, nền kính mờ như cũ; vùng chức danh đã ẩn không chặn nhấn vào nội dung bên dưới (`pointer-events: none`).
  - Menu mở: overlay phủ kín khung nhìn, không thấy chức danh.
  - Từ 480px (ảnh 480×800 và 1280×800): chức danh vẫn nằm trong viên thuốc như trước diff.
  - Mỗi điểm không đạt được so với ảnh trước khi có diff (cuộn ngang 360px do `.orbit` là GAP-07, không do diff).
- QG-03 | Yêu cầu: REQ-04 | Logic bắt buộc: Mỗi đoạn ở REQ-04 của `docs/RESPONSIVE.md` và `docs/DESIGN.md` mô tả đúng CSS sau diff (chức danh dưới 480px nằm dưới viên thuốc, không bị ẩn, mờ dần khi cuộn, tên giữ ở giữa viên thuốc). Tìm trong hai tài liệu theo `subtitle`, `job title`, `job-title`, `chức danh`, `hidden`: không còn câu nào nói chức danh bị ẩn hoặc nằm trong viên thuốc ở khổ dưới 480px, và mọi câu còn lại về chức danh ở khổ từ 480px vẫn đúng với CSS.

## Implementation Record
- status: implemented
- updated_at: "2026-10-18T12:43:00+07:00"
- changed_paths: [".repos/Portfolio: src/components/Header.module.css (khối `@media (max-width: 479px)` dòng 273–291; câu comment phía trên quy tắc `.subtitle` gốc dòng 84–87, không đổi khai báo)", "docs/RESPONSIVE.md (dòng 15, 26, 31)", "docs/DESIGN.md (dòng 213, 217, 312, 406)", "Hub: file Plan này (ghi sổ)"]
- role_work: frontend-developer=xong/khối dưới 480px của `.subtitle` thay `display: none` bằng `position: absolute; top: calc(100% + var(--space-1)); left: var(--space-3); right: var(--space-3); margin: 0; pointer-events: none`, không đặt `opacity`, giữ `.headerScrolled .title { transform: none }`; không đặt `white-space: nowrap` để chữ xuống dòng thay vì tràn ở khổ hẹp hơn 360px; REQ-04 sửa RESPONSIVE :15, :26, :31 và DESIGN :213, :217, :312, :406; quét `subtitle|job title|job-title|chức danh|title line|display: none|480|hidden|ẩn` trên `*.md,*.css,*.ts,*.tsx,*.html,*.json` toàn `.repos/Portfolio` (trừ `node_modules`, `package-lock.json`, `docs/UPDATE_SUMMARY.md` là hồ sơ lịch sử) và `.agents/llm-docs/repos/Portfolio.md`: `DOCUMENTATION_COMPLETE.md` :252–253, :1000–1001 chỉ nói mờ dần khi cuộn, các chỗ còn lại chỉ nói kiểu dữ liệu, không câu nào khác phải sửa; `Header.test.tsx` không khẳng định gì về chức danh nên không có test theo FUT cần đổi; lần sửa 1/2 theo FAIL QG-03 viết lại cụm công thức độ dịch ở RESPONSIVE :31 và DESIGN :406 thành `--subtitle-shift` = (13px × 1.4 + 4px) / 2 = 11.1px; code-reviewer=PASS QG-01; ux-designer=PASS QG-02; code-analyst=FAIL QG-03 lần đầu, PASS sau lần sửa 1/2
- execution_mode: agent riêng theo vai trò; mỗi vai trò chạy trong một sub-agent riêng, lần sửa QG-03 dùng lại đúng agent `frontend-developer` và `code-analyst` của lượt. Ba vai trò kiểm chứng nhận diff và tuyên bố của `frontend-developer` như điều cần kiểm theo hợp đồng Implement, không nhận bản nháp kết luận nào; Implementation Record chưa tồn tại khi chúng chạy; `code-reviewer` và `code-analyst` được dặn không đọc `.tmp/`
- checkpoint_evidence: N/A
- quality_gate_results: QG-01=PASS; QG-02=PASS; QG-03=PASS
- quality_gate_evidence: QG-01 -> code-reviewer: `Header.tsx:66–72` đặt `p.subtitle` trong `div.logo` trong `nav.nav`; `.logo` (`Header.module.css:69–72`) không có `position`, `transform`, `filter`, `contain`, nên khối chứa là `.nav` (`position: relative`, :53); `top` = 64 + 8 = 72px tính từ đỉnh viên thuốc (padding box 64px vì `.nav` không có border, padding chỉ ngang, `box-sizing: border-box` ở `index.css:7`), tức y trang 24 + 72 = 96; `left`/`right` = 24px nên mép trái chức danh trùng mép trái tên (padding trái `.nav` dưới 768px là `--space-3`, :214); `margin: 0` (:283) thắng `margin` gốc (:95) vì cùng độ đặc hiệu và đứng sau; `subtitleHidden` và `headerScrolled` cùng sinh từ `isScrolled = window.scrollY > 0` (`Header.tsx:48,65,69`), `.subtitleHidden { opacity: 0 }` (:98) thắng `opacity: 1` (:94) và khối 479px không đặt `opacity`; `.headerScrolled .title { transform: none }` (:288) đứng sau :102 cùng độ đặc hiệu; diff CSS chỉ hai hunk (comment trên `.subtitle` gốc, khối 479px); khối mới chỉ dùng `--space-1`, `--space-3`; không có `display`, `visibility`, `aria-hidden` ẩn chức danh. Phản ví dụ đã bác: khối chứa khác `.nav`, quy tắc khác ghi đè `position`/`opacity`/`margin` (chỉ :88, :98, :278 chạm `.subtitle`), bị cắt (`.header`/`.nav` không `overflow`), chồng overlay (`.navLinks` `z-index: 90` trong ngữ cảnh `isolation: isolate` của `.nav` vẽ trên `.subtitle` `z-index: auto`), `pointer-events` lan ra nút (chỉ đặt trên `<p>`), đổi từ 480px (khối không khớp). QG-02 -> ux-designer: xem ảnh `after-{en,vi}-{light,dark}-360x800-top`, `after-*-479x800-top`, tám clip `after-*-{360,479}x800-under-subtitle`, ảnh `scrolled`, `menu-open`, `menu-open-scrolled`, và cặp `after`/`base` ở 480 và 1280; số đo trong `results.json`: chức danh 48,96 264×18.2, chữ 48–292.5, một dòng ở 360, đáy 114.2 so với `.heroMedia` ở 136 (cách 21.8); viên thuốc, logo, hai nút, đầu nội dung (136 ở 360/479, 144 ở 480) bằng nền `a49bfe1`; màu tính toán `rgb(110, 74, 92)` và `rgb(203, 179, 190)` khớp `--color-text-muted` (`variables.css:12`, :38); tỉ số (L1 + 0,05) / (L2 + 0,05): sáng (0,9156 + 0,05) / (0,0898 + 0,05) = 6,90, tối (0,4867 + 0,05) / (0,0160 + 0,05) = 8,14; đã cuộn `opacity: 0`, `pointer-events: none`, `display: block`, `visibility: visible`, tên `transform: none`; menu mở overlay phủ kín, không thấy chức danh; từ 480px hộp và kiểu chức danh trùng nền. Phản ví dụ đã bác: cắt chữ, chồng hero, `.orbit` che chữ (mask conic của `.orbit::before` chỉ hiện cung có điểm thấp nhất y ≥ 156; clip nền phẳng), hạt ember, chức danh lộ khi menu mở. QG-03 -> code-analyst: bảng đối chiếu RESPONSIVE :15, :16, :26, :31, :100 và DESIGN :213, :217, :312, :377, :406 với `Header.module.css` :11–12, :53, :57, :62, :88–104, :213–214, :277–291, `App.module.css:16–21`, `index.css:34`, `variables.css`; lần đầu FAIL vì cụm "half the subtitle's height plus `--subtitle-gap`" (RESPONSIVE :31) và "half the line's height plus its gap" (DESIGN :406) đọc ra (18,2 / 2) + 4 = 13,1px trong khi `--subtitle-shift` = (13 × 1,4 + 4) / 2 = 11,1px (cụm có từ `745f1aa`, nằm trong hai câu của diff); sau lần sửa 1/2 hai câu ghi công thức có ngoặc và kết quả 11.1px, khớp `Header.module.css:12`; các hunk khác giữ nguyên văn, blob CSS không đổi. Tìm `subtitle|job title|job-title|chức danh|hidden` trong hai tài liệu: dòng còn lại nói `aria-hidden`, tab ẩn, trạng thái reveal hay liên kết, không nói chức danh bị ẩn dưới 480px
- layout_verification: thư mục `.tmp/layout-snapshots/portfolio-header-subtitle-mobile_20261017-142710/T01/20261018-121950/`; revision nền `a49bfe1` xuất bằng `git archive` vào `.tmp/`, chạy riêng; trạng thái đầu trang, đã cuộn, menu mở ở đầu trang và đã cuộn; theme `light`/`dark`; ngôn ngữ `en`/`vi`; khổ 360×800, 479, 480, 1280×800 (ảnh và số đo), 320, 414, 767 (số đo đầu trang); ảnh tĩnh với `prefers-reduced-motion: reduce`, thêm bốn tổ hợp `no-preference` ở 360; 128 ảnh; 456 kiểm đạt, 0 không đạt; hộp bao viên thuốc, logo, nút theme, nút menu, phần tử đầu của `Personal`, đầu nội dung và `scrollWidth` bằng nền ở mọi khổ, ngôn ngữ, theme, trạng thái; không đạt có từ trước, không do diff: cuộn ngang 426/360 và 485/479 (GAP-07), một lỗi console 404 ở cả nền và sau diff. Comment trên quy tắc `.subtitle` gốc được sửa sau lần chụp, không đổi khai báo nào
- repair_closure_evidence: N/A
- root_cause_revalidation: N/A
- review_item_disposition: N/A
- plan_amendments: N/A
- role_challenge_results: frontend-developer=PASS/xét thứ tự `opacity` của `.subtitleHidden` với khối 479px, overlay che chức danh, `pointer-events` (dải y 96–112 nằm trong hộp `.header` 0–112 có từ trước, chỉ 2,2px dưới hộp header là phần mới và xuyên xuống phần tử bên dưới), chuyển tiếp chỉ `opacity`, 320px (hai dòng, đáy 132,4, dư 3,6px so với 136), phóng chữ riêng trên khoảng 150%, ngưỡng 479/480; không còn nghi vấn mở; code-reviewer=PASS/xem quality_gate_evidence QG-01; ux-designer=PASS/xem quality_gate_evidence QG-02; code-analyst=PASS sau lần sửa 1/2/xem quality_gate_evidence QG-03
- residual_risk: (1) Dưới 360px (ví dụ 320px) chức danh xuống hai dòng, đáy 132,4px, còn 3,6px tới đầu nội dung 136px; phóng chữ riêng trên khoảng 150% có thể đẩy chữ tới ảnh chân dung vì `padding-top` của `.main` tính bằng px và REQ-01 giữ nguyên nó. (2) Có từ trước, không do diff: dải padding 24px của `.header` cố định (y 88–112 dưới 768px) nhận con trỏ; ở viewport phân số giữa 479 và 480px không truy vấn nào khớp; cuộn ngang 360px (GAP-07). (3) Môi trường chụp: `puppeteer-core` 25.14.0 được cài vào `.tmp/node_modules` (Git ignore, ngoài `package.json` của repo); lệnh `chrome.exe --version` lúc kiểm tra môi trường có thể đã mở một cửa sổ hoặc tab trong Chrome của người dùng
- review_handoff: file Plan này; thay đổi chưa commit trong `.repos/Portfolio` (nhánh `develop`, HEAD `a49bfe1`): `src/components/Header.module.css`, `docs/RESPONSIVE.md`, `docs/DESIGN.md` ở các dòng nêu trong changed_paths. Căn cứ giao việc: tin nhắn người dùng 2026-10-18 "Hãy tiến hành fix những findings/risks/blocks trong report review" cho report `.agents/review/portfolio-gaps_20261014-233844/t05-theme-fire-palette/round-02-review-theme-fire-palette-20261017-222600.md`, RISK-02 chỉ dẫn triển khai Plan này. Sau lượt này, cùng working tree, một task độc lập theo RISK-03 của report đó và RISK-01 của report T06 vòng 2 sửa `docs/DESIGN.md` dòng 122, 129, 167, 177; các dòng đó không thuộc T01
- role_selection_source: plan
- effective_implementation_roles: frontend-developer
- Next allowed owner/layer: Review T01 khi người dùng yêu cầu
- Authorization condition: Review chỉ chạy khi người dùng yêu cầu
1. Review T01 cho `.agents/plan/portfolio-header-subtitle-mobile_20261017-142710/01-plan-header-subtitle-mobile-20261017-142710.md`: đối chiếu khối `@media (max-width: 479px)` của `.repos/Portfolio/src/components/Header.module.css`, `docs/RESPONSIVE.md` dòng 15, 26, 31 và `docs/DESIGN.md` dòng 213, 217, 312, 406, cùng ảnh trong `.tmp/layout-snapshots/portfolio-header-subtitle-mobile_20261017-142710/T01/20261018-121950/`
