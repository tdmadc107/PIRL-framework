# Runs a scheduled Claude Code task (called by Task Scheduler; the task is created with schedule.ps1).
# -Name: task name; the prompt is read from the Hub's .tmp\claude-schedule\tasks\<Name>.txt.
# -SessionId: continue exactly that session (the full UUID or an exactly matching session name, because
# -p does not accept a shortened ID). Leave it empty to open a new session.
# Logs go to the Hub's .tmp\claude-schedule\logs (.tmp/ is not in git).
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
$prompt += "`n`nThis is a scheduled task with no user watching live. End with a summary of what was done and what remains."
$session = if ($SessionId) { @("--resume", $SessionId) } else { @() }

Set-Location $repo
# Task Scheduler opens a new console with the OEM code page (437); without forcing UTF-8, PowerShell
# decodes claude's UTF-8 output as 437 and non-ASCII text in the log is garbled.
[Console]::OutputEncoding = [Text.UTF8Encoding]::new($false)
"[$(Get-Date -Format s)] start $Name $($session -join ' ')" | Out-File $log -Encoding utf8
& claude @session -p $prompt --permission-mode $PermissionMode *>> $log
"[$(Get-Date -Format s)] exit $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
