# Portfolio

Tài liệu ngữ cảnh của repo `.repos/Portfolio` cho Agent của Hub. Sản phẩm là
trang portfolio cá nhân một trang: hồ sơ, học vấn, kinh nghiệm, dự án, chứng
chỉ, thành tích. Nội dung đối chiếu với source tại commit `a50912c` (nhánh
`master`, cũng là nhánh mặc định của remote).

## Đọc trước khi làm

| Nguồn trong repo | Khi nào đọc |
| --- | --- |
| `docs/DESIGN.md` | Khi chạm giao diện: hệ thiết kế "Sơn Đầu Hỏa" với hai theme sáng/tối, khớp token theo theme trong `src/styles/variables.css` |
| `docs/RESPONSIVE.md` | Khi chạm bố cục theo khổ màn hình: ngưỡng 480/768/1024 px, chiều cao header, lưới từng section; mỗi dòng ghi file CSS nguồn |
| `AGENTS.md` | Chỉ chứa hướng dẫn chung khi triển khai lên Vercel |

`docs/UPDATE_SUMMARY.md` là hồ sơ lịch sử của đợt cập nhật theo Starbucks
Design System, không mô tả giao diện hiện tại. `DOCUMENTATION_COMPLETE.md` còn
mục lệch source (xem GAP-06); xem mục Khoảng trống đã biết trước khi dựa vào nó.

## Kiến trúc

- Trang tĩnh một trang: React 18, TypeScript (`strict`), Vite 4, CSS Modules.
  Không có router, backend hay lời gọi API; hằng `API_BASE_URL` trong
  `src/utils/constants.ts` chưa có nơi dùng.
- `src/App.tsx` xếp các section: `Header`, `Personal` (kèm `Skills`),
  `Education`, `Experience`, `Projects`, `Certifications`, `Achievements`,
  `Footer`, mỗi section một file trong `src/components/` cùng file
  `.module.css`.
- Nội dung hiển thị: nội dung hồ sơ khai báo một lần trong `src/data/` (kiểu
  trong `src/types/index.ts`); mọi component hiển thị nội dung hồ sơ đọc qua
  alias `@data`. Trường cần dịch có kiểu `LocalizedText` (`{ en, vi }`); họ
  tên, chức danh, tên công ty, dự án, chứng chỉ, công nghệ, email, số điện
  thoại, URL giữ kiểu `string`.
- Ngôn ngữ: hai ngôn ngữ `en` (mặc định) và `vi`. Chuỗi giao diện nằm trong
  `src/i18n/`: `en.ts` quyết định tập khóa, `vi.ts` khai báo theo kiểu của
  `en.ts`. `LanguageProvider` bọc cây trong `src/App.tsx`, giữ ngôn ngữ, ghi
  localStorage khóa `portfolio_language`, đặt `<html lang>` và tiêu đề tab.
  Component đọc qua `useLanguage()` (`t` cho chuỗi giao diện, `text()` cho
  `LocalizedText`). Nút đổi ngôn ngữ nằm ở hàng cuối của `Footer`.
- Theme: hai theme `light` và `dark`. Token màu khai báo theo theme trong
  `src/styles/variables.css` (`:root[data-theme='light']`, cũng là mặc định,
  và `:root[data-theme='dark']`); CSS của component chỉ đọc token, không
  viết màu trực tiếp. `ThemeProvider` trong `src/theme/` giữ theme, bắt đầu
  từ `data-theme` mà script ở `<head>` của `index.html` đặt trước lần vẽ
  đầu; thứ tự chọn là khóa localStorage `portfolio_theme`, rồi
  `prefers-color-scheme`, rồi `light`. Provider ghi localStorage và cập nhật
  `<meta name="theme-color">`. Nút đổi theme nằm trong `Header`.
- Token giao diện: `src/styles/variables.css`; style chung:
  `src/styles/global.css`, `src/index.css`. Font: Playfair Display
  (`--font-family-display`, cho tên ở logo, `h1`, `h2`, tiêu đề lớn của
  `Footer`) và Be Vietnam Pro (`--font-family-primary`, chữ còn lại), cùng
  tải bằng một thẻ `link` Google Fonts trong `index.html`; cả hai có subset
  `vietnamese`.
