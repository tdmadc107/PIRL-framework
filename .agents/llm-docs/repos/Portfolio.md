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
Design System, không mô tả giao diện hiện tại.

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
  dưới 480, 480–767 và 768–1023 (ba khổ này dùng menu hamburger,
  `src/components/Header.module.css`), từ 1024 px (hàng liên kết ngang).
- Khổ sát ngưỡng: khi diff đổi kích thước hoặc số phần tử của hàng header,
  hàng thẻ hoặc khung có bề rộng ràng buộc, đo thêm ở 479 và 480, 767 và 768,
  1023 và 1024 px (cùng 1280×800 và 360×800): hộp bao của viên thuốc `nav`,
  logo, nút theme, nút menu (chỉ dưới 1024 px; từ 1024 px nút ẩn) và, từ
  1024 px, hàng liên kết phải nằm trong viên thuốc và không chồng nhau (dưới
  1024 px hàng liên kết là overlay toàn khung nhìn của menu, chỉ đo khi menu
  mở).
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
- Công cụ điều khiển trình duyệt: Chrome cài sẵn tại
  `C:/Program Files/Google/Chrome/Application/chrome.exe`, điều khiển bằng
  `puppeteer-core`. Gói này nằm ở `.tmp/` của Hub (`.tmp/package.json` và
  `.tmp/node_modules`, Git ignore, không thuộc nghĩa vụ dọn nên giữ lại giữa
  các lượt); script trong `.tmp/layout-snapshots/` import nó nhờ Node tìm
  ngược lên thư mục cha. Chưa có thì cài từ gốc Hub bằng
  `npm install --prefix .tmp puppeteer-core`, không thêm vào `package.json`
  của repo.
- Không chạy `chrome.exe` với bất kỳ cờ nào, kể cả `--version`: khi Chrome của
  người dùng đang chạy, lệnh mở một cửa sổ hoặc tab trong phiên đó và không
  đóng lại được một cách an toàn. Đọc phiên bản từ metadata của file
  (`(Get-Item '<đường dẫn chrome.exe>').VersionInfo.ProductVersion` trong
  PowerShell) hoặc từ `browser.version()` của puppeteer. Chỉ khởi chạy Chrome
  bằng `puppeteer.launch` ở chế độ không giao diện, với `userDataDir` là thư
  mục tạm riêng của lượt, rồi đóng và xóa khi xong.
- Chụp và đo: giả lập `prefers-reduced-motion` và
  `prefers-color-scheme` bằng media feature của trình duyệt; đặt ngôn ngữ và
  theme bằng localStorage (các khóa ở trên). Tùy chọn `clip` của ảnh chụp dùng
  tọa độ tài liệu: cộng `scrollY` khi chụp header cố định sau khi cuộn.

## Khoảng trống đã biết

Repo chưa có nơi ghi khoảng trống. Ghi vào mục này: mỗi mục có mã `GAP-NN`,
vấn đề, bằng chứng (file/symbol) và hướng xử lý gợi ý. Sửa xong thì xóa mục.

| Mã | Vấn đề | Bằng chứng | Hướng xử lý gợi ý |
| --- | --- | --- | --- |
| GAP-10 | Menu hamburger (mọi khổ dưới 1024px) thiếu xử lý bàn phím, trợ năng và đổi khổ: khi menu đóng, phím Tab vẫn tới sáu liên kết vô hình (`opacity: 0`) trước nút đổi theme và nút menu, và trình trợ năng vẫn đọc chúng; phím Esc không đóng menu đang mở; không có khóa cuộn khi menu mở (cuộn chuột vẫn đổi `scrollY`); trạng thái menu mở không reset khi khổ vượt qua 1024px (`aria-expanded` vẫn `true` dù nút menu đã ẩn). Có từ trước ở dưới 768px (đo ở 360px, trạng thái trước task đưa hamburger lên dưới 1024px); từ task đó áp dụng cả 768–1023px | `src/components/Header.module.css`: `.navLinks` trong `@media (max-width: 1023px)` ẩn menu đóng chỉ bằng `opacity: 0`, `pointer-events: none` và `transform`, không có `visibility`; `src/components/Header.tsx`: `<ul>` không có `inert` hay `aria-hidden`, `isMenuOpen` chỉ đổi qua nút menu, nút đóng và `onClick` của liên kết, không có xử lý phím, `resize`, `matchMedia` hay đặt `overflow` của `body`. Đã đo (lần chụp `.tmp/layout-snapshots/portfolio-known-gaps_20261018-152917/T01/20261018-162036/results.md`, mục 8): Tab ở 900px sau diff và ở 360px baseline đi qua sáu liên kết độ mờ 0 trước hai nút; Esc giữ `aria-expanded=true`; cuộn chuột 400px đổi `scrollY` 0 → 400 khi menu mở; mở menu ở 1023px rồi đổi khổ sang 1024px giữ `aria-expanded=true` | Ẩn liên kết khỏi cây truy cập khi menu đóng (`visibility: hidden` có chuyển tiếp, hoặc `inert`); đóng menu khi khổ từ 1024px và khi nhấn Esc; khóa cuộn khi menu mở; cần người dùng chọn hành vi mong muốn |
