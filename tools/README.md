# Công cụ cục bộ của Hub PIRL

## dashboard

Dashboard terminal kiểu "mission control" để theo dõi đồng thời:

- `01 // QUOTA`: hạn mức Claude 5 giờ/7 ngày, đếm ngược đến lúc reset;
- `02 // AGENTS`: từng phiên Claude Code gần đây với model, effort, % context,
  chi phí và trạng thái `EXEC <tool>`, `THINK`, `STANDBY` hoặc `FAULT`; dòng
  thứ hai của mỗi phiên in UUID đầy đủ để dùng cho `claude-resume` khi không
  thoát được phiên đang chạy;
- `03 // PLAN · REVIEW`: mỗi task trong `.agents/plan/` một dòng, gồm trạng thái
  Plan (`PLANNED`, `AWAIT`, `IMPLEMENTED`, `BLOCKED`, `FAILED`) và vòng Review
  mới nhất kèm verdict (`R1 PASS`); task đã `implemented` mà chưa có Review được
  đếm vào `CHỜ REVIEW`;
- `04 // REPOSITORIES`: file thay đổi theo git trong Hub và mọi submodule
  `.repos/*` (đọc từ `.gitmodules`), kèm số dòng +/-; file sửa trong 60 giây
  gần nhất có dấu `◆`;
- `05 // EVENT LOG`: nhật ký trực tiếp các file mới/sửa/xoá, stage (`STAGE`) và
  bỏ stage (`UNSTAGE`), commit, đổi nhánh, repo được đăng ký hoặc gỡ, chuyển
  trạng thái Plan (`PLAN`), kết luận Review (`REVIEW`) và chuyển trạng thái của
  phiên AI; thanh `ACTIVITY` ở chân trang đếm sự kiện trong 60 giây gần nhất,
  kèm tổng sự kiện từ lúc khởi động.

Terminal rộng từ 118 cột trở lên dùng bố cục hai cột; hẹp hơn thì xếp chồng.
Panel Plan tự ẩn khi terminal quá thấp để dành chỗ cho `REPOSITORIES`.
Cần terminal hỗ trợ màu 24-bit (terminal của VS Code, Windows Terminal).

Phạm vi theo dõi thay đổi:

- File: một watcher `fs.watch` đệ quy trên gốc Hub (gồm `.repos/*`) báo mọi file
  mới (`NEW`), sửa (`MOD`) và xoá (`DEL`) gần như tức thì, kể cả đường dẫn bị Git
  ignore (`tmp/`, `node_modules/`, thư mục build) và file tạo rồi xoá trước khi
  `git status` kịp quét (hiện `(tạo rồi xóa)`). Chỉ bỏ qua nội dung `.git/`.
- Git: stage, bỏ stage, commit, reset hay đổi nhánh chỉ ghi vào thư mục git,
  nên dashboard so `stat` của `index`, `HEAD` và `logs/HEAD` trong thư mục git
  của Hub và từng submodule mỗi 0,5 giây (không gọi git). Khi một trong ba file
  này đổi, dashboard quét `git status` sau khoảng 0,2 giây và ghi `STAGE`,
  `UNSTAGE`, `COMMIT`, `BRANCH` tương ứng. Ngoài ra cứ mỗi `--interval` giây
  (mặc định 10) dashboard quét định kỳ cho panel `REPOSITORIES` và ghi repo được
  đăng ký hoặc gỡ trong `.gitmodules`.
- Plan và Review: đọc lại ở mỗi lần quét git; khi `fs.watch` chạy thì còn đọc
  lại ngay lúc file trong `.agents/plan/` hoặc `.agents/review/` đổi.
- Nhịp quét: quét do sự kiện cách lần quét trước ít nhất 0,5 giây sau thay đổi
  git và 3 giây sau thay đổi file; sự kiện đến lúc đang quét được bù bằng đúng
  một lần quét sau đó, nên không bỏ sót và không chạy chồng lệnh git. Khi
  không có thay đổi, dashboard chỉ gọi git theo `--interval`.
- Gộp để không tràn nhật ký: sự kiện file được gom 0,7 giây rồi nhóm theo repo,
  thư mục cấp một và loại; nhóm quá 3 file thành một dòng có đếm, ví dụ
  `NEW hub/node_modules/ ×1200 · node_modules/a/index.js`. `STAGE` và `UNSTAGE`
  được gộp cùng cách, ví dụ sau `git add .`. Nhật ký giữ 400 sự kiện gần nhất.
- Giới hạn: `NEW` hay `MOD` được suy từ thời điểm tạo file, nên file thay bằng
  cách ghi đè nguyên tử có thể hiện là `NEW`. Nếu `fs.watch` đệ quy không dùng
  được (hệ điều hành hoặc Node cũ) hay bị lỗi, dashboard ghi một dòng `SYS` và
  quay về phát hiện file bằng `git status` (stage, commit, nhánh vẫn được báo
  ngay như trên), khi đó không thấy đường dẫn bị Git ignore và file tạo rồi xoá
  giữa hai lần quét, còn Plan và Review chỉ được đọc lại ở lần quét git kế tiếp.

