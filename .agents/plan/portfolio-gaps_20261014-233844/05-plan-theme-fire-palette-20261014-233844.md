---
schema: pirl-plan/v1
content_language: vi
plan_set: portfolio-gaps_20261014-233844
task_id: T05
title: "Theme sáng/tối có nút chuyển, bảng màu hợp mệnh Sơn Đầu Hỏa"
layer: implement
status: implemented
depends_on: [T02, T03, T04]
created_at: "2026-10-15T00:24:01+07:00"
target_repo: ".repos/Portfolio"
source_request: "Đổi sang font hỗ trợ tiếng Việt; lập Plan cho các gap mới phát hiện; cải thiện UI/UX đẹp mắt, công nghệ, sang trọng"
planning_roles: [business-analyst, code-analyst, solution-architect, ux-designer]
implementation_roles: [frontend-developer]
verification_roles: [code-reviewer, code-analyst, ux-designer]
---

# T05: Theme sáng/tối có nút chuyển, bảng màu hợp mệnh Sơn Đầu Hỏa

## Cần làm gì

- REQ-01 | Nguồn: người dùng chọn "Sáng và tối, có nút chuyển"; mô tả lựa chọn người dùng đã thấy: "Hai theme, nút chuyển theme, mặc định theo cài đặt hệ điều hành, ghi nhớ lựa chọn". Agent quyết (căn cứ: cách làm thông dụng khi mặc định theo hệ điều hành): thứ tự ưu tiên khi lỗi, việc đổi theo hệ điều hành khi trang đang mở, áp theme trước lần vẽ đầu | Yêu cầu: Trang có hai theme `light` và `dark`. Theme khởi tạo:
  - localStorage khóa `portfolio_theme` (`STORAGE_KEYS.THEME` đã có trong `src/utils/constants.ts`) là `light` hoặc `dark` thì dùng giá trị đó.
  - Không có giá trị, giá trị khác, hoặc đọc localStorage ném lỗi: hệ điều hành ưu tiên tối (`prefers-color-scheme: dark`) thì dùng `dark`, còn lại `light`.
  - `matchMedia` không có hoặc ném lỗi thì dùng `light`.
  - Theme được áp trước lần vẽ đầu, không nháy theme sai.
  - Khi người xem chưa lưu lựa chọn, cài đặt hệ điều hành đổi lúc trang đang mở thì trang đổi theo. Đã lưu lựa chọn thì bỏ qua thay đổi của hệ điều hành.
- REQ-02 | Nguồn: người dùng chọn "có nút chuyển". Agent quyết (căn cứ: `Header` đã có vùng `navActions` hiển thị ở mọi khổ; nút ngôn ngữ của T02 đã ở footer): vị trí, icon, nhãn | Yêu cầu: Nút chuyển theme nằm trong `Header` (vùng `navActions`), hiển thị ở mọi khổ màn hình.
  - Icon: mặt trăng khi đang sáng, mặt trời khi đang tối; icon là SVG nội tuyến có `aria-hidden`.
  - Tên truy cập lấy từ bảng chuỗi của T02, mô tả hành động: `en` "Switch to dark theme" / "Switch to light theme"; `vi` "Chuyển sang giao diện tối" / "Chuyển sang giao diện sáng".
  - `<button type="button">`, vùng bấm ≥ 44×44px, có vòng focus khi dùng bàn phím.
  - Bấm thì đổi theme ngay và lưu lựa chọn vào localStorage. Ghi thất bại thì vẫn đổi trong lượt xem đó, không báo lỗi.
