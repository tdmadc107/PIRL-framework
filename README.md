# PIRL Framework

**Plan – Implement – Review Layer**: a Hub that coordinates software development
work for AI Agents, running entirely on instruction files.

You assign work in plain words. The Agent reads [`AGENTS.md`](AGENTS.md), picks
the right layer, splits the work among specialist roles, records the results as
files in the repository, then improves the instruction files themselves after
each run.

## What the framework does

- **Three layers, three skills.** Plan settles the work to do and the quality
  gates (QG). Implement edits the source according to the Plan. Review checks
  the result against the QGs by reasoning on the source. Each layer is run
  through its skill in `.skills/` (`pirl-plan`, `pirl-implement`, `pirl-review`).
- **Any repository.** The product repositories are not part of the Hub. You
  name the target repository of each request; the Agent reads that
  repository's own context documentation (its `AGENTS.md`, `CLAUDE.md`, README
  and similar).
- **AI Agent roles.** Each layer assigns work to roles with the right expertise,
  for example `business-analyst`, `backend-developer`, `code-reviewer`.
- **Self-improvement.** At the end of each layer run, the `process-auditor` role
  finds each role's mistakes, fixes the relevant instruction files at the root,
  writes a JSONL record and reports what was fixed and where.

The framework does not build, does not run the application for acceptance and
does not deploy. Those belong to your build/test/release stage. Implement only
writes and runs functional tests related to the request, and captures layout
with mocks when the UI changes.

## Requirements

- An AI Agent that can read files in the repository and run commands, for
  example Claude Code. If the host loads `AGENTS.md` automatically, it works
  right away; if not, ask the Agent to read `AGENTS.md` before assigning work.
- Git.
- Python 3.9 or later, for the validator and the record tool.
- Node.js (20 or later recommended), if you use the dashboard.
- PowerShell 7 (`pwsh`) on Windows, if you use `claude-resume` or
  `claude-schedule`.

## Quick start

### 1. Get the Hub

```powershell
git clone https://github.com/tdmadc107/PIRL-framework.git
```

### 2. Have a target repository ready

Any local Git repository works; nothing needs registering. Give its path in your
request, relative to the Hub root or absolute. If you want to keep clones
inside the Hub, put them in `.repos/`, which Git ignores.

The Agent learns the repository from the repository itself: architecture,
conventions, the command that runs tests by file or name, UI languages and
viewports, known gaps. If the repository has no such document yet, you can
assign the Agent to write one (for example its `AGENTS.md`) as a standalone
task.

### 3. Assign work

No special commands or keywords are needed; just say it:

| You want to | Example request | The Agent runs |
| --- | --- | --- |
| Plan | "Create a Plan for `../shop-web`: customers get an email when an order is cancelled" | `pirl-plan` skill |
| Implement | "Implement Plan T01 in `<package>`" | `pirl-implement` skill |
| Review | "Review the implementation of Plan T01" | `pirl-review` skill |
| Fix per a Review | "Fix per report `<report path>`" | `pirl-implement` skill, repair run |
| Small work outside the chain | "Update the AGENTS.md of shop-web" | Standalone task |
| Edit the framework itself | "Fix the cleanup rule in the router" | Framework maintenance |
| Just ask | "Which tasks does Plan T01 depend on?" | Answer, no files created |

