---
schema: pirl-plan/v1
content_language: vi
plan_set: portfolio-gaps_20261014-233844
task_id: T07
title: "Hiệu ứng chuyển động: nền đốm lửa, chữ hero, viền sáng, hiện khi cuộn, header mờ kính"
layer: implement
status: planned
depends_on: [T05, T06]
created_at: "2026-10-15T00:24:01+07:00"
target_repo: ".repos/Portfolio"
source_request: "Đổi sang font hỗ trợ tiếng Việt; lập Plan cho các gap mới phát hiện; cải thiện UI/UX đẹp mắt, công nghệ, sang trọng"
planning_roles: [business-analyst, code-analyst, solution-architect, ux-designer]
implementation_roles: [frontend-developer]
verification_roles: [code-reviewer, ux-designer, code-analyst]
---

# T07: Hiệu ứng chuyển động: nền đốm lửa, chữ hero, viền sáng, hiện khi cuộn, header mờ kính

## Cần làm gì

Người dùng chọn mức "Nhiều hiệu ứng"; mô tả lựa chọn đã thấy: "Thêm nền động (lưới hoặc hạt sáng), chữ hero hiện dần từng ký tự, viền sáng chạy quanh thẻ. Vẫn tắt khi bật giảm chuyển động." Sau đó người dùng chọn giữ thêm "Hiện dần khi cuộn" và "Header mờ kính", bỏ "Vòng chân dung xoay, quầng sáng hero" và "Hiệu ứng nhỏ khi di chuột".

- REQ-01 | Nguồn: người dùng chọn nền động "hạt sáng". Agent quyết (căn cứ: chủ đề Sơn Đầu Hỏa của T05): hình ảnh "đốm lửa bay lên", mật độ, độ mờ, kích thước | Yêu cầu: Nền động "đốm lửa":
  - Một `<canvas>` cố định phủ khung nhìn, nằm sau nội dung, `pointer-events: none`, `aria-hidden`.
  - Các đốm tròn 1–2.5px bay lên chậm, lắc ngang nhẹ, nhấp nháy. Màu lấy từ `--color-accent`, `--color-ember`, `--color-violet` của theme đang dùng; đọc lại khi đổi theme. Độ mờ mỗi đốm ≤ 0.35.
  - Số đốm = `min(60, round(rộng × cao khung nhìn / 24000))`. Tỉ lệ điểm ảnh tối đa 2.
  - Chỉ một vòng `requestAnimationFrame`; dừng khi tab ẩn (`document.hidden`) và chạy lại khi hiện; tính lại kích thước sau khi resize (debounce 150ms). Hủy vòng lặp và listener khi unmount.
  - Không lấy được context 2D thì không vẽ, không ném lỗi.