- REQ-03 | Nguồn: người dùng sinh năm 1995, mệnh Sơn Đầu Hỏa, giao agent thiết kế lại bảng màu hợp mệnh. Người dùng chọn nền tối "Xanh lục thẫm (hành Mộc)"; mô tả lựa chọn đã thấy: "Nền #10261F. Mộc sinh Hỏa nên là màu tương sinh. Phải chỉnh lại màu tím và chữ trên nút để đạt chuẩn tương phản." Agent quyết trong việc được giao (căn cứ: quy tắc ngũ hành theo quan niệm phổ biến, độ tương phản WCAG 2.x tính khi lập Plan): mọi giá trị còn lại của bảng, quy tắc màu cấm. Quy tắc ngũ hành: bản mệnh Hỏa (đỏ, cam, hồng, tím) là màu nhấn; tương sinh Mộc (xanh lá) là nền tối và màu phụ; chế ngự Kim (trắng, xám ấm) chỉ cho bề mặt và chữ; hạn chế Thổ (vàng, nâu); tránh Thủy (đen, xanh dương, xanh nước biển) | Yêu cầu: Token màu ngữ nghĩa, khai một lần cho mỗi theme trong `src/styles/variables.css`, đúng giá trị sau:

  | Token | `light` ("bình minh trên núi") | `dark` ("lửa trên rừng núi") | Hành | Dùng cho |
  | --- | --- | --- | --- | --- |
  | `--color-bg` | `#FBF4F1` hồng ngà | `#10261F` lục thẫm | Hỏa / Mộc | Nền trang |
  | `--color-surface` | `#FFFDFC` trắng ấm | `#173229` | Kim / Mộc | Thẻ |
  | `--color-surface-raised` | `#F5E6E1` hồng phấn | `#1F3E34` | Hỏa / Mộc | Khối lồng trong thẻ, chip |
  | `--color-text` | `#2A1222` tím than đỏ | `#F8EEEA` trắng ngà | Hỏa / Kim | Chữ chính |
  | `--color-text-muted` | `#6E4A5C` | `#CBB3BE` hồng tro | Hỏa | Chữ phụ |
  | `--color-border` | `rgba(42, 18, 34, 0.12)` | `rgba(248, 238, 234, 0.12)` | — | Viền mảnh |
  | `--color-accent` | `#B3261E` đỏ son | `#F05A5E` đỏ san hô | Hỏa | Nền nút CTA, chấm eyebrow |
  | `--color-on-accent` | `#FFFFFF` | `#0B1C16` | Kim / Mộc | Chữ trên `--color-accent` |
  | `--color-accent-text` | `#A21F2A` | `#FF8A6B` san hô lửa | Hỏa | Liên kết, chữ nhấn |
  | `--color-ember` | `#E4572E` cam lửa | `#FF7A45` | Hỏa | Trang trí, chữ lớn |
  | `--color-violet` | `#7B3FA0` tím | `#CDA6EE` tím nhạt | Hỏa | Trang trí, chữ nhấn |
  | `--color-jade` | `#1B6F53` lục ngọc | `#6FD3A8` lục bạc hà | Mộc | Điểm nhấn phụ, chấm chip |
  | `--color-footer-bg` | `#2A1222` | `#0E241D` | Hỏa / Mộc | Nền footer |
  | `--color-footer-text` | `#F7EDE9` | `#F8EEEA` | Kim | Chữ footer |
  | `--color-footer-muted` | `#CBB3BE` | `#CBB3BE` | Hỏa | Chữ phụ footer |
  | `--color-shadow-rgb` | `42, 18, 34` | `6, 18, 14` | — | Kênh màu cho mọi bóng đổ |
  | `--gradient-flame` | `linear-gradient(135deg, #B3261E 0%, #E4572E 55%, #7B3FA0 100%)` | `linear-gradient(135deg, #F05A5E 0%, #FF7A45 55%, #CDA6EE 100%)` | Hỏa | Chỉ cho trang trí: viền, vòng, vạch |

  - Không màu nào trong `src/**/*.css` thuộc ba nhóm sau, kể cả `rgba`, `hsl` hay `color-mix` (trừ kênh `--color-shadow-rgb`, chỉ dùng cho bóng đổ có độ mờ):
    - sắc độ 180°–260° với độ bão hòa > 15% (xanh dương, xanh nước biển);
    - độ bão hòa < 10% với độ sáng < 20% (đen, xám đen);
    - sắc độ 35°–65° với độ bão hòa > 40% (vàng, nâu đất).
  - Nền (`--color-bg`, `--color-surface`, `--color-surface-raised`, `--color-footer-bg`) của theme tối có độ sáng HSL ≥ 10%.
  - Bỏ `--color-link: #3860BE` (xanh dương), nền footer `#141413` (đen) và mọi `rgba(0, 0, 0, …)`. Bóng đổ dùng `rgba(var(--color-shadow-rgb), …)`.
- REQ-04 | Nguồn: agent suy ra từ source: tại `a50912c`, component CSS dùng token cũ (`--color-canvas`, `--color-ink`, `--color-signal`, `--color-lifted`...) và màu viết thẳng (`rgba(255, 255, 255, 0.4)` ở `Footer.module.css`...) | Yêu cầu: Mọi màu trong component CSS, `global.css`, `index.css`, `App.module.css` đi qua token ở REQ-03, nên đổi theme thì mọi section đổi theo. Token màu cũ bị bỏ khi không còn chỗ dùng.
- REQ-05 | Nguồn: agent quyết theo chuẩn WCAG 2.1 AA, căn cứ yêu cầu "đẹp mắt, sang trọng" và trang có người đọc dùng trình đọc/kính lúp | Yêu cầu: Ở cả hai theme:
  - Chữ thường đạt độ tương phản ≥ 4.5:1 với nền ngay dưới nó.
  - Chữ lớn (≥ 24px, hoặc ≥ 18.66px đậm), icon và viền của thành phần điều khiển đạt ≥ 3:1.
  - `--color-ember` chỉ dùng cho chữ lớn hoặc trang trí (trên nền sáng chỉ đạt 3.39:1).
  - Chữ không đặt trên `--gradient-flame` (chữ trắng trên `#E4572E` < 4.5:1).
  - Giá trị đã tính khi lập Plan:
    - sáng: `--color-text` trên `--color-bg` 15.99; `--color-text-muted` trên `--color-surface-raised` 6.18; `--color-accent-text` trên `--color-surface-raised` 6.25; `--color-jade` trên `--color-surface-raised` 5.02; `--color-violet` trên `--color-surface-raised` 5.65; `--color-on-accent` trên `--color-accent` 6.54; `--color-footer-muted` trên `--color-footer-bg` 8.88;
    - tối: `--color-text` trên `--color-surface-raised` 10.24; `--color-text-muted` trên `--color-surface-raised` 5.97; `--color-accent-text` trên `--color-surface-raised` 5.06; `--color-violet` trên `--color-surface-raised` 5.72; `--color-jade` trên `--color-surface-raised` 6.43; `--color-on-accent` trên `--color-accent` 5.31; `--color-accent` với `--color-surface` 4.15; `--color-footer-muted` trên `--color-footer-bg` 8.33.
