---
schema: pirl-review/v1
content_language: vi
plan_file: ".agents/plan/portfolio-gaps_20261014-233844/07-plan-motion-effects-20261014-233844.md"
task_id: T07
review_round: 1
prior_review: null
review_roles: [code-analyst, code-reviewer, business-analyst, solution-architect, ux-designer]
repair_roles: []
business_verdict: PASS
verdict: PASS
status: completed
reviewed_at: "2026-10-17T13:02:00+07:00"
implementation_target: ".repos/Portfolio commit 745f1aa (a50912c..745f1aa, một commit gồm cả T01–T07) và Hub e079707; tự thực hiện (mode: self), không có phản biện độc lập"
---

# Review 01: T07 — Hiệu ứng chuyển động: nền đốm lửa, chữ hero, viền sáng, hiện khi cuộn, header mờ kính

Phạm vi snapshot: bảy task T01–T07 nằm chung commit `745f1aa`, không có diff riêng từng task. Review kết luận từng QG bằng lập luận trên source; không chạy test, trình duyệt hay script, và không lấy kết quả test trong Implementation Record làm bằng chứng. Ảnh dùng cho QG-03 là ảnh của lượt Implement.

## Business

### Quality gates

| QG | Kết quả | Bằng chứng |
| --- | --- | --- |
| QG-01 | PASS | Lần `src/components/EmberBackground.tsx` theo từng hàng của bảng QG.<br>(1) Giảm chuyển động lúc mount: `reduced` lấy từ `useState(readReducedMotion)`; effect có `if (reduced) return undefined` trước `getContext`; render `if (reduced) return null` → không `<canvas>`, không vòng lặp.<br>(2) Đang chạy rồi bật giảm: listener `change` trong `useReducedMotion` gọi `setReduced(true)` → render `null` gỡ canvas; cleanup của effect gọi `stop()` (`cancelAnimationFrame`), `clearTimeout(resizeTimer)`, gỡ hai listener.<br>(3) Tắt giảm: render lại canvas, effect chạy lại (`getContext`, `resize()`, `start()`), `start` có chốt `if (frame) return` nên chỉ một vòng.<br>(4) `getContext('2d')` trả `null`: `if (!canvas \|\| !context) return undefined` → không `resize`, không `start`, không listener; canvas còn trong DOM nhưng trống, không ném lỗi.<br>(5) `visibilitychange`: `document.hidden ? stop() : start()`; `stop` đặt `frame = 0`, `start` có chốt nên sự kiện lặp không tạo vòng thứ hai; tab đã ẩn từ đầu thì `if (!document.hidden) start()` không chạy.<br>(6) Resize: `onResize` debounce `RESIZE_DEBOUNCE_MS` = 150 → `resize()` đặt kích thước canvas = `round(inner × min(devicePixelRatio, 2))`, co giãn `x` của đốm, số đốm = `min(60, round(rộng × cao / 24000))` (43 ở 1280×800, 12 ở 360×800).<br>(7) Đổi theme: `useEffect(() => { paletteRef.current = readPalette() }, [theme, reduced])` chạy trong nhóm passive effect, sau mọi layout effect nên sau khi `ThemeProvider` đặt `data-theme`; `draw` đọc `paletteRef.current` từ `--color-accent`, `--color-ember`, `--color-violet`.<br>(8) Unmount: cleanup hủy `requestAnimationFrame`, timer và hai listener.<br>Thuộc tính: `aria-hidden="true"`; `.canvas` `position: fixed; inset: 0; z-index: 0; pointer-events: none`; `.container` `position: relative; z-index: 1` nên canvas nằm sau nội dung; độ mờ = `MAX_ALPHA` (0,35) × nhấp nháy (≤ 1) × `edge` (≤ 1) ≤ 0,35; bán kính `1 + Math.random() * 1.5` = 1–2,5px.<br>CSS chỉ animate thuộc tính cho phép: bốn `@keyframes` (`reveal-up`, `nameCharIn`, `heroTextIn`, `glow-spin`) chỉ đổi `opacity`, `transform` hoặc `--glow-angle`; `transition` trong `src/**/*.css` không có `all`, `width`, `height`, `margin`, `padding`, `top`, `left`.<br>Phản ví dụ đã xét: StrictMode (effect mount, cleanup, mount) — biến `frame`, `embers` là cục bộ theo từng lần chạy effect và cleanup đã hủy lần đầu, nên chỉ một vòng; resize khi tab ẩn chỉ tính lại kích thước, không bắt đầu vòng; đọc màu trước khi `data-theme` được đặt — không xảy ra vì passive effect chạy sau layout effect của provider cha. Không còn phản ví dụ mở. |
| QG-02 | PASS | Hero: `Personal.tsx` `h1` chứa `<span className={styles.srOnly}>{personalInfo.fullName}</span>` và `<span aria-hidden="true">` bọc các ký tự, nên tên truy cập luôn là họ tên đầy đủ; `fullName` là `string` không phụ thuộc ngôn ngữ, DOM của `h1` không đổi khi đổi ngôn ngữ hay theme và hoạt ảnh CSS không chạy lại khi nội dung thẻ khác đổi (`.intro` chỉ đổi văn bản trong cùng phần tử). Thời gian: bước `min(35ms, 400ms / (số ký tự − 1))` = 35ms, ký tự cuối bắt đầu ở 350ms, mỗi ký tự 500ms nên tổng 850ms ≤ 1s; chức danh trễ 700ms, đoạn giới thiệu trễ 850ms.<br>Hiện-khi-cuộn: `useReveal` chỉ đặt `pending` khi có `IntersectionObserver` và `reduced` sai (nhánh còn lại đặt `done` ngay); ngưỡng 0,15; khi giao cắt `unobserve` rồi đặt `shown` chỉ nếu đang `pending` (báo cáo đến muộn không chạy lại); `done` đặt khi `animationend` hoặc `animationcancel` của chính phần tử có tên `reveal-up`; cleanup ngắt observer và gỡ listener; trễ `min(chỉ số trong cùng phần tử cha, 5) × 80ms`. Phản ví dụ: thẻ vừa `shown` đang bị hover — `[data-card]:hover` thay `animation` bằng `glow-spin`, `reveal-up` bị hủy, `animationcancel` đặt `done`, nội dung không kẹt ở trạng thái ẩn; liên kết điều hướng nhảy tới section — phần tử vào khung nhìn nên được quan sát và hiện.<br>Viền sáng: `[data-card]:hover, [data-card]:focus-within` trong `global.css`, `@property --glow-angle`, `conic-gradient(from var(--glow-angle, 0deg), …)` nên khai báo vẫn hợp lệ khi không có `@property`; `.orbit` không có `animation`.<br>Header kính: `.nav::before` mang nền 72%, `backdrop-filter` và viền dưới; `.nav` không có filter nên menu mobile `position: fixed` không bị nhốt; nhánh `@supports not (…)` trả nền đặc `--color-surface`.<br>Giảm chuyển động (khối cuối `global.css` và `useReducedMotion`, theo dõi `change`): không canvas; `[data-reveal-state]` hiện ngay; mọi `animation`/`transition` còn lại 0,01ms; `scroll-behavior: auto`; viền thẻ giữ gradient tĩnh. |
| QG-03 | PASS | Ảnh đã xem trong `T07/20261017-010446/`: `fx-hero-t300ms-light-1280.png` (khung giữa hiệu ứng: "Dang Tie" đã hiện, "n D" đang hiện, các ký tự sau và dòng chức danh chưa hiện; đốm lửa là chấm mờ phía sau, không che chữ), `fx-glow-hover-dark.png` (thẻ kinh nghiệm hover có viền sáng, chip, nhãn thời gian), `fx-header-scrolled-light-1280.png` (nền mờ kính, thẻ nhòe phía sau, chữ điều hướng đọc được), `fx-menu-open-scrolled-dark-360.png` (menu mobile khi đã cuộn phủ kín khung), `vi-dark-rm-360x800-static-bottom.png`, `en-light-rm-1280x800-static-bottom.png` (ảnh tĩnh giảm chuyển động: nội dung hiện đủ, không canvas).<br>`results.md`: ảnh tĩnh ở bốn tổ hợp theme × ngôn ngữ × 1280 không cuộn ngang; ở 360 cuộn ngang 426/360 có từ trước (GAP-07, `T01/20261016-224201/results.md`). Mỗi khung giữa hiệu ứng được ghi rõ trong `layout_verification`. |
| QG-04 | PASS | `docs/DESIGN.md` mục 11 "Motion & Effects": token `--motion-fast` 150ms, `--motion-base` 250ms, `--motion-slow` 600ms, `--ease-out-expo` `cubic-bezier(0.16, 1, 0.3, 1)` khớp `variables.css`; số đốm 43 và 12, đốm 1–2,5px, 18–50px/s (`rise: 18 + Math.random() * 32`), độ mờ ≤ 0,35, tỉ lệ điểm ảnh ≤ 2, debounce 150ms, hero 500ms/35ms/400ms/700ms/850ms, dời 0,4em và 12px, ngưỡng 15%, dời 24px, 600ms, 80ms tối đa sáu bậc, ba trạng thái, kính 72% với `blur(16px) saturate(140%)`, nhánh giảm chuyển động khớp `EmberBackground.tsx`, `Personal.tsx`, `Personal.module.css`, `useReveal.ts`, `global.css`, `Header.module.css`. grep `--transition-` và `useInViewport` trong `src/`, `docs/`, `DOCUMENTATION_COMPLETE.md` = 0. Bảng "Tham Khảo Components" và "Component Reference (EN)" đều có dòng `EmberBackground`; cả hai cây thư mục có `EmberBackground.tsx`, `useReducedMotion.ts`, `useReveal.ts`, `useReveal.test.tsx`; danh sách tính năng nêu hiệu ứng và việc tôn trọng giảm chuyển động; `.agents/llm-docs/repos/Portfolio.md` mục "Kiểm chứng layout bằng mock" nêu ảnh tĩnh với giả lập giảm chuyển động, ảnh riêng từng hiệu ứng và cách chụp khung giữa hiệu ứng. Một câu sai trong `docs/DESIGN.md` mục 11 (mọi thời lượng đọc từ token) đã được sửa trong lượt. |