Each layer runs only when you ask for it; the Agent does not move on to the next
layer by itself. The Agent picks the smallest team of roles with enough
expertise. To choose the team yourself, name the roles in your request; the role
catalog is in the [standalone and maintenance instructions](.agents/instructions/standalone-and-maintenance.instructions.md#role-catalog).

Plans and reports go where you say. If you name no location, they are created
under the Hub root. Inside the Hub, Git ignores Plan packages and their reports
(directories named `<request-slug>_<YYYYMMDD-HHmmss>/`), because they describe
your projects.

## A full working cycle

1. **Plan.** The Agent investigates the source and asks when a product decision
   is missing. The result is a Plan package `<request-slug>_<YYYYMMDD-HHmmss>/`,
   one file per task with: What to do (REQs), How to do it, Participating roles,
   Required quality gates (QGs). Read and settle the Plan before implementing.
2. **Implement.** The Agent edits the source in the target repository, within
   the Plan's scope. Verification roles conclude each QG by reasoning on the
   source. The results go into the `Implementation Record` section at the end of
   the Plan file. When the UI changes, layout screenshots are in
   `.tmp/layout-snapshots/` (not in git).
3. **Review.** The Agent checks each QG against the source and writes a report
   `<plan-set>/<task>/round-<NN>-review-...md`; with the default location it
   sits inside the Plan package. The report has two sections: `Business` (a
   PASS, FAIL or BLOCKED conclusion with FINDs, RISKs and BLOCKs) and
   `Evaluations` (an assessment of each role of the Implement run).
4. **Fix.** When Business is FAIL, assign "Fix per report ...". Implement runs a
   repair run with the team named in the report, then you ask for a new Review
   round.
5. **Commit.** The Agent commits or pushes only when you ask. Changes in the
   target repository are committed in that repository; a Hub commit carries the
   framework improvements of the same run. Plans, reports and records stay on
   your machine.

## Reading the self-improvement part after each run

At the end of each Plan, Implement or Review run, the Agent's response has:

- **Self-improvement:** the record ID, and for each applied improvement: the
  issue, cause, file and section edited, old → new version. Look at the diff of
  these files before committing.
- **Needs confirmation:** the closing block of the answer; it has a point about
  this improvement only when the improvement would loosen a safety rule. You
  choose to apply, skip, or have it re-evaluated by a separate agent; the
  details of the issue and the change are in the "Self-improvement" section.
  The evaluation is always delegated to a separate agent; only when the host
  cannot create agents does the Agent evaluate itself and state the reason.

Safety rules (commit, push, secrets, destructive actions, points that need your
decision) are never loosened by self-improvement without your consent. The full
definition is in [`AGENTS.md`](AGENTS.md#safety-rules-and-self-improvement).

Records live in `.agents/evals/records/<layer>/<YYYY-MM-DD>.jsonl`. They
describe your projects, so Git ignores that directory: records stay on your
machine and the tool still reads them. To look up history:

```powershell
python -B .agents/evals/layer_record.py query --issue-key <issue key>
python -B .agents/evals/layer_record.py query --layer review --plan-set <package> --task T01
python -B .agents/evals/layer_record.py check
```

## Local tools

- **Dashboard:** monitors Claude Code sessions, quota, Plan/Review progress, file
  and git changes in the Hub and in the Git repositories found inside it. Run `.tools\dashboard\dashboard.bat` or
  `node .tools/dashboard/dashboard.js`.
- **claude-resume, claude-schedule:** resume a session after the quota resets,
  and schedule a task with Windows Task Scheduler.

Details and options: [`.tools/README.md`](.tools/README.md).

## Checks after editing the framework

```powershell
python -B -m unittest discover -s .agents/evals/tests -p "test_*.py"
```

Pick the check commands that match what you edited: see
[Framework checks](.agents/instructions/standalone-and-maintenance.instructions.md#framework-checks).

## Directory structure

```text
AGENTS.md        root: core rules, flow, choosing the kind of work, delegation, target repository
CONTEXT.md       how responses to the user are presented
.agents/         layer instructions, roles, evals (validator, record tool, tests, local records)
.skills/         the pirl-plan, pirl-implement and pirl-review skills
.tools/          dashboard, claude-resume, claude-schedule
.tmp/            temporary output, not in git
```

Full tree: [framework structure](.agents/instructions/standalone-and-maintenance.instructions.md#framework-structure).

## Reference documentation

| To learn about | Read |
| --- | --- |
| Core rules, flow, delegation, target repository | [`AGENTS.md`](AGENTS.md) |
| How the Agent presents answers, summaries, proposals | [`CONTEXT.md`](CONTEXT.md) |
| Choosing a layer, shared contracts, functional tests, self-improvement | [Router](.agents/instructions/layered-task-execution.instructions.md) |
| Each layer's decisions | [Plan](.agents/instructions/plan.instructions.md), [Implement](.agents/instructions/implement.instructions.md), [Review](.agents/instructions/review.instructions.md) |
| Running each layer, file formats, templates | [`pirl-plan`](.skills/pirl-plan/SKILL.md), [`pirl-implement`](.skills/pirl-implement/SKILL.md), [`pirl-review`](.skills/pirl-review/SKILL.md) |
| Each role's expertise | [`.agents/roles/`](.agents/roles/) |
| Local tools | [`.tools/README.md`](.tools/README.md) |

## License

[MIT](LICENSE).
