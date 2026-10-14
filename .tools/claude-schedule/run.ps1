# Chạy một task Claude Code đã hẹn giờ (được Task Scheduler gọi, task tạo bằng schedule.ps1).
# -Name: tên task; prompt đọc từ .tmp\claude-schedule\tasks\<Name>.txt của Hub.
# -SessionId: nối tiếp đúng phiên đó (UUID đầy đủ hoặc tên phiên khớp chính xác, vì -p không
# nhận ID rút gọn). Bỏ trống thì mở phiên mới.
# Log ghi vào .tmp\claude-schedule\logs của Hub (.tmp/ không vào git).
param(
    [Parameter(Mandatory)][ValidatePattern('^[A-Za-z0-9_-]+$')][string]$Name,
    [string]$SessionId = "",
    [string]$PermissionMode = "auto"
)

$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$promptFile = Join-Path $repo ".tmp\claude-schedule\tasks\$Name.txt"
$logDir = Join-Path $repo ".tmp\claude-schedule\logs"
New-Item -ItemType Directory -Force $logDir | Out-Null
$log = Join-Path $logDir ("{0}-{1:yyyyMMdd-HHmmss}.log" -f $Name, (Get-Date))

if (-not (Test-Path -LiteralPath $promptFile)) {
    "[$(Get-Date -Format s)] missing prompt file $promptFile" | Out-File $log -Encoding utf8
    exit 1
}
$prompt = (Get-Content -LiteralPath $promptFile -Raw -Encoding utf8).Trim()
$prompt += "`n`nĐây là task đã hẹn giờ, không có người dùng theo dõi trực tiếp. Kết thúc bằng tóm tắt việc đã làm và việc còn lại."
$session = if ($SessionId) { @("--resume", $SessionId) } else { @() }

Set-Location $repo
# Task Scheduler mở console mới với code page OEM (437); không ép UTF-8 thì PowerShell giải mã
# output UTF-8 của claude theo 437 và log tiếng Việt bị lỗi font.
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
"[$(Get-Date -Format s)] start $Name $($session -join ' ')" | Out-File $log -Encoding utf8
& claude @session -p $prompt --permission-mode $PermissionMode *>> $log
"[$(Get-Date -Format s)] exit $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