- REQ-02 | Nguồn: người dùng chọn "chữ hero hiện dần từng ký tự". Agent quyết: phần tử áp dụng (họ tên), thời lượng, cách giữ tên truy cập | Yêu cầu: `h1` họ tên trong `Personal` hiện từng ký tự một lần khi tải trang: mỗi ký tự từ mờ và lệch xuống 0.4em về vị trí, cách nhau 35ms, tổng ≤ 1s. Sau đó dòng chức danh và đoạn giới thiệu hiện dần nối tiếp. Tên truy cập của `h1` vẫn là họ tên đầy đủ: ký tự tách rời có `aria-hidden`, kèm một bản chữ đầy đủ chỉ dành cho trình đọc màn hình. Khoảng trắng giữ đúng. Đổi ngôn ngữ hay theme không chạy lại hiệu ứng.
- REQ-03 | Nguồn: người dùng chọn "viền sáng chạy quanh thẻ". Agent quyết: chỉ chạy khi hover/focus, tốc độ, nhánh dự phòng | Yêu cầu: Khi hover hoặc focus bên trong một thẻ (danh sách thẻ ở REQ-02 của T06), một viền sáng `conic-gradient` màu `--color-accent` → `--color-ember` → `--color-violet` chạy quanh thẻ, mỗi vòng 3s, lặp khi còn hover/focus. Góc quay dùng `@property`. Trình duyệt không hỗ trợ `@property` thì hiện viền chuyển màu tĩnh của T06. Vòng quanh ảnh chân dung giữ tĩnh như T06.
- REQ-04 | Nguồn: người dùng chọn giữ "Hiện dần khi cuộn"; mô tả lựa chọn đã thấy: "Tiêu đề section và thẻ mờ rồi trồi lên khi cuộn tới. Nội dung chưa cuộn tới sẽ tạm ẩn; luôn hiện ngay khi bật giảm chuyển động hoặc trình duyệt không hỗ trợ." Agent quyết: ngưỡng, độ dời, độ trễ | Yêu cầu:
  - Header (eyebrow + `h2`) và từng thẻ của mỗi section hiện bằng mờ → rõ và dịch `translateY(24px)` → 0 khi ≥ 15% phần tử vào khung nhìn. Mỗi phần tử chỉ chạy một lần. Thẻ trong cùng lưới trễ nhau 80ms, tối đa 6 bậc.
  - Phần tử đã nằm trong khung nhìn lúc tải hiện ngay theo cùng hiệu ứng.
  - Nội dung không bao giờ bị ẩn vĩnh viễn: trạng thái ẩn chỉ được gắn khi có `IntersectionObserver` và chuyển động được phép. Thiếu một trong hai thì mọi phần tử hiển thị ngay. Nhảy tới section qua liên kết điều hướng thì section đó hiện.
  - Dùng lại `src/hooks/useInViewport.ts` hoặc thay nó; hook đó tại `a50912c` chưa có nơi dùng.
- REQ-05 | Nguồn: người dùng chọn giữ "Header mờ kính"; mô tả lựa chọn đã thấy: "Khi đã cuộn, header thành nền trong mờ có làm nhòe phía sau." Agent quyết: độ trong, độ nhòe, nhánh dự phòng | Yêu cầu: Khi trang đã cuộn (`isScrolled` của `Header`), nền header chuyển sang `--color-surface` pha trong suốt khoảng 72%, kèm `backdrop-filter: blur(16px) saturate(140%)` và viền dưới `--color-border`. Trình duyệt không hỗ trợ `backdrop-filter` (`@supports`) thì dùng nền đặc `--color-surface`. Chữ điều hướng vẫn đạt tương phản của T05 REQ-05 trên nền này.
- REQ-06 | Nguồn: người dùng: "Vẫn tắt khi bật giảm chuyển động" | Yêu cầu: Khi `prefers-reduced-motion: reduce` (đọc lúc tải và theo dõi thay đổi):
  - Component nền không render `<canvas>`.
  - `h1` hiện đầy đủ ngay; viền thẻ không quay (viền tĩnh khi hover vẫn có).
  - Phần tử hiện-khi-cuộn hiển thị ngay; `scroll-behavior` là `auto`.
  - Mọi `animation` và `transition` còn lại có thời lượng ≈ 0.