Đánh giá test trong diff theo FUT (không đổi kết luận QG): `EmberBackground.test.tsx` (11 test) và `useReveal.test.tsx` (8 test) nhiều hơn hai test mà Plan bước 4 liệt kê, nhưng mỗi test truy về một hàng của QG-01 hoặc một điều của REQ-01, REQ-04, REQ-06 (công thức số đốm, độ mờ, debounce 150ms, một vòng, tab ẩn, hủy khi unmount, đọc lại màu khi đổi theme, ngưỡng 15%, bước 80ms, nhánh không `IntersectionObserver`), khẳng định hành vi quan sát được, không trùng nhau. Tên test "renders a hidden canvas that cannot take pointer events" chỉ khẳng định `aria-hidden` (phần `pointer-events` do CSS); không phải vi phạm FUT. `src/test/setup.ts` (cho `getContext` của canvas trả `null`) nằm ngoài đường dẫn được phép của Plan nhưng đã được ghi trong Implementation Record và trong record `implement-20261017-013148-T07` (`plan-fut-paths-miss-test-infrastructure`); không làm test trả kết quả sai.

### Findings

Không có FIND.

### Risks

#### RISK-01

| Trường | Nội dung |
| --- | --- |
| QG | QG-02 |
| Tác động | Người xem dùng trình duyệt chưa hỗ trợ `@property` khi hover hoặc focus thẻ thấy viền conic tĩnh (accent → ember → violet → accent), không quay, thay vì "viền chuyển màu tĩnh của T06" (`--gradient-card-border`, tuyến tính 135°, mờ dần) như REQ-03 viết. Người xem dùng trình duyệt chưa hỗ trợ `backdrop-filter` thấy header cuộn có nền đặc `--color-surface`. Cả hai nhánh chỉ được lập luận từ CSS, chưa quan sát trên trình duyệt thiếu tính năng. |
| Nguồn | `src/styles/global.css` (`@property --glow-angle`, quy tắc `[data-card]:hover, [data-card]:focus-within`, `var(--glow-angle, 0deg)`); `src/components/Header.module.css` (`@supports not (…)`); Plan T07 REQ-03, REQ-05. |
| Nguyên nhân | Khi không đăng ký `@property`, biến tùy chỉnh không nội suy nên `glow-spin` chỉ đổi rời rạc giữa `0deg` (giá trị dự phòng) và `360deg`, hai góc cho cùng một gradient: kết quả là một viền conic tĩnh, không phải viền tuyến tính của T06. |
| Phản biện | QG-02 chỉ đòi có nhánh không hỗ trợ `@property` và khai báo vẫn hợp lệ; nhánh có, thẻ giữ nền, viền vẫn là gradient tĩnh theo đúng tinh thần "hiện viền chuyển màu tĩnh". Không có căn cứ cho rằng thẻ mất nền hay nội dung bị che, nên QG đạt. |
| Vai trò | frontend-developer, ux-designer |
| Đích | `.repos/Portfolio/src/styles/global.css` |
| Chỉ dẫn | Giữ nguyên nếu viền conic tĩnh chấp nhận được. Nếu người dùng muốn đúng chữ REQ-03: `@supports` không phát hiện được `@property`, nên kiểm bằng `window.CSS && CSS.registerProperty` rồi thêm một lớp lên `<html>`, và chỉ áp quy tắc conic của `[data-card]:hover, [data-card]:focus-within` khi có lớp đó; còn lại giữ viền tuyến tính của T06. Chỉ làm khi được giao. |
| Xem lại khi | Cần hỗ trợ chính thức trình duyệt chưa có `@property`, hoặc khi người dùng yêu cầu viền dự phòng đúng chữ REQ-03. |

