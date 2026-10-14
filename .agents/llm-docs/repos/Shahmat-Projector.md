# Shahmat-Projector

Tài liệu ngữ cảnh của repo `.repos/Shahmat-Projector` cho Agent của Hub. Sản
phẩm là Shahmat: webapp giải câu đố cờ vua chiếu hết sau N nước, gồm màn chơi
theo stage, thử thách hằng ngày, bảng xếp hạng, cửa hàng xu vàng và PvP. Nội
dung đối chiếu với source tại commit `4764460` (nhánh `develop`; nhánh mặc
định của remote là `master`).

Repo không có `AGENTS.md` hay thư mục đặc tả. `shahmat/README.md` là tài liệu
sản phẩm duy nhất; tài liệu này trỏ tới nó và ghi phần Hub cần.

## Đọc trước khi làm

| Nguồn trong repo | Khi nào đọc |
| --- | --- |
| `shahmat/README.md` | Luôn đọc. Mục "Design Decisions" và "Leaderboard data contract" là quy tắc nghiệp vụ hiện hành (định danh câu đố, Daily theo `Asia/Ho_Chi_Minh`, phiên tính giờ, công thức xếp hạng) |
| `shahmat/README.md`, mục "MongoDB clean-start cutover runbook" | Khi chạm lưu trữ hoặc dữ liệu người dùng |
| `shahmat/.env.example` | Khi chạm cấu hình; không đặt bí mật máy chủ vào biến `VITE_*` |

## Kiến trúc

- Ứng dụng nằm trong thư mục con `shahmat/`. Gốc repo chỉ có `.gitignore` và
  một `package-lock.json` rỗng.
- Giao diện `shahmat/src/`: React 18, TypeScript (`strict`), Vite 5, CSS
  Modules, React Router 6, Zustand, `chess.js`, `react-chessboard`, worker
  Stockfish.
  - `pages/` (Home, Auth, StageMap, PuzzleList, Game, Daily, Ranking, Shop,
    Settings, PvP), `components/` (`board/`, `layout/`, `ui/`), `stores/`
    (`gameStore`, `progressStore`, `pvpStore`, `settingsStore`, `userStore`),
    `data/puzzles.ts` (8 stage, 240 câu đố), `utils/` (`puzzleEngine`,
    `dailySchedule`, `progressionEngine`, `pvpInvite`), `i18n/` (`vi.ts`,
    `en.ts`), `styles/global.css` (biến CSS).
  - `services/salesforceApi.ts` mang tên cũ nhưng là client gọi `/api/*` của
    Vercel Functions; có chế độ mock khi `VITE_USE_MOCK_API=true`.
    `services/momoPayment.ts` là bản giả của cổng MoMo.
- Máy chủ `shahmat/api/`: Vercel Functions (`auth/`, `progress/[userId]`,
  `leaderboard`, `pvp/`, `users/[id]`) và thư viện chung `api/_lib/`
  (`mongodb`, `repositories`, `auth` JWT, `pinHashing`, `pvpTransactions`,
  `leaderboardMetrics`, `mongoIndexes`, `userMutations`). Lưu trữ MongoDB;
  schema và index tạo bằng `scripts/mongodb/setup-indexes.ts`.
- Quy ước kiểm từ cấu hình: alias `@` → `src/`; ESLint `--max-warnings 0`;
  Node 24.x (`engines`).

## Test theo FUT

Lệnh `commands` trong `.repos/manifest.yaml` chạy từ `.repos/Shahmat-Projector`
và tự chuyển vào `shahmat/`. Phải chạy trong `shahmat/` vì có test đọc file
theo `process.cwd()` (ví dụ `src/utils/webAppManifest.test.ts`).

- `test`: một file Vitest. Test đơn vị và component nằm cạnh source
  (`src/**/*.test.ts(x)`; test cần DOM khai báo `// @vitest-environment jsdom`
  ở đầu file); test handler API nằm trong `tests/api/`.
- `test-mongodb`: một file trong `tests/integration/mongodb/`. Cần
  `.env.local` trỏ tới cụm Atlas replica set dành riêng cho test
  (`MONGODB_TEST_URI`, `MONGODB_TEST_HOST`, `MONGODB_PRODUCTION_HOST`,
  `MONGODB_TEST_ALLOW_CLEANUP=true`). Test tạo rồi xóa một database ngẫu nhiên
  `shahmat_test_*`. Thiếu cụm test riêng thì phần test đó `BLOCKED`; không trỏ
  vào cụm production.
- Không phải test theo FUT, thuộc giai đoạn build/test/release của người dùng:
  `npm test` không kèm file (chạy cả suite), `npm run lint`, `npm run build`.

## Kiểm chứng layout bằng mock

- Trạng thái thường: `cd shahmat; npm run dev:mock`, mở
  `http://localhost:5173`. Lệnh này bật `VITE_USE_MOCK_API=true`; dữ liệu giả
  nằm trong `src/services/salesforceApi.ts`, không lưu.
- Trạng thái lỗi hoặc dữ liệu đặc thù mà mock sẵn có không tạo được: chạy
  `cd shahmat; npx vite` (mock tắt khi môi trường và `.env.local` không đặt
  `VITE_USE_MOCK_API=true`) và chặn mọi request `/api/**` ngay trong trình
  duyệt. Không chặn thì Vite trả `404` cho `/api/*`.
- Không dùng `npm run dev`: lệnh này chạy API thật và cần MongoDB.
- Plugin `stockfish-public` trong `shahmat/vite.config.ts` chép đè
  `public/stockfish-nnue-16-single.js` và `.wasm` (đang được Git theo dõi) mỗi
  lần Vite khởi động. Sau phiên chụp, nếu `git status` báo hai file này đổi
  thì khôi phục đúng hai file đó khi dọn tài nguyên tạm.
- Ngôn ngữ giao diện: `vi` (mặc định) và `en`. Lưu ở localStorage
  `shahmat-settings` dạng `{"state":{"language":"en"},"version":0}`, hoặc đổi
  ở trang Settings.
- Khổ màn hình: máy tính 1280×800, điện thoại 360×800. Media query của repo
  dùng nhiều nhất `max-width: 480px`; các ngưỡng khác nằm trong khoảng 400 đến
  820 px.

## Khoảng trống đã biết

Repo chưa có nơi ghi khoảng trống. Ghi vào mục này: mỗi mục có mã `GAP-NN`,
vấn đề, bằng chứng (file/symbol) và hướng xử lý gợi ý. Sửa xong thì xóa mục.

Chưa có mục nào.