- REQ-06 | Nguồn: người dùng cho phép viết lại `docs/DESIGN.md` theo màu hợp mệnh. Agent quyết theo quy tắc giao tài liệu theo thay đổi: mọi đoạn nêu token, giá trị màu, tên hệ thiết kế, theme hay thư mục mà task này thêm, đổi hoặc bỏ | Yêu cầu: Sau task, các đoạn sau khớp source:
  - `docs/DESIGN.md`: đổi tiêu đề thành hệ thiết kế "Sơn Đầu Hỏa"; viết lại mục 1 (ý tưởng: lửa trên đỉnh núi; theme sáng hồng ngà, theme tối rừng núi lục thẫm, nhấn đỏ son, cam lửa, tím) và mục 2 (bảng REQ-03 cho hai theme, bảng ngũ hành, quy tắc tương phản, quy tắc gradient); sửa mọi câu nhắc màu ở mục khác và "Quick Color Reference"; thêm mục theme sáng/tối (cách chọn, nút chuyển, token theo theme). Giữ nguyên nội dung về font (T04 đã sửa).
  - `docs/RESPONSIVE.md`: mọi câu nêu token màu, màu nền (ví dụ nền Experience `--color-lifted` do T03 ghi) hoặc tên hệ thiết kế.
  - Chú thích đầu `variables.css`; tên hệ thiết kế trong ghi chú đầu `docs/UPDATE_SUMMARY.md`.
  - `DOCUMENTATION_COMPLETE.md` (cả hai ngôn ngữ): mục màu, Dark Mode, danh sách tính năng (thêm theme sáng/tối), cây "Cấu Trúc Dự Án" và bảng "Folder Purposes" (thêm `src/theme/`).
  - Tài liệu ngữ cảnh: mục Kiến trúc (thư mục theme, `data-theme`, khóa `portfolio_theme`); "Kiểm chứng layout bằng mock" thêm chiều theme `light`/`dark` và cách đặt (localStorage `portfolio_theme` trước khi tải, hoặc giả lập `prefers-color-scheme`); dòng `docs/DESIGN.md` ở bảng "Đọc trước khi làm".
- Hợp đồng đã chốt khi lập Plan (vai trò `solution-architect`, người điều phối tự thực hiện; agent quyết, căn cứ source và cơ chế ngôn ngữ của T02):
  - `Theme = 'light' | 'dark'` khai trong `src/types/index.ts`. Provider và hook theme ở thư mục mới `src/theme/`, cùng mẫu với `src/i18n/` của T02; bọc cây trong `src/App.tsx`.
  - Theme áp bằng thuộc tính `data-theme` trên `<html>`; CSS đặt token theo `:root[data-theme='dark']` và `:root[data-theme='light']`, kèm `color-scheme` tương ứng.
  - Một đoạn script nội tuyến nhỏ trong `<head>` của `index.html`, chạy trước script ứng dụng, tính theme theo REQ-01 (đọc localStorage và `matchMedia` trong `try/catch`) rồi đặt `data-theme`. Provider lấy giá trị khởi tạo từ `document.documentElement.dataset.theme` nếu hợp lệ, không thì tính lại theo cùng quy tắc (trường hợp không có script, như trong test).
  - `<meta name="theme-color">` trong `index.html`, provider cập nhật theo `--color-bg` của theme đang dùng.
  - Chuyển theme có chuyển màu ≤ 300ms trên nền, chữ, viền; tắt khi `prefers-reduced-motion: reduce`.
  - Không thêm thư viện.
- Phạm vi: chỉ màu, theme và nút chuyển. Không đổi font (T04), cỡ chữ, bo góc, độ sâu thẻ, chi tiết nhấn (T06), hiệu ứng chuyển động khác (T07), bố cục, nội dung.
- Đường dẫn được phép sửa: `index.html` (script theme, `meta theme-color`); `src/App.tsx`; thư mục mới `src/theme/`; `src/types/index.ts`; `src/i18n/` (thêm khóa chuỗi của nút); `src/components/Header.tsx`; `src/styles/variables.css`, `src/styles/global.css`, `src/index.css`, `src/App.module.css`, mọi `src/components/*.module.css`; test: file mới `src/theme/theme.test.tsx`; tài liệu: `docs/DESIGN.md`, `docs/RESPONSIVE.md`, `docs/UPDATE_SUMMARY.md` (chỉ ghi chú đầu file), `DOCUMENTATION_COMPLETE.md` (các đoạn ở REQ-06); ở Hub: `.agents/llm-docs/repos/Portfolio.md`.
- Kết quả riêng của task: người xem chuyển được giữa hai theme với bảng màu mới; lựa chọn được ghi nhớ; mọi section dùng đúng token.

## Làm như thế nào

Đầu vào từ T02: provider/hook ngôn ngữ và bảng chuỗi `en`/`vi` trong `src/i18n/`, `Header` đã đọc chuỗi theo ngôn ngữ. Đầu vào từ T03: các mục màu của `DOCUMENTATION_COMPLETE.md`, `docs/RESPONSIVE.md` và ghi chú đầu `docs/UPDATE_SUMMARY.md` đã khớp source. Đầu vào từ T04: mọi câu nêu font, trọng số và line-height trong `docs/DESIGN.md` đã đúng; khi viết lại mục 1, 2, giữ nguyên nội dung đó. Thiếu đầu vào thì dừng.