- REQ-07 | Nguồn: agent suy ra: nhiều hiệu ứng chạy cùng lúc trên điện thoại | Yêu cầu: Hiệu ứng CSS chỉ animate `transform`, `opacity` và biến góc của `@property`; không animate `top`, `left`, `width`, `height`, `margin`, `padding`. Mỗi hiệu ứng JS có một nguồn lịch (một vòng `requestAnimationFrame` cho nền; `IntersectionObserver` dùng chung hoặc mỗi section một cái) và được dọn khi unmount. Ngưỡng hiệu năng đo trên thiết bị thật thuộc giai đoạn build/test/release của người dùng.
- REQ-08 | Nguồn: agent quyết theo quy tắc giao tài liệu theo thay đổi: mọi đoạn nêu token, file hay component mà task này thêm, đổi hoặc bỏ | Yêu cầu: Sau task, các đoạn sau khớp source:
  - `docs/DESIGN.md`: mục mới "Motion & Effects" nêu token thời lượng/easing, từng hiệu ứng ở REQ-01..REQ-05 và quy tắc REQ-06; sửa câu nhắc chuyển động hoặc `--transition-*` ở mục khác.
  - `variables.css`: token chuyển động (`--motion-fast` 150ms, `--motion-base` 250ms, `--motion-slow` 600ms, `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`), thay token `--transition-*` cũ ở mọi chỗ dùng.
  - Mọi đoạn trong `docs/RESPONSIVE.md`, `DOCUMENTATION_COMPLETE.md` (cả hai ngôn ngữ) nêu `--transition-*`.
  - `DOCUMENTATION_COMPLETE.md` (cả hai ngôn ngữ): danh sách tính năng thêm hiệu ứng và việc tôn trọng "giảm chuyển động"; bảng "Tham Khảo Components" thêm dòng `EmberBackground`; cây "Cấu Trúc Dự Án" thêm `EmberBackground.tsx` và hook mới trong `src/hooks/`.
  - Tài liệu ngữ cảnh mục "Kiểm chứng layout bằng mock": chụp trạng thái tĩnh với giả lập `prefers-reduced-motion: reduce` để ảnh ổn định, cộng ảnh riêng cho từng hiệu ứng không giảm chuyển động (hero sau khi hiện xong, thẻ đang hover có viền sáng, header đã cuộn), ghi rõ ảnh nào là khung hình giữa hiệu ứng.
- Hợp đồng đã chốt khi lập Plan (vai trò `solution-architect`, người điều phối tự thực hiện; agent quyết, căn cứ source):
  - Hook mới `src/hooks/useReducedMotion.ts` trả trạng thái giảm chuyển động hiện tại, theo dõi thay đổi, mặc định `false` khi không có `matchMedia`. Mọi hiệu ứng JS dùng hook này.
  - Component nền mới `src/components/EmberBackground.tsx` (+ `.module.css`), render một lần trong `src/App.tsx`, đọc theme qua hook của T05.
  - Hiện-khi-cuộn dùng một hook trong `src/hooks/` gắn qua thuộc tính/class trên phần tử, không bọc lại cấu trúc section.
  - Không thêm thư viện animation.
- Phạm vi: không đổi màu, font, thang chữ, độ sâu tĩnh (T04–T06), bố cục, nội dung. Không làm vòng chân dung xoay, quầng sáng hero, gạch chân chạy hay vệt sáng CTA (người dùng đã bỏ).
- Đường dẫn được phép sửa: `src/App.tsx`; file mới `src/components/EmberBackground.tsx`, `src/components/EmberBackground.module.css`; `src/hooks/` (sửa `useInViewport.ts`, thêm hook mới); `src/theme/` (chỉ thay token `--transition-*` nếu có); các `src/components/*.tsx` cần gắn hiện-khi-cuộn hoặc tách ký tự hero; `src/styles/variables.css` (token chuyển động), `src/styles/global.css`, `src/index.css`, `src/App.module.css`, mọi `src/components/*.module.css`; test: file mới `src/components/EmberBackground.test.tsx`, `src/hooks/useInViewport.test.tsx` (hoặc tên theo hook hiện-khi-cuộn); tài liệu: `docs/DESIGN.md`, `docs/RESPONSIVE.md`, `DOCUMENTATION_COMPLETE.md` (các đoạn ở REQ-08); ở Hub: `.agents/llm-docs/repos/Portfolio.md`.
- Kết quả riêng của task: các hiệu ứng REQ-01..REQ-05 chạy khi chuyển động được phép và tắt đúng REQ-06; nội dung luôn đọc được.

## Làm như thế nào

