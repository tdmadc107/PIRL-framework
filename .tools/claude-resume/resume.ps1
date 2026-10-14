# Chạy lại phiên Claude Code sau khi hạn mức 5h reset (được Task Scheduler gọi).
# -SessionId: nối tiếp đúng phiên đó; phải là UUID đầy đủ (panel AGENTS của dashboard) hoặc tên
# phiên khớp chính xác, vì -p không nhận ID rút gọn. Bỏ trống thì nối tiếp phiên gần nhất của repo.
# Log ghi vào .tmp\claude-resume\logs của Hub (.tmp/ không vào git).
param([string]$SessionId = "")

$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$logDir = Join-Path $repo ".tmp\claude-resume\logs"
New-Item -ItemType Directory -Force $logDir | Out-Null
$log = Join-Path $logDir ("resume-{0:yyyyMMdd-HHmmss}.log" -f (Get-Date))

$prompt = "Hạn mức 5h đã reset. Tiếp tục đúng công việc đang dở trong phiên này từ chỗ dừng, tuân thủ AGENTS.md. Không commit hoặc push nếu trước đó chưa được yêu cầu. Kết thúc bằng tóm tắt việc đã làm và việc còn lại."
$session = if ($SessionId) { @("--resume", $SessionId) } else { @("--continue") }

Set-Location $repo
"[$(Get-Date -Format s)] start $($session -join ' ')" | Out-File $log -Encoding utf8
& claude @session -p $prompt --permission-mode auto *>> $log
"[$(Get-Date -Format s)] exit $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