1. ROLE-01 (`frontend-developer`) khai token REQ-03 cho hai theme trong `variables.css`. Chuyển mọi màu trong CSS sang token (REQ-04); bỏ token cũ không còn dùng; bóng đổ theo `--color-shadow-rgb`.
2. ROLE-01 dựng cơ chế theme theo hợp đồng: script nội tuyến trong `index.html`, provider/hook trong `src/theme/`, `meta theme-color`, lắng nghe thay đổi `prefers-color-scheme` khi chưa lưu lựa chọn, chuyển màu có tắt theo `prefers-reduced-motion`.
3. ROLE-01 thêm nút chuyển theme vào `Header` theo REQ-02; thêm khóa chuỗi `en`/`vi` vào bảng chuỗi của T02.
4. ROLE-01 viết test theo FUT cho REQ-01, REQ-02 trong `src/theme/theme.test.tsx` (render `App`, giả lập `matchMedia`, mỗi test dọn localStorage, `data-theme`, mock):
   - (a) lưu `dark` → `data-theme="dark"`; lưu `light` khi hệ điều hành tối → `light`;
   - (b) không lưu, hệ điều hành tối → `dark`; sáng → `light`; giá trị lưu không hợp lệ → theo hệ điều hành;
   - (c) đọc localStorage ném lỗi → theo hệ điều hành; không có `matchMedia` → `light`;
   - (d) bấm nút → đổi theme, lưu localStorage, tên truy cập của nút đổi theo bảng chuỗi; ghi localStorage ném lỗi → vẫn đổi;
   - (e) chưa lưu lựa chọn, sự kiện đổi `prefers-color-scheme` → theme đổi theo; sau khi bấm nút, sự kiện đó không đổi theme.

   Chạy từ `.repos/Portfolio`: `npx vitest run --pool=forks src/theme/theme.test.tsx src/App.test.tsx src/components/Header.test.tsx`. `App` và `Header` là chức năng bị ảnh hưởng (thêm provider, thêm nút).
5. ROLE-01 cập nhật tài liệu theo REQ-06. Quét `docs/`, `DOCUMENTATION_COMPLETE.md`, `src/data/README.md` và tài liệu ngữ cảnh theo tên token cũ, mã màu cũ và tên hệ thiết kế cũ.
6. ROLE-02 (`code-reviewer`) kết luận QG-01, QG-02 và đối chiếu test với FUT, bằng lập luận trên diff.
7. ROLE-03 (`code-analyst`) kết luận QG-03, QG-05 bằng lần qua mọi file CSS, provider và tài liệu.
8. ROLE-04 (`ux-designer`), sau khi ROLE-01 chụp layout theo router, kết luận QG-04 từ ảnh, bảng kết quả và giá trị token.

Task này không sửa token, câu hay khai báo về font (T04 sở hữu). T06 phụ thuộc task này.
Bước tiếp theo: người dùng chỉ định file Plan này để Implement sau khi T02, T03 và T04 đã `implemented`; Implement chỉ thực hiện T05 trong phạm vi trên.

## Vai trò tham gia

- ROLE-01 | Loại: triển khai | Vai trò: frontend-developer | Phụ trách: token màu, chuyển CSS sang token, cơ chế theme, nút chuyển, test bước 4, tài liệu, chụp layout theo router | Đầu vào: kết quả T02, T03, T04, Plan này | Hoàn tất khi: REQ-01..REQ-06 có source/tài liệu/test trong diff; test bước 4 đã chạy và được giải thích; `layout_verification` có lần chụp đạt
- ROLE-02 | Loại: kiểm chứng | Vai trò: code-reviewer | Phụ trách: QG-01, QG-02, test so với FUT | Đầu vào: diff và tuyên bố của ROLE-01 | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-01, QG-02 kèm đường đã lần, phản ví dụ, nguồn
- ROLE-03 | Loại: kiểm chứng | Vai trò: code-analyst | Phụ trách: QG-03, QG-05 | Đầu vào: diff của ROLE-01 | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-03, QG-05 kèm đường đã lần, nguồn
- ROLE-04 | Loại: kiểm chứng | Vai trò: ux-designer | Phụ trách: QG-04 | Đầu vào: ảnh và bảng kết quả layout, token sau diff | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-04 kèm ảnh đã xem, phản ví dụ, nguồn
- Lập Plan | Vai trò: business-analyst, code-analyst, solution-architect, ux-designer | Cách thực hiện: người điều phối tự thực hiện lần lượt; không có phản biện độc lập

## Tiêu chí chất lượng bắt buộc

- QG-01 | Yêu cầu: REQ-01 | Logic bắt buộc:
  - Theme khởi tạo theo bảng:

    | Giá trị lưu | `prefers-color-scheme` | Kết quả |
    | --- | --- | --- |
    | `dark` | bất kỳ | `dark` |
    | `light` | bất kỳ | `light` |
    | không có, giá trị khác, hoặc đọc ném lỗi | tối | `dark` |
    | không có, giá trị khác, hoặc đọc ném lỗi | sáng | `light` |
    | không có | `matchMedia` không có hoặc ném lỗi | `light` |

  - Script nội tuyến đặt `data-theme` trước khi script ứng dụng chạy và trước lần vẽ đầu.
  - Provider khởi tạo đúng giá trị đó nên lần render đầu không dùng theme khác.
  - Không có script (test) thì provider cho cùng kết quả theo bảng.