Đầu vào từ T06: hệ độ sâu, viền chuyển màu tĩnh của thẻ, vòng chân dung `--gradient-flame`. Từ T05: hook theme, token màu, chuyển màu khi đổi theme. Thiếu đầu vào thì dừng.

1. ROLE-01 (`frontend-developer`) viết `useReducedMotion` và token chuyển động; thay `--transition-*` ở mọi chỗ dùng; thêm quy tắc `prefers-reduced-motion` toàn cục (REQ-06).
2. ROLE-01 làm `EmberBackground` theo REQ-01, REQ-07 và gắn vào `App.tsx`.
3. ROLE-01 tách ký tự `h1` hero theo REQ-02; làm viền sáng (REQ-03), hiện-khi-cuộn (REQ-04), header mờ kính (REQ-05).
4. ROLE-01 viết test theo FUT cho REQ-02, REQ-04, REQ-06, rồi chạy:
   - `EmberBackground.test.tsx`: giảm chuyển động → không có `<canvas>`; không giảm chuyển động và `getContext` trả `null` (jsdom) → render không ném lỗi.
   - Test của hook hiện-khi-cuộn: không có `IntersectionObserver` → phần tử ở trạng thái hiển thị; giảm chuyển động → hiển thị ngay.
   - `Personal.test.tsx` hiện có đã khẳng định tên truy cập `h1` là họ tên (REQ-02); giữ nguyên.
   - Chạy từ `.repos/Portfolio`: `npx vitest run --pool=forks src/components/EmberBackground.test.tsx src/hooks/useInViewport.test.tsx src/components/Personal.test.tsx src/App.test.tsx` cùng test hiện có của component khác mà diff đổi markup (`Header.test.tsx`, `Projects.test.tsx` nếu có).
5. ROLE-01 cập nhật tài liệu REQ-08; quét `docs/`, `DOCUMENTATION_COMPLETE.md` và tài liệu ngữ cảnh theo `--transition-`, tên component và thư mục mới.
6. ROLE-02 (`code-reviewer`) kết luận QG-01, QG-02 và đối chiếu test với FUT trên diff.
7. ROLE-03 (`ux-designer`), sau khi ROLE-01 chụp layout theo router và hướng dẫn mới của tài liệu ngữ cảnh, kết luận QG-03 từ ảnh và source hiển thị.
8. ROLE-04 (`code-analyst`) kết luận QG-04 bằng đối chiếu tài liệu với source.

Bước tiếp theo: người dùng chỉ định file Plan này để Implement sau khi T05 và T06 đã `implemented`; Implement chỉ thực hiện T07 trong phạm vi trên.

## Vai trò tham gia

- ROLE-01 | Loại: triển khai | Vai trò: frontend-developer | Phụ trách: mọi hiệu ứng REQ-01..REQ-07, test bước 4, tài liệu, chụp layout theo router | Đầu vào: kết quả T05, T06, Plan này | Hoàn tất khi: REQ-01..REQ-08 có source/tài liệu/test trong diff; test bước 4 đã chạy và được giải thích; `layout_verification` có lần chụp đạt
- ROLE-02 | Loại: kiểm chứng | Vai trò: code-reviewer | Phụ trách: QG-01, QG-02, test so với FUT | Đầu vào: diff và tuyên bố của ROLE-01 | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-01, QG-02 kèm đường đã lần, phản ví dụ, nguồn
- ROLE-03 | Loại: kiểm chứng | Vai trò: ux-designer | Phụ trách: QG-03 | Đầu vào: ảnh và bảng kết quả layout, source hiển thị | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-03 kèm ảnh đã xem, phản ví dụ, nguồn
- ROLE-04 | Loại: kiểm chứng | Vai trò: code-analyst | Phụ trách: QG-04 | Đầu vào: diff của ROLE-01 | Hoàn tất khi: PASS/FAIL/BLOCKED cho QG-04 kèm khẳng định đã đối chiếu, nguồn
- Lập Plan | Vai trò: business-analyst, code-analyst, solution-architect, ux-designer | Cách thực hiện: người điều phối tự thực hiện lần lượt; không có phản biện độc lập