- Hiệu ứng chuyển động: token `--motion-fast`, `--motion-base`, `--motion-slow`
  và `--ease-out-expo` trong `src/styles/variables.css`. `useReducedMotion`
  (`src/hooks/`) trả trạng thái `prefers-reduced-motion`, đọc lúc tải và
  theo dõi thay đổi. `EmberBackground` là canvas cố định sau nội dung, render
  một lần trong `App`; `useReveal` (gọi trong `App`) đặt `data-reveal-state`
  (`pending`, `shown`, `done`) trên phần tử có `data-reveal`; thẻ có
  `data-card` có viền sáng quay khi hover hoặc focus (`@property
  --glow-angle` trong `src/styles/global.css`); tên hero trong `Personal`
  tách thành từng ký tự; nền kính mờ của header nằm ở `.nav::before`, không
  nằm trên `.nav` (`backdrop-filter` trên `.nav` làm menu mobile `position:
  fixed` bị nhốt trong viên thuốc). Quy tắc giảm chuyển động nằm cuối
  `src/styles/global.css`; mô tả đầy đủ ở `docs/DESIGN.md` mục 11.
- Quy ước kiểm từ cấu hình: alias `@`, `@components`, `@data`, `@styles`...
  trong `vite.config.ts`; Prettier (`.prettierrc`: dấu nháy đơn, có dấu chấm
  phẩy, rộng 80); Node 24 (`.nvmrc`).

## Test theo FUT

Lệnh `commands` trong `.repos/manifest.yaml` chạy từ `.repos/Portfolio`.

- `test`: một file Vitest. Test nằm cạnh mã được kiểm
  (`src/components/*.test.tsx`, `src/hooks/*.test.tsx`,
  `src/theme/*.test.tsx`, `src/App.test.tsx`), môi trường `jsdom`, setup
  `src/test/setup.ts` nạp matcher của `@testing-library/jest-dom` và cho
  `getContext` của canvas trả `null` (jsdom không có canvas). jsdom cũng không
  có `matchMedia` và `IntersectionObserver`: test tự dựng bản giả khi cần.
- Không phải test theo FUT, thuộc giai đoạn build/test/release của người dùng:
  `npm test` không kèm file (chạy cả suite), `npm run build`.

## Kiểm chứng layout bằng mock

- Chạy `npx vite --open false`, mở `http://localhost:3000`. `vite.config.ts`
  đặt `open: true`, nên tắt mở trình duyệt khi chạy không giao diện. Trang
  không gọi API nên không cần mock.
- Ngôn ngữ giao diện: `en` (mặc định) và `vi`; chụp mỗi trạng thái ở cả hai.
  Chuyển bằng nút ở hàng cuối footer, hoặc đặt khóa `portfolio_language`
  (`en` hoặc `vi`) trong localStorage trước khi tải trang.
- Theme: `light` và `dark`; chụp mỗi trạng thái ở cả hai. Đặt bằng nút ở
  header, hoặc đặt khóa `portfolio_theme` (`light` hoặc `dark`) trong
  localStorage trước khi tải trang. Khi chưa lưu lựa chọn, theme theo
  `prefers-color-scheme`, giả lập được bằng media feature của trình duyệt.
- Khổ màn hình: máy tính 1280×800, điện thoại 360×800. Ngưỡng của repo:
  dưới 480, 480–767 (hai khổ này dùng menu hamburger,
  `src/components/Header.module.css`), 768–1023, từ 1024 px.
- Khổ sát ngưỡng: khi diff đổi kích thước hoặc số phần tử của hàng header,
  hàng thẻ hoặc khung có bề rộng ràng buộc, đo thêm ở 479 và 480, 767 và 768,
  1023 và 1024 px (cùng 1280×800 và 360×800): hộp bao của viên thuốc `nav`,
  logo, hàng liên kết, nút theme và nút menu phải nằm trong viên thuốc và
  không chồng nhau.
- Hiệu ứng chuyển động: chụp các trạng thái tĩnh với giả lập
  `prefers-reduced-motion: reduce` (media feature của trình duyệt) để ảnh ổn
  định: không có `<canvas>`, hero và mọi phần tử hiện-khi-cuộn đã hiện đủ.
  Chụp riêng từng hiệu ứng với `no-preference`: hero sau khi hiện xong (chờ ít
  nhất 1,5 s sau khi tải), thẻ đang hover có viền sáng, header đã cuộn có nền
  mờ kính, mỗi ảnh ở cả hai theme. Phần tử hiện-khi-cuộn chỉ hiện khi cuộn tới
  (và ảnh toàn trang không giảm chuyển động có phần tử còn ẩn), nên ảnh toàn
  trang dùng chế độ giảm chuyển động. Ảnh khung giữa hiệu ứng phải ghi rõ là
  khung giữa: để chụp đúng khung, chèn CSS `animation-play-state: paused` ngay
  khi tài liệu bắt đầu rồi đặt `currentTime` của `document.getAnimations()`.
  Kiểm thêm khi cuộn: mở menu mobile lúc header đã cuộn phải phủ kín khung
  nhìn.