### Blockers

Không có BLOCK.

### Tiếp theo

| Trường | Nội dung |
| --- | --- |
| Tiếp theo | Không có việc sửa bắt buộc. RISK-01 chờ quyết định của người dùng về trình duyệt cần hỗ trợ. |

## Evaluations

### EVAL-01

| Trường | Nội dung |
| --- | --- |
| Vai trò | frontend-developer |
| Kết quả | FAIL |
| Lỗi | Implementation Record ghi đã chạy `npx tsc --noEmit` (thoát 0). Router cấm Implement build và typecheck (mục kiểm chứng bằng lập luận; mục kiểm chứng layout ghi "không backend, database, build hay typecheck"); lệnh này không phải test theo FUT hay phép chụp layout. Kết quả không được dùng làm bằng chứng QG nên sản phẩm không bị ảnh hưởng. Ghi nhận thêm, không phải lỗi: `src/test/setup.ts` sửa ngoài đường dẫn được phép đã được nêu rõ và đã có record; `.gitignore` của `.repos/Portfolio` (thêm `*.stackdump`) nằm ngoài đường dẫn được phép của cả bảy Plan, không record nào ghi lượt sửa nó, theo ghi chú công cụ chụp trong tài liệu ngữ cảnh là xử lý trở ngại môi trường; không ảnh hưởng QG. |
| Nguyên nhân | execution (`implement-ran-typecheck`): quy tắc rõ, vai trò vẫn chạy kiểm tra kiểu. |
| Cải tiến | Chờ người dùng (mode_self): FIX-04 của record Review (cột "Hoàn tất khi" của `frontend-developer` nêu rõ không build, typecheck, lint). |
| Bằng chứng | Implementation Record T07 `role_work` ("`npx tsc --noEmit` thoát 0"); router `#kiểm-chứng-bằng-lập-luận` và `#kiểm-chứng-layout-bằng-mock`; `.agents/instructions/implement.instructions.md` dòng "Implement không build". |