## Tiêu chí chất lượng bắt buộc

- QG-01 | Yêu cầu: REQ-01, REQ-06, REQ-07 | Logic bắt buộc: Lần `EmberBackground` theo bảng:

  | Tình huống | Kết quả bắt buộc |
  | --- | --- |
  | Giảm chuyển động lúc mount | Không render `<canvas>`, không có vòng lặp |
  | Đang chạy rồi bật giảm chuyển động | Vòng lặp bị hủy, `<canvas>` bị gỡ |
  | Tắt giảm chuyển động | Vòng lặp chạy lại |
  | `getContext('2d')` trả `null` | Không vẽ, không ném lỗi, không có vòng lặp |
  | `document.hidden` chuyển `true` / `false` | Dừng / chạy lại, không tạo vòng lặp thứ hai |
  | Resize | Kích thước và số đốm tính lại theo công thức REQ-01, sau debounce |
  | Đổi theme | Màu đốm lấy theo token của theme mới |
  | Unmount | Hủy `requestAnimationFrame`, gỡ mọi listener |

  `<canvas>` có `aria-hidden`, `pointer-events: none`, nằm sau nội dung. Độ mờ đốm ≤ 0.35. Hiệu ứng CSS chỉ animate các thuộc tính cho phép ở REQ-07.
- QG-02 | Yêu cầu: REQ-02, REQ-03, REQ-04, REQ-05, REQ-06 | Logic bắt buộc:
  - Tên truy cập của `h1` hero là họ tên đầy đủ ở mọi thời điểm; ký tự tách rời có `aria-hidden`; đổi ngôn ngữ/theme không chạy lại hiệu ứng.
  - Hiện-khi-cuộn: trạng thái ẩn chỉ gắn khi có `IntersectionObserver` và chuyển động được phép; mỗi phần tử chuyển sang hiển thị khi ≥ 15% vào khung nhìn và không ẩn lại; observer được ngắt khi unmount.
  - Viền sáng chỉ chạy khi `:hover`/`:focus-within`; có nhánh không hỗ trợ `@property`; vòng chân dung không quay.
  - Header mờ kính có nhánh `@supports` dự phòng.
  - Mọi nhánh của REQ-06 tắt đúng hiệu ứng tương ứng, kể cả khi trạng thái giảm chuyển động đổi lúc trang đang mở.
- QG-03 | Yêu cầu: REQ-01..REQ-06 | Logic bắt buộc: Từ ảnh:
  - Ảnh tĩnh (giảm chuyển động) ở `light`/`dark` × `en`/`vi` × 1280/360: mọi nội dung hiển thị đủ, không phần tử nào còn mờ/lệch, không có canvas, không cuộn ngang.
  - Ảnh hiệu ứng: đốm lửa nằm sau nội dung và không che chữ; hero hiện đủ họ tên sau hiệu ứng; thẻ đang hover có viền sáng; header đã cuộn có nền mờ kính và chữ điều hướng đọc được ở cả hai theme.
  - Mỗi điểm không đạt được so với ảnh trước khi có diff.
- QG-04 | Yêu cầu: REQ-08 | Logic bắt buộc: Mục "Motion & Effects" của `docs/DESIGN.md` nêu đúng token, thời lượng, điều kiện chạy và quy tắc giảm chuyển động khớp source. Không còn `--transition-*` trong `src/`, `docs/`, `DOCUMENTATION_COMPLETE.md`. Bảng "Tham Khảo Components" có dòng `EmberBackground`; cây "Cấu Trúc Dự Án" có `EmberBackground.tsx` và hook mới (cả hai ngôn ngữ); danh sách tính năng và mục "Kiểm chứng layout bằng mock" của `.agents/llm-docs/repos/Portfolio.md` khớp REQ-08.