### Ghi chú công cụ chụp

- Server: từ `.repos/Portfolio`, chạy `npx vite --open false --port 3000
  --strictPort`; `--strictPort` để thấy ngay khi cổng đã bận.
- Trở ngại môi trường (Windows, Git Bash): lệnh `statusLine` của Claude Code
  chạy `bash` định kỳ trong thư mục làm việc; khi bash bị crash, file
  `bash.exe.stackdump` xuất hiện ở thư mục đó, trình theo dõi file của Vite
  thoát với `EBUSY` ngay giữa phiên chụp. `.gitignore` của Hub và của
  Portfolio đã loại `*.stackdump` khỏi `git status`. Giữ server sống bằng cách
  chạy Vite với một file cấu hình tạm nằm ngoài repo (cùng `resolve.alias` và
  thêm `server.watch.ignored: ['**/*.stackdump']`; không sửa `vite.config.ts`
  vì đây là lỗi của máy), hoặc xóa file rồi dựng lại server. Xóa mọi
  `*.stackdump` còn lại khi dọn tài nguyên.
- Chụp và đo: Chrome cài sẵn điều khiển bằng `puppeteer-core`, không thêm vào
  `package.json` của repo. Giả lập `prefers-reduced-motion` và
  `prefers-color-scheme` bằng media feature của trình duyệt; đặt ngôn ngữ và
  theme bằng localStorage (các khóa ở trên). Tùy chọn `clip` của ảnh chụp dùng
  tọa độ tài liệu: cộng `scrollY` khi chụp header cố định sau khi cuộn.

## Khoảng trống đã biết

Repo chưa có nơi ghi khoảng trống. Ghi vào mục này: mỗi mục có mã `GAP-NN`,
vấn đề, bằng chứng (file/symbol) và hướng xử lý gợi ý. Sửa xong thì xóa mục.

| Mã | Vấn đề | Bằng chứng | Hướng xử lý gợi ý |
| --- | --- | --- | --- |
| GAP-06 | `DOCUMENTATION_COMPLETE.md` còn mục lệch source: danh sách "7 Sections" ở "Tính Năng Chính"/"Key Features" thiếu `Projects`, `Skills`; mục "CSS Classes Pattern" nêu class chung `.section`, `.content`, `.item`, `.button` không có trong CSS | Hai mục nêu trên của `DOCUMENTATION_COMPLETE.md`; `src/App.tsx`; `src/components/*.module.css` | Chưa có task sở hữu; sửa danh sách theo các section trong `src/App.tsx` và mục class theo tên class thật |
| GAP-07 | Ở khổ 360×800 trang cuộn ngang được: vòng trang trí `.orbit` quanh ảnh chân dung rộng hơn khung nhìn. Có từ trước các thay đổi của gói `portfolio-gaps` | `document.documentElement.scrollWidth` 426 so với `clientWidth` 360 ở lần chụp baseline `a50912c`; phần tử tràn là `span.orbit` trong `src/components/Personal.module.css` (xoay −30°, hộp bao rộng hơn 304px) | Cắt phần tràn của `.orbit` (ví dụ `overflow: hidden` ở `.heroMedia`) hoặc thu nhỏ vòng ở khổ nhỏ; cần xác nhận bố cục mong muốn |
| GAP-08 | Ở khổ 768–1023px, hàng liên kết điều hướng tiếng Anh rộng hơn viên thuốc header nên tràn ra ngoài viên thuốc; nút đổi theme (thêm ở T05) nằm ngoài viên thuốc ở khổ này. Có từ trước T05: ở 768px liên kết kết thúc tại x=890 trong khi viên thuốc kết thúc tại x=744 | Số đo hộp bao ở baseline `a50912c` và sau T05 (`.tmp/layout-snapshots/portfolio-gaps_20261014-233844/T05/*/nav-measure-*.txt`); `src/components/Header.module.css`: hamburger chỉ dưới 768px, `.navLinks` xếp ngang từ 768px | Chuyển menu hamburger lên dưới 1024px hoặc rút gọn hàng liên kết ở 768–1023px; cần quyết định bố cục |