Cách nhanh nhất là double-click `tools/dashboard/dashboard.bat` (hoặc tạo
shortcut ra Desktop). File này cũng nhận các tham số dưới đây, ví dụ
`tools\dashboard\dashboard.bat --no-intro`, và giữ cửa sổ lại nếu dashboard
lỗi.

Hoặc chạy trong một tab hoặc pane riêng của terminal:

```powershell
node tools/dashboard/dashboard.js                 # mặc định quét git mỗi 10 giây
node tools/dashboard/dashboard.js --interval 5 --files 15 --max-age 6
node tools/dashboard/dashboard.js --plans 10      # hiện tối đa 10 task Plan (mặc định 6)
node tools/dashboard/dashboard.js --no-intro      # bỏ màn khởi động
node tools/dashboard/dashboard.js --once          # in một khung hình rồi thoát
node tools/dashboard/dashboard.js --once --rows 30  # khung hình cho terminal cao 30 dòng
```

Phím `q` hoặc `Ctrl+C` để thoát, `r` để quét lại ngay; phím khác bỏ qua màn
khởi động.

Dữ liệu AI lấy từ status line: `~/.claude/statusline-command.sh` ghi JSON nhận
từ Claude Code vào `~/.claude/dashboard/sessions/<session_id>.json` mỗi lần
status line cập nhật. Vì vậy số liệu chỉ mới đến lần cập nhật gần nhất, và chỉ
có phiên Claude Code (không có Codex). Trạng thái "đang làm gì" đọc từ cuối
transcript của phiên.

## claude-resume

`claude-resume/resume.ps1` chạy lại phiên Claude Code sau khi hạn mức 5 giờ
reset; log ghi vào `tmp/claude-resume/logs/`. Hẹn giờ một lần bằng Task
Scheduler (ngày phải ở dạng `yyyy/MM/dd`, máy phải đang đăng nhập và thức):

```powershell
schtasks /Create /TN "ClaudeResume" /SC ONCE /SD yyyy/MM/dd /ST HH:mm /TR "pwsh -NoProfile -ExecutionPolicy Bypass -File D:\Project\.repository\PIRL-framework\tools\claude-resume\resume.ps1 -SessionId <id>" /F
```

`<id>` phải là UUID đầy đủ (lấy ở panel `02 // AGENTS` của dashboard) hoặc
tên phiên khớp chính xác; chế độ `-p` không nhận ID rút gọn như 8 ký tự cuối.
Bỏ `-SessionId <id>` để nối tiếp phiên gần nhất của repo.

Trước khi làm việc dài sau khi reset, kiểm tra xem có hai phiên cùng chạy hay
không, vì phiên tương tác cũng có thể tự chạy tiếp:
`Get-CimInstance Win32_Process -Filter "Name='claude.exe'"`.

## claude-schedule

`claude-schedule/schedule.ps1` hẹn trước một task Claude Code chạy một lần,
dùng khi biết trước mình sẽ không tiện gửi request vào giờ đó. Task được tạo
trong thư mục `\Claude\` của Task Scheduler và gọi `claude-schedule/run.ps1`;
prompt lưu ở `tmp/claude-schedule/tasks/<tên>.txt`, log ở
`tmp/claude-schedule/logs/`.

```powershell
# Phiên mới, giờ đầy đủ; prompt ngắn viết thẳng
tools\claude-schedule\schedule.ps1 -Name review-t01 -At "2026-10-10 08:00" -Prompt "Review phần triển khai của Plan T01 trong .agents/plan/<gói>"
# Prompt dài để trong file; chỉ ghi HH:mm thì lấy lần tới của giờ đó
tools\claude-schedule\schedule.ps1 -Name implement-t02 -At 23:30 -PromptFile D:\prompts\t02.md
# Nối tiếp một phiên có sẵn thay vì mở phiên mới
tools\claude-schedule\schedule.ps1 -Name fix-t03 -At 06:00 -Prompt "..." -SessionId <uuid>

tools\claude-schedule\schedule.ps1 -List               # trạng thái, lần chạy tới, kết quả lần trước
tools\claude-schedule\schedule.ps1 -Remove -Name review-t01
```

- `-At` nhận `yyyy-MM-dd HH:mm` hoặc `HH:mm`, không phụ thuộc định dạng ngày
  của máy. Trùng tên task thì báo lỗi, thêm `-Force` để ghi đè.
- Prompt được truyền nguyên văn, chỉ thêm một câu yêu cầu kết thúc bằng tóm
  tắt; muốn commit hay push thì ghi rõ trong prompt. `-PermissionMode` mặc
  định `auto`.
- `-SessionId` theo cùng quy tắc với `claude-resume`: UUID đầy đủ hoặc tên
  phiên khớp chính xác.
- Task chỉ chạy khi đang đăng nhập Windows. Nếu máy tắt hoặc ngủ đúng giờ
  hẹn, task chạy ngay khi máy thức lại; đánh thức máy từ chế độ ngủ chỉ hoạt
  động khi Power Options bật "Allow wake timers". Task vẫn chạy khi dùng pin.
- Task đã chạy không tự xoá; dọn bằng `-Remove`.
- Task có thể chạy cùng lúc với phiên đang mở trên cùng cây làm việc (nhất là
  khi dùng `-SessionId` hoặc khi chạy trễ lúc máy vừa thức), nên kiểm tra
  như với `claude-resume` trước khi làm việc tiếp.