- QG-02 | Yêu cầu: REQ-01, REQ-02 | Logic bắt buộc:
  - Bấm nút: `light` → `dark` và ngược lại. `data-theme`, `color-scheme`, `meta theme-color` và localStorage đổi theo. Ghi localStorage ném lỗi thì vẫn đổi, lỗi được bắt.
  - Thay đổi `prefers-color-scheme` chỉ đổi theme khi chưa có lựa chọn lưu. Listener được gỡ khi unmount.
  - Nút là `<button type="button">`; tên truy cập lấy từ bảng chuỗi theo ngôn ngữ và theme hiện tại; icon `aria-hidden`; vùng bấm ≥ 44×44px; có `:focus-visible` với viền tương phản ≥ 3:1 ở cả hai theme.
  - Chỉ provider giữ trạng thái theme.
- QG-03 | Yêu cầu: REQ-03, REQ-04 | Logic bắt buộc:
  - Hai khối theme trong `variables.css` khai cùng một tập token, giá trị đúng bảng REQ-03.
  - Lần qua mọi `src/**/*.css`: mọi giá trị màu là `var(--…)` của token REQ-03, hoặc `rgba(var(--color-shadow-rgb), …)` / `color-mix` dẫn từ token. Không còn màu viết thẳng ngoài `variables.css`; không còn tham chiếu tới token đã bỏ.
  - Không màu nào thuộc ba nhóm cấm ở REQ-03; nền theme tối có độ sáng ≥ 10%; không còn `#3860BE`, `#141413`, `rgba(0, 0, 0`.
  - Không có `style` màu nội tuyến trong `src/**/*.tsx`.
- QG-04 | Yêu cầu: REQ-02, REQ-03, REQ-04, REQ-05 | Logic bắt buộc: Với `light` và `dark` × `en` và `vi` × 1280×800 và 360×800:
  - Mọi section và footer dùng màu của theme đang chọn; không phần tử nào còn màu kem/đen cũ.
  - Mỗi cặp chữ/nền hiển thị khớp REQ-05: giá trị token đạt ngưỡng, `--color-ember` không dùng cho chữ thường, không có chữ trên `--gradient-flame`.
  - Ở 1280: 6 mục điều hướng và nút theme trên một hàng, không chồng khối tên.
  - Ở 360: logo, nút theme và nút hamburger nằm trong khung, không chồng nhau; menu mở hiển thị đủ 6 mục và nút đóng.
  - Vòng focus thấy rõ ở cả hai theme. Không cuộn ngang.
  - Mỗi điểm không đạt được so với ảnh trước khi có diff.
- QG-05 | Yêu cầu: REQ-06 | Logic bắt buộc:
  - `docs/DESIGN.md`: tiêu đề và mục 1, 2 mô tả hệ "Sơn Đầu Hỏa" với hai theme. Mọi mã màu nêu trong file khớp token sau diff; bảng ngũ hành khớp REQ-03; có mục theme sáng/tối khớp provider và script. Không còn Mastercard, cream canvas, Signal Orange, Link Blue hay `#141413` như màu đang dùng. Nội dung font giữ như sau T04.
  - `docs/RESPONSIVE.md` không còn token màu đã bỏ (`--color-lifted`...) hay tên hệ thiết kế cũ.
  - `variables.css`, ghi chú đầu `docs/UPDATE_SUMMARY.md` và các đoạn ở REQ-06 của `DOCUMENTATION_COMPLETE.md` (cả hai ngôn ngữ, gồm cây thư mục có `src/theme/`) nêu đúng tên hệ thiết kế, token và hai theme.
  - `.agents/llm-docs/repos/Portfolio.md`: mục Kiến trúc, "Kiểm chứng layout bằng mock" và dòng `docs/DESIGN.md` khớp source.