### EVAL-02

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-reviewer |
| Kết quả | FAIL |
| Lỗi | Kết luận QG-01 và QG-02 đúng, nhưng mỗi hàng bằng chứng nêu kết quả "(test; Chrome: …)": số đốm, debounce, màu đổi theo theme, `canvas=0`, `getImageData`, đổi `emulateMediaFeatures` khi trang mở, ghi đè `getContext` thành `null`, xóa `IntersectionObserver`. Router: chạy trình duyệt và script để nghiệm thu nằm ngoài vòng đời task (ngoại lệ chỉ cho chụp và đo layout) và kết quả test không là bằng chứng PASS/FAIL của QG; `implement.instructions.md` chỉ cho test "bổ sung cho lập luận"; Plan T07 bước 6 chỉ giao "trên diff". Các phản ví dụ vai trò tìm được bằng đọc code (chốt `if (frame) return`, báo cáo giao cắt đến muộn) là lập luận đúng; Review lập luận lại và nhận cùng kết quả. |
| Nguyên nhân | execution (`verification-evidence-from-scripts-and-runs`): quy tắc rõ, vai trò dùng test và trình duyệt làm dòng bằng chứng chính. |
| Cải tiến | Chờ người dùng (mode_self): FIX-03 của record Review. |
| Bằng chứng | `quality_gate_evidence` QG-01, QG-02 của Implementation Record T07 ("bằng test và trình duyệt thật (Chrome 155 qua puppeteer-core)"); Plan T07 `Làm như thế nào` bước 6. |

### EVAL-03

| Trường | Nội dung |
| --- | --- |
| Vai trò | ux-designer |
| Kết quả | PASS |
| Lỗi | Không có. QG-03 đứng vững trước ảnh và source; các khung giữa hiệu ứng được ghi rõ là khung giữa hiệu ứng; hai ảnh sai khung của lần thử đầu đã bị xóa và chụp lại; phân biệt đúng điểm có từ trước (GAP-07, GAP-08). |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `layout_verification` của Implementation Record T07; ảnh `T07/20261017-010446/*` đã xem. |

### EVAL-04

| Trường | Nội dung |
| --- | --- |
| Vai trò | code-analyst |
| Kết quả | PASS |
| Lỗi | Không có. QG-04 đứng vững; vai trò tự bắt và sửa một câu tài liệu sai (thời lượng đọc từ token) trước khi chốt; đối chiếu bảng component, cây thư mục và mục kiểm chứng layout khớp source. |
| Nguyên nhân | Không có |
| Cải tiến | Không cần |
| Bằng chứng | `quality_gate_evidence` QG-04; `docs/DESIGN.md` mục 11, `DOCUMENTATION_COMPLETE.md`, `.agents/llm-docs/repos/Portfolio.md`. |
