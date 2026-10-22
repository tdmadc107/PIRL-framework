# PIRL Hub local tools

## dashboard

A "mission control" terminal dashboard that monitors, all at once:

- `01 // QUOTA`: the Claude 5-hour/7-day quota, with a countdown to the reset;
- `02 // AGENTS`: each recent Claude Code session with its model, effort,
  context %, cost and state `EXEC <tool>`, `THINK`, `STANDBY` or `FAULT`; the
  second line of each session prints the full UUID to use with `claude-resume`
  when the running session cannot be exited;
- `03 // PLAN · REVIEW`: one line per Plan task found under the Hub root (files
  with a `pirl-plan/v1` frontmatter, up to three directory levels deep, outside
  hidden directories; Plans the user stores elsewhere are not shown), with the
  Plan status (`PLANNED`, `AWAIT`, `IMPLEMENTED`, `BLOCKED`, `FAILED`) and the latest
  Review round with its verdict (`R1 PASS`); tasks that are `implemented` but have
  no Review yet are counted in `PENDING REVIEW`;
- `04 // REPOSITORIES`: files changed according to git in the Hub and in every
  Git repository inside it, with +/- line counts; files modified in the last 60
  seconds are marked `◆`. The repository list is the union of the submodules in
  `.gitmodules` and the directories up to two levels below the Hub root that
  have their own `.git` (for example a local clone in `.repos/`). A submodule
  that is not cloned gets a `⚠` line at the top of the panel. Directories
  without `.git` are not scanned by git;
- `05 // EVENT LOG`: a live log of new/modified/deleted files, staging
  (`STAGE`) and unstaging (`UNSTAGE`), commits, branch switches, repository
  repositories and submodules added/removed (`REPO`), warnings about submodules
  that are not cloned (`WARN`), Plan status transitions (`PLAN`), Review
  conclusions (`REVIEW`) and AI session state transitions; the `ACTIVITY` bar in
  the footer counts events in the last 60 seconds, along with the total number
  of events since startup.

Terminals 118 columns wide or more use a two-column layout; narrower ones stack
the panels. The Plan panel hides itself when the terminal is too short, to leave
room for `REPOSITORIES`. Requires a terminal with 24-bit color (the VS Code
terminal, Windows Terminal).

Change-tracking scope:

- Files: one recursive `fs.watch` watcher on the Hub root (including nested repositories)
  reports every new (`NEW`), modified (`MOD`) and deleted (`DEL`) file almost
  instantly, including paths ignored by Git (`.tmp/`, `node_modules/`, build
  directories) and files created and deleted before `git status` can scan them
  (shown as `(created and deleted)`). Only the contents of `.git/` are skipped.
- Git: staging, unstaging, commit, reset or branch switches only write to the
  git directory, so the dashboard compares the `stat` of `index`, `HEAD` and
  `logs/HEAD` in the git directory of the Hub and of each submodule every 0.5
  seconds (without calling git). When one of these three files changes, the
  dashboard runs `git status` after about 0.2 seconds and logs `STAGE`,
  `UNSTAGE`, `COMMIT`, `BRANCH` accordingly. In addition, every `--interval`
  seconds (default 10) the dashboard runs a periodic scan for the
  `REPOSITORIES` panel and rereads `.gitmodules` and the nested repositories to
  log `REPO` and `WARN`.
- Plans and Reviews: reread on every git scan; while `fs.watch` is running they
  are also reread as soon as a Markdown file outside the hidden directories
  changes.
- Scan pacing: an event-driven scan runs at least 0.5 seconds after the previous
  scan for git changes and 3 seconds for file changes; events arriving during a
  scan are covered by exactly one follow-up scan, so nothing is missed and git
  commands never overlap. When nothing changes, the dashboard only calls git at
  the `--interval`.
- Grouping to keep the log from overflowing: file events are batched for 0.7
  seconds, then grouped by repository, top-level directory and kind; a group of
  more than 3 files becomes one line with a count, for example
  `NEW hub/node_modules/ ×1200 · node_modules/a/index.js`. `STAGE` and `UNSTAGE`
  are grouped the same way, for example after `git add .`. The log keeps the 400
  most recent events.
- Limits: `NEW` versus `MOD` is inferred from the file's creation time, so a
  file replaced by an atomic overwrite may show as `NEW`. If recursive `fs.watch`
  is unavailable (older operating system or Node) or fails, the dashboard logs a
  `SYS` line and falls back to detecting files with `git status` (staging,
  commits and branches are still reported immediately as above); in that mode
  it does not see paths ignored by Git or files created and deleted between two
  scans, and Plans and Reviews are only reread on the next git scan.