## Implementation Record
- status: implemented
- updated_at: "2026-10-17T00:19:29+07:00"
- changed_paths: [".repos/Portfolio: index.html", "src/App.tsx", "src/types/index.ts", "src/theme/theme.ts (mới)", "src/theme/ThemeContext.ts (mới)", "src/theme/ThemeProvider.tsx (mới)", "src/theme/useTheme.ts (mới)", "src/theme/index.ts (mới)", "src/theme/theme.test.tsx (mới)", "src/i18n/en.ts", "src/i18n/vi.ts", "src/components/Header.tsx", "src/styles/variables.css", "src/styles/global.css", "src/index.css", "src/components/Header.module.css", "src/components/Personal.module.css", "src/components/Skills.module.css", "src/components/Education.module.css", "src/components/Experience.module.css", "src/components/Projects.module.css", "src/components/Certifications.module.css", "src/components/Achievements.module.css", "src/components/Footer.module.css", "docs/DESIGN.md", "docs/RESPONSIVE.md", "docs/UPDATE_SUMMARY.md (chỉ ghi chú đầu file)", "DOCUMENTATION_COMPLETE.md", "Hub: .agents/llm-docs/repos/Portfolio.md", "Hub: file Plan này (ghi sổ)"]
- role_work: frontend-developer=done: token màu theo theme trong `variables.css` (`:root, :root[data-theme='light']` và `:root[data-theme='dark']`, mỗi khối 17 token, kèm `color-scheme`; bỏ 14 token màu cũ và `--shadow-strong`; `--border-ink/subtle/muted` suy từ token; thêm `--border-control` để viền nút tròn và hộp liên kết đạt 3:1; bóng đổ dùng `rgba(var(--color-shadow-rgb), …)`); chuyển mọi màu trong `global.css`, `index.css` và 9 file CSS component sang token (nền lồng trong thẻ dùng `--color-surface-raised`, CTA dùng `--color-accent`/`--color-on-accent`, liên kết `--color-accent-text`, trang trí `--color-ember`, footer dùng `--color-footer-*`, màu trộn bằng `color-mix` từ token, mặt nạ `.orbit` dùng token thay `black`); cơ chế theme: `src/theme/` (`theme.ts` chọn theme và nghe `prefers-color-scheme`, `ThemeProvider` giữ trạng thái, bắt đầu từ `data-theme` do script ở `<head>` của `index.html` đặt, ghi localStorage trong `try/catch`, cập nhật `<meta name="theme-color">`, gỡ listener và timer khi unmount, `useTheme`), lớp `theme-switching` làm màu chuyển 250ms và tắt khi giảm chuyển động, vòng focus toàn cục `:focus-visible`; nút `<button type="button">` 48×48px trong `navActions` với icon SVG `aria-hidden`, tên truy cập lấy từ bảng chuỗi `en`/`vi` (thêm `switchToDark`, `switchToLight`). Sửa bố cục do thêm nút (cần để QG-04 và để không hồi quy): ẩn dòng phụ của logo dưới 480px (logo + nút theme + nút menu không vừa viên thuốc 312px khi còn dòng phụ rộng 226px); `gap: clamp(24px, 3.75vw, 48px)` cho hàng liên kết (đúng 48px từ 1280px; ở 1024–1066px nút theme từng nhô ra ngoài viên thuốc, trước diff vừa). Tự quyết định ngoài chữ Plan, cần người dùng xác nhận: (1) nền footer tối `#0F261F` thay `#0E241D` vì giá trị trong bảng REQ-03 có độ sáng HSL 9,80% (<10%) mâu thuẫn quy tắc "nền theme tối ≥ 10%" của chính REQ-03/QG-03; (2) ẩn dòng phụ logo dưới 480px; (3) viết lại toàn bộ `docs/DESIGN.md` thay vì chỉ mục 1, 2 vì tài liệu còn hàng chục mã màu và tên thương hiệu cũ ở mọi mục (giữ nguyên nội dung font của T04, giữ đánh số mục 1–9 và thêm mục 10). Test theo FUT: `src/theme/theme.test.tsx` (6 test: theme đã lưu, theo hệ điều hành, đọc ném lỗi và không có `matchMedia`, bấm đổi + lưu + tên nút theo ngôn ngữ, ghi ném lỗi, đổi theo hệ điều hành rồi bỏ qua sau khi chọn), chạy từ `.repos/Portfolio`: `npx vitest run --pool=forks src/theme/theme.test.tsx src/App.test.tsx src/components/Header.test.tsx` = 3 file, 14 test đạt. Tài liệu REQ-06: `docs/DESIGN.md` (hệ "Sơn Đầu Hỏa", bảng token hai theme, ngũ hành, tương phản, gradient, mục 10 theme), `docs/RESPONSIVE.md` (tiêu đề, token `--color-surface`, nút theme, dòng phụ, gap), ghi chú đầu `docs/UPDATE_SUMMARY.md`, `DOCUMENTATION_COMPLETE.md` hai ngôn ngữ (tính năng, bảng màu hai theme, mục giao diện, mục sáng/tối, cây và bảng thư mục có `src/theme/`), chú thích đầu `variables.css`, tài liệu ngữ cảnh (Kiến trúc, "Kiểm chứng layout bằng mock", dòng `docs/DESIGN.md`, thêm GAP-08). Quét: tên token cũ, mã `#F3F0EE|#141413|#3860BE`, "Mastercard", "Signal Orange", "Link Blue", "cream" trong `src/`, `docs/`, `DOCUMENTATION_COMPLETE.md`, `index.html`: chỉ còn hai dòng lịch sử trong `docs/UPDATE_SUMMARY.md` nhắc "cream" (hồ sơ lịch sử, giữ nguyên); code-reviewer=PASS QG-01, QG-02 và test với FUT; code-analyst=PASS QG-03, QG-05; ux-designer=PASS QG-04
- execution_mode: tự thực hiện lần lượt (người điều phối đảm nhận frontend-developer, rồi code-reviewer, code-analyst, ux-designer); không có kiểm chứng độc lập
- checkpoint_evidence: N/A
- quality_gate_results: QG-01=PASS; QG-02=PASS; QG-03=PASS; QG-04=PASS; QG-05=PASS
- quality_gate_evidence: QG-01 -> code-reviewer, `src/theme/theme.ts` (`resolveTheme`, `storedTheme`, `systemTheme`), `src/theme/ThemeProvider.tsx` (`readInitialTheme`), `index.html`: lần từng dòng bảng: lưu `dark` hoặc `light` → trả giá trị đó (`isTheme`), bất kể hệ điều hành; không có, giá trị khác (`purple`), hoặc `getItem` ném lỗi → `storedTheme()` trả null rồi `systemTheme()`: tối → `dark`, sáng → `light`; `window.matchMedia` thiếu hoặc ném lỗi → `catch` trả `light`. Script nội tuyến trong `<head>` (chạy đồng bộ, trước `<script type="module">` ở cuối `<body>`) dùng cùng quy tắc và đặt `data-theme`; provider khởi tạo từ `document.documentElement.dataset.theme` nên lần render đầu cùng theme; không có script (test) thì `resolveTheme()` cho cùng kết quả. Đo trong trình duyệt bằng đầu dò `PerformanceObserver` (`T05/20261016-235348`): `data-theme` được đặt tại 0,3–0,6 s, trước first-paint 0,75–1,3 s, giá trị tại first-paint bằng giá trị đã lưu, chỉ một giá trị được ghi nhận (không đổi giữa chừng), nền tại first-paint đúng màu (`rgb(16, 38, 31)` ở dark); lần chụp cuối (`T05/20261017-000207`) cho cùng kết quả ở cả 8 trạng thái; giả lập hệ điều hành tối không lưu → `dark`, lưu `light` → `light`. QG-02 -> code-reviewer, `src/components/Header.tsx`, `ThemeProvider.tsx`: bấm nút → `toggleTheme` → `setTheme`: đặt `hasChoice`, thêm lớp `theme-switching`, `setThemeState` trước rồi `setItem` trong `try/catch` (ghi lỗi không chặn đổi, không báo lỗi); layout effect đặt `data-theme` và `<meta name="theme-color">` đọc từ `--color-bg`. Đo thật: sau bấm `data-theme` dark, `color-scheme` dark, `meta` `#10261F`, localStorage `dark`, lớp `theme-switching` gỡ sau 300ms, chuyển màu 0,25s và 0s khi giảm chuyển động; đổi hệ điều hành sang sáng sau khi đã lưu `dark` → vẫn `dark`. Listener `prefers-color-scheme` do `subscribeToSystemTheme` trả hàm gỡ, `useEffect` trả hàm đó nên gỡ khi unmount; chỉ khi `hasChoice` sai mới `setThemeState`. Chỉ `ThemeProvider` có `useState<Theme>`; `Header` đọc qua `useTheme`. Nút: `<button type="button">`, tên truy cập `switchToDark|switchToLight` theo theme và ngôn ngữ, icon `aria-hidden="true"`, hộp 48×48px đo được, vòng focus `:focus-visible` 2px `--color-accent-text` (đo `solid 2px rgb(162, 31, 42)` sáng và `rgb(255, 138, 107)` tối; tỉ số 5,06–7,49). Test đối chiếu FUT: 6 test của `theme.test.tsx` truy về REQ-01, REQ-02, khẳng định thuộc tính `data-theme`, khóa lưu, tên nút (từ bảng chuỗi), không khóa chi tiết cài đặt, mỗi test dọn localStorage, thuộc tính và mock. QG-03 -> code-analyst, `src/styles/variables.css`, `src/**/*.css`: script đối chiếu: hai khối theme đều 17 token, cùng tập; giá trị đúng bảng REQ-03 ở 33/34 giá trị, khác 1: `--color-footer-bg` tối `#0F261F` (xem role_work, bảng gốc `#0E241D` có độ sáng 9,80% vi phạm "nền tối ≥ 10%"); không màu viết thẳng ngoài `variables.css` (3 dòng khớp regex là `white-space`), không tham chiếu token đã bỏ, không tham chiếu token chưa khai báo, không `style` màu nội tuyến trong `src/**/*.tsx`; 62 màu (31 mỗi theme, gồm các điểm dừng của `--gradient-flame`) không thuộc nhóm cấm nào (xanh dương/xanh nước biển, đen, vàng-nâu); độ sáng nền tối: bg 10,59%, surface 14,31%, raised 18,24%, footer-bg 10,39%; không còn `#3860BE`, `#141413`, `rgba(0, 0, 0`. QG-04 -> ux-designer, ảnh `T05/20261017-000207` (44 ảnh), bảng token, số đo: ở 2 theme × `en`/`vi` × 1280×800/360×800: mọi section và footer dùng màu theme đang chọn (đã xem ảnh toàn trang sáng, tối, đầu trang, cuối trang, menu mở, header đã cuộn), grep không còn màu kem/đen cũ; mọi cặp chữ/nền đã dùng đạt tỉ số (script, 23 cặp mỗi theme): chữ 4,5:1 (thấp nhất tối: `--color-accent-text` trên `--color-surface-raised` 5,06; `--color-on-accent` trên `--color-accent` 5,31; sáng: `--color-text-muted` trên raised 6,18), icon, viền điều khiển và vòng focus ≥ 3:1 (viền nút tròn 55% chữ: 3,92 sáng, 4,75 tối); `--color-ember` chỉ ở trang trí (grep: thanh thẻ thành tích, đường timeline, chấm danh sách, vòng ảnh), không có chữ trên `--gradient-flame` (chưa dùng ở CSS nào). Ở 1280: 6 mục điều hướng và nút theme trên một hàng trong viên thuốc, không chồng khối tên (logo [72,298], liên kết [404,1053], nút theme [1160,1208], viên thuốc [24,1256], cả hai ngôn ngữ). Ở 360: logo [48,160], nút theme [200,248], nút menu [264,312] trong viên thuốc [24,336], không chồng nhau, `en` và `vi`; menu mở đủ 6 mục và nút đóng; vòng focus thấy rõ ở hai theme; không cuộn ngang ở 1280. Điểm không đạt có từ trước, không do diff: cuộn ngang 360×800 (426/360, `span.orbit`, GAP-07), tràn hàng liên kết ở 768–1023px (GAP-08, đo ở baseline). Điểm không đạt do diff đã sửa trong lượt: nút theme nhô ra viên thuốc ở 1024–1066px (đo: trước diff liên kết kết thúc 917 < 1000; sau diff nút kết thúc 1043 > 1000; sau sửa gap 995 ≤ 1000). QG-05 -> code-analyst, `docs/DESIGN.md`, `docs/RESPONSIVE.md`, `docs/UPDATE_SUMMARY.md`, `src/styles/variables.css`, `DOCUMENTATION_COMPLETE.md`, `.agents/llm-docs/repos/Portfolio.md`: script đối chiếu 28 dòng bảng token của `DOCUMENTATION_COMPLETE.md` và 15 dòng của `docs/DESIGN.md` với `variables.css`: 0 sai lệch, mọi mã hex trong hai tài liệu là giá trị token, mọi tên token có trong `variables.css`; `docs/DESIGN.md`: tiêu đề "Sơn Đầu Hỏa Design System", mục 1, 2 viết lại với bảng hai theme, bảng ngũ hành, quy tắc tương phản (số đo khớp script), quy tắc gradient, mục 10 theme khớp provider và script (thứ tự chọn, `data-theme`, nút, `meta theme-color`, 250ms, giảm chuyển động); grep `Mastercard|Signal Orange|Link Blue|Canvas Cream|cream|#141413` = 0 trong `docs/DESIGN.md`; nội dung font của T04 giữ nguyên (chỉ bỏ câu nêu tên font độc quyền cũ); `docs/RESPONSIVE.md` không còn `--color-lifted` hay tên hệ cũ; ghi chú đầu `docs/UPDATE_SUMMARY.md`, chú thích đầu `variables.css` nêu "Sơn Đầu Hỏa"; `DOCUMENTATION_COMPLETE.md` hai ngôn ngữ nêu đúng tính năng, bảng màu hai theme, `src/theme/` trong cây và bảng thư mục; tài liệu ngữ cảnh: Kiến trúc nêu `src/theme/`, `data-theme`, khóa `portfolio_theme`, mục layout nêu theme và cách đặt, dòng `docs/DESIGN.md` khớp
- layout_verification: đã chụp. Chiều: theme `light`/`dark` (đặt qua localStorage `portfolio_theme`, thêm giả lập `prefers-color-scheme: dark` có và không có lựa chọn đã lưu) × ngôn ngữ `en`/`vi` × khổ 1280×800 và 360×800. Số ảnh: 44 ở lần chụp cuối (đầu trang, toàn trang, cuối trang, header đã cuộn, vòng focus của nút theme, menu mở ở 360); ba lần chụp trước là CSS cũ hơn hoặc script chụp lỗi (đầu dò first-paint) nên không dùng làm bằng chứng. Kiểm đạt: như QG-04 ở trên; `<html lang>`, tiêu đề tab, `data-theme` đúng ở mọi trạng thái; theme đã áp trước first-paint; menu 360 đủ 6 mục và nút đóng/Đóng. Không đạt có từ trước: cuộn ngang 360×800 (426/360, GAP-07); tràn hàng liên kết 768–1023px (GAP-08); lỗi console 404 `/vite.svg`. Thư mục: `.tmp/layout-snapshots/portfolio-gaps_20261014-233844/T05/20261017-000207` (cuối, kèm `nav-measure-*.txt`, `header-geometry-phones.txt`), `.../20261016-235556` (kiểm hệ điều hành), `.../20261016-235348`, `.../20261016-235116`
- repair_closure_evidence: N/A
- root_cause_revalidation: N/A
- review_item_disposition: N/A
- role_challenge_results: frontend-developer=PASS (tự phản biện: bẫy chuyển theme khi đã lưu so với theo hệ điều hành, StrictMode chạy lại effect, kiểm hộp bao ở khổ trung gian bắt được hồi quy 1024px, mặt nạ `.orbit` còn `black`; không còn nghi vấn mở nhưng có ba quyết định ngoài chữ Plan cần người dùng xác nhận); code-reviewer=PASS (QG-01, QG-02, test với FUT; không tìm thấy đường làm theme sai hay ghi lỗi chặn đổi); code-analyst=PASS (QG-03 với độ lệch footer-bg nêu trên, QG-05); ux-designer=PASS (QG-04; điểm do diff đã sửa trong một lần)
- residual_risk: Kiểm chứng là tự thực hiện, không có phản biện độc lập. Plan T05 tự mâu thuẫn ở `--color-footer-bg` tối (giá trị bảng `#0E241D` có độ sáng 9,80% so với ngưỡng 10%): QG-03 PASS chỉ với giá trị `#0F261F` đã đổi, cần người dùng chọn giữ giá trị này hoặc nới ngưỡng; ở theme tối footer gần như trùng màu nền trang. Dòng phụ của logo ẩn dưới 480px (thông tin vẫn hiện ở hero ngay bên dưới). GAP-08: ở 768–1023px hàng liên kết tiếng Anh tràn viên thuốc từ trước và nút theme nằm ngoài viên thuốc ở khổ này, chưa sửa vì cần đổi ngưỡng hamburger (Plan cấm đổi bố cục). `--color-violet`, `--color-jade`, `--gradient-flame` đã khai báo nhưng chưa có nơi dùng cho tới T06. Việc build và chạy ứng dụng nghiệm thu thuộc giai đoạn của người dùng
- review_handoff: file Plan này; thay đổi chưa commit trong `.repos/Portfolio` (nhánh `develop`, HEAD `a50912c`) và `.agents/llm-docs/repos/Portfolio.md` ở Hub; không có report nguồn
- role_selection_source: plan
- effective_implementation_roles: frontend-developer
- Next allowed owner/layer: Implement T06 (đã được người dùng giao cùng yêu cầu; T04, T05 đã `implemented`), hoặc Review T05 khi người dùng yêu cầu
- Authorization condition: Review chỉ chạy khi người dùng yêu cầu
1. Implement T06 trong `.agents/plan/portfolio-gaps_20261014-233844/06-plan-typography-cards-accents-20261014-233844.md`
