# Resumes a Claude Code session after the 5h quota resets (called by Task Scheduler).
# -SessionId: continue exactly that session; it must be the full UUID (dashboard AGENTS panel) or an
# exactly matching session name, because -p does not accept a shortened ID. Leave it empty to continue
# the repository's most recent session.
# Logs go to the Hub's .tmp\claude-resume\logs (.tmp/ is not in git).
param([string]$SessionId = "")

$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$logDir = Join-Path $repo ".tmp\claude-resume\logs"
New-Item -ItemType Directory -Force $logDir | Out-Null
$log = Join-Path $logDir ("resume-{0:yyyyMMdd-HHmmss}.log" -f (Get-Date))

$prompt = "The 5h quota has reset. Continue exactly the unfinished work in this session from where it stopped, following AGENTS.md. Do not commit or push unless that was requested earlier. End with a summary of what was done and what remains."
$session = if ($SessionId) { @("--resume", $SessionId) } else { @("--continue") }

Set-Location $repo
"[$(Get-Date -Format s)] start $($session -join ' ')" | Out-File $log -Encoding utf8
& claude @session -p $prompt --permission-mode auto *>> $log
"[$(Get-Date -Format s)] exit $LASTEXITCODE" | Out-File $log -Append -Encoding utf8