The quickest way is to double-click `.tools/dashboard/dashboard.bat` (or create
a Desktop shortcut to it). This file also accepts the options below, for example
`.tools\dashboard\dashboard.bat --no-intro`, and keeps the window open if the
dashboard fails.

Or run it in a separate terminal tab or pane:

```powershell
node .tools/dashboard/dashboard.js                 # scans git every 10 seconds by default
node .tools/dashboard/dashboard.js --interval 5 --files 15 --max-age 6
node .tools/dashboard/dashboard.js --plans 10      # show up to 10 Plan tasks (default 6)
node .tools/dashboard/dashboard.js --no-intro      # skip the boot screen
node .tools/dashboard/dashboard.js --once          # print one frame and exit
node .tools/dashboard/dashboard.js --once --rows 30  # a frame for a 30-row terminal
```

Press `q` or `Ctrl+C` to quit, `r` to rescan immediately; any other key skips
the boot screen.

AI data comes from the status line: `~/.claude/statusline-command.sh` writes the
JSON it receives from Claude Code to `~/.claude/dashboard/sessions/<session_id>.json`
each time the status line updates. The figures are therefore only as fresh as the
latest update, and only Claude Code sessions are shown (not Codex). The "what it
is doing" state is read from the end of the session's transcript.

## claude-resume

`claude-resume/resume.ps1` resumes a Claude Code session after the 5-hour quota
resets; logs go to `.tmp/claude-resume/logs/`. Schedule it once with Task
Scheduler (the date must be in `yyyy/MM/dd` form, and the machine must be logged
in and awake):

```powershell
schtasks /Create /TN "ClaudeResume" /SC ONCE /SD yyyy/MM/dd /ST HH:mm /TR "pwsh -NoProfile -ExecutionPolicy Bypass -File D:\Project\.repository\PIRL-framework\.tools\claude-resume\resume.ps1 -SessionId <id>" /F
```

`<id>` must be the full UUID (from the `02 // AGENTS` panel of the dashboard) or
an exactly matching session name; `-p` mode does not accept a shortened ID such
as the last 8 characters. Omit `-SessionId <id>` to continue the repository's
most recent session.

Before doing long work after a reset, check whether two sessions are running at
the same time, because an interactive session may also continue on its own:
`Get-CimInstance Win32_Process -Filter "Name='claude.exe'"`.

## claude-schedule

`claude-schedule/schedule.ps1` schedules a Claude Code task to run once, for
when you know in advance you will not be able to send a request at that time.
The task is created in the `\Claude\` folder of Task Scheduler and calls
`claude-schedule/run.ps1`; the prompt is stored in
`.tmp/claude-schedule/tasks/<name>.txt`, logs in `.tmp/claude-schedule/logs/`.

```powershell
# New session, full date and time; a short prompt written inline
.tools\claude-schedule\schedule.ps1 -Name review-t01 -At "2026-10-10 08:00" -Prompt "Review the implementation of Plan T01 in <package>"
# A long prompt kept in a file; giving only HH:mm uses the next occurrence of that time
.tools\claude-schedule\schedule.ps1 -Name implement-t02 -At 23:30 -PromptFile D:\prompts\t02.md
# Continue an existing session instead of opening a new one
.tools\claude-schedule\schedule.ps1 -Name fix-t03 -At 06:00 -Prompt "..." -SessionId <uuid>

.tools\claude-schedule\schedule.ps1 -List               # state, next run, result of the last run
.tools\claude-schedule\schedule.ps1 -Remove -Name review-t01
```

- `-At` accepts `yyyy-MM-dd HH:mm` or `HH:mm`, independent of the machine's date
  format. A task with the same name is an error; add `-Force` to overwrite.
- The prompt is passed verbatim, with only one sentence added asking it to end
  with a summary; to commit or push, say so explicitly in the prompt.
  `-PermissionMode` defaults to `auto`.
- `-SessionId` follows the same rule as `claude-resume`: the full UUID or an
  exactly matching session name.
- The task runs only while you are logged in to Windows. If the machine is off
  or asleep at the scheduled time, the task runs as soon as the machine wakes
  up; waking the machine from sleep works only when Power Options enables
  "Allow wake timers". The task still runs on battery.
- Tasks that have run are not deleted automatically; clean them up with `-Remove`.
- A task may run at the same time as a session already open on the same working
  tree (especially with `-SessionId` or when it runs late right after the
  machine wakes), so check as with `claude-resume` before continuing work.
