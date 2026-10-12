# Hẹn giờ một task Claude Code chạy một lần, xem danh sách và xoá task đã hẹn.
# Task nằm trong thư mục \Claude\ của Task Scheduler, gọi run.ps1 -Name <Name>; prompt lưu ở
# tmp\claude-schedule\tasks\<Name>.txt của Hub (tmp/ không vào git).
#   schedule.ps1 -Name review-t01 -At "2026-10-10 08:00" -Prompt "..." [-SessionId <uuid>]
#   schedule.ps1 -Name review-t01 -At 08:00 -PromptFile D:\prompt.md   # HH:mm: lần tới của giờ đó
#   schedule.ps1 -List
#   schedule.ps1 -Remove -Name review-t01
[CmdletBinding(DefaultParameterSetName = "Add")]
param(
    [Parameter(Mandatory, ParameterSetName = "Add")]
    [Parameter(Mandatory, ParameterSetName = "Remove")]
    [ValidatePattern('^[A-Za-z0-9_-]+$')][string]$Name,
    [Parameter(Mandatory, ParameterSetName = "Add")][string]$At,
    [Parameter(ParameterSetName = "Add")][string]$Prompt = "",
    [Parameter(ParameterSetName = "Add")][string]$PromptFile = "",
    [Parameter(ParameterSetName = "Add")][string]$SessionId = "",
    [Parameter(ParameterSetName = "Add")][string]$PermissionMode = "auto",
    [Parameter(ParameterSetName = "Add")][switch]$Force,
    [Parameter(Mandatory, ParameterSetName = "List")][switch]$List,
    [Parameter(Mandatory, ParameterSetName = "Remove")][switch]$Remove
)
$ErrorActionPreference = "Stop"

$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$taskDir = Join-Path $repo "tmp\claude-schedule\tasks"
$taskPath = "\Claude\"

if ($List) {
    $tasks = @(Get-ScheduledTask -TaskPath $taskPath -ErrorAction SilentlyContinue)
    if (-not $tasks) { "Chưa có task nào trong $taskPath"; return }
    $tasks | ForEach-Object {
        $info = $_ | Get-ScheduledTaskInfo
        [pscustomobject]@{
            Name       = $_.TaskName
            State      = $_.State
            NextRun    = $info.NextRunTime
            LastRun    = $info.LastRunTime
            LastResult = $info.LastTaskResult
        }
    } | Format-Table -AutoSize
    return
}

$file = Join-Path $taskDir "$Name.txt"

if ($Remove) {
    Unregister-ScheduledTask -TaskPath $taskPath -TaskName $Name -Confirm:$false
    Remove-Item -LiteralPath $file -ErrorAction SilentlyContinue
    "Đã xoá task $Name"
    return
}

# Không dựa vào định dạng ngày của locale (yy/MM/dd trên máy này).
$inv = [cultureinfo]::InvariantCulture
$when = [datetime]::MinValue
if ([datetime]::TryParseExact($At, "yyyy-MM-dd HH:mm", $inv, "None", [ref]$when)) {
} elseif ([datetime]::TryParseExact($At, "HH:mm", $inv, "None", [ref]$when)) {
    $when = (Get-Date).Date + $when.TimeOfDay
    if ($when -le (Get-Date)) { $when = $when.AddDays(1) }
} else {
    throw "-At phải ở dạng 'yyyy-MM-dd HH:mm' hoặc 'HH:mm', nhận '$At'"
}
if ($when -le (Get-Date)) { throw "Thời điểm $($when.ToString('yyyy-MM-dd HH:mm')) đã qua" }

if ([bool]$Prompt -eq [bool]$PromptFile) { throw "Cần đúng một trong -Prompt hoặc -PromptFile" }
$text = if ($PromptFile) { Get-Content -LiteralPath $PromptFile -Raw -Encoding utf8 } else { $Prompt }
if (-not $text.Trim()) { throw "Prompt rỗng" }

if (-not $Force -and (Get-ScheduledTask -TaskPath $taskPath -TaskName $Name -ErrorAction SilentlyContinue)) {
    throw "Task $Name đã tồn tại; thêm -Force để ghi đè"
}

New-Item -ItemType Directory -Force $taskDir | Out-Null
Set-Content -LiteralPath $file -Value $text -Encoding utf8

$runArgs = "-NoProfile -ExecutionPolicy Bypass -File `"$(Join-Path $PSScriptRoot 'run.ps1')`" -Name $Name -PermissionMode $PermissionMode"
if ($SessionId) { $runArgs += " -SessionId `"$SessionId`"" }

$action = New-ScheduledTaskAction -Execute (Get-Command pwsh).Source -Argument $runArgs -WorkingDirectory $repo
$trigger = New-ScheduledTaskTrigger -Once -At $when
$principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -WakeToRun
$summary = $text.Trim() -replace '\s+', ' '
if ($summary.Length -gt 200) { $summary = $summary.Substring(0, 200) + "..." }

Register-ScheduledTask -TaskPath $taskPath -TaskName $Name -Action $action -Trigger $trigger `
    -Principal $principal -Settings $settings -Description $summary -Force | Out-Null
"Đã hẹn task $Name lúc $($when.ToString('yyyy-MM-dd HH:mm')); prompt: $file"
