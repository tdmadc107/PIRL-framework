# Schedules a Claude Code task to run once, lists scheduled tasks and removes them.
# Tasks live in the \Claude\ folder of Task Scheduler and call run.ps1 -Name <Name>; the prompt is stored
# in the Hub's .tmp\claude-schedule\tasks\<Name>.txt (.tmp/ is not in git).
#   schedule.ps1 -Name review-t01 -At "2026-10-10 08:00" -Prompt "..." [-SessionId <uuid>]
#   schedule.ps1 -Name review-t01 -At 08:00 -PromptFile D:\prompt.md   # HH:mm: next occurrence of that time
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
$taskDir = Join-Path $repo ".tmp\claude-schedule\tasks"
$taskPath = "\Claude\"

if ($List) {
    $tasks = @(Get-ScheduledTask -TaskPath $taskPath -ErrorAction SilentlyContinue)
    if (-not $tasks) { "No tasks in $taskPath yet"; return }
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
    "Removed task $Name"
    return
}

# Do not rely on the locale's date format (yy/MM/dd on this machine).
$inv = [cultureinfo]::InvariantCulture
$when = [datetime]::MinValue
if ([datetime]::TryParseExact($At, "yyyy-MM-dd HH:mm", $inv, "None", [ref]$when)) {
} elseif ([datetime]::TryParseExact($At, "HH:mm", $inv, "None", [ref]$when)) {
    $when = (Get-Date).Date + $when.TimeOfDay
    if ($when -le (Get-Date)) { $when = $when.AddDays(1) }
} else {
    throw "-At must be in the form 'yyyy-MM-dd HH:mm' or 'HH:mm', got '$At'"
}
if ($when -le (Get-Date)) { throw "The time $($when.ToString('yyyy-MM-dd HH:mm')) has already passed" }

if ([bool]$Prompt -eq [bool]$PromptFile) { throw "Exactly one of -Prompt or -PromptFile is required" }
$text = if ($PromptFile) { Get-Content -LiteralPath $PromptFile -Raw -Encoding utf8 } else { $Prompt }
if (-not $text.Trim()) { throw "The prompt is empty" }

if (-not $Force -and (Get-ScheduledTask -TaskPath $taskPath -TaskName $Name -ErrorAction SilentlyContinue)) {
    throw "Task $Name already exists; add -Force to overwrite"
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
"Scheduled task $Name at $($when.ToString('yyyy-MM-dd HH:mm')); prompt: $file"
