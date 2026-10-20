# PIRL Framework

**Plan – Implement – Review Layer**: a Hub that coordinates software development
work for AI Agents, running entirely on instruction files.

You assign work in plain words. The Agent reads [`AGENTS.md`](AGENTS.md), picks
the right layer, splits the work among specialist roles, records the results as
files in the repository, then improves the instruction files themselves after
each run.

## What the framework does

- **Three layers.** Plan settles the work to do and the quality gates (QG).
  Implement edits the source according to the Plan. Review checks the result
  against the QGs by reasoning on the source.
- **Multiple repositories.** Each product repository is a git submodule in
  `.repos/` and is registered in `.repos/manifest.yaml`.
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
git clone --recurse-submodules https://github.com/tdmadc107/PIRL-framework.git
```

### 2. Register a product repository

You can ask the Agent to do this step, for example: "Register repository `<url>`
with id `shop-web`". Doing it by hand has two parts:

```powershell
git submodule add <url> .repos/shop-web
```

Then add an entry to `.repos/manifest.yaml`. When adding the first entry,
replace `repos: {}` with `repos:`.

```yaml
schema: "pirl-repos/v1"
repos:
  shop-web:
    path: ".repos/shop-web"
    product: "Online store"
    stack: "React + Node.js"
    keywords: ["store", "cart", "checkout"]
    commands:
      test: "npm test -- <test file>"
    context_docs: [".agents/llm-docs/repos/shop-web.md"]
    rules: []
```

A repository counts as registered only when it has both the submodule and the
manifest entry. If either is missing, the Agent does not route to that
repository yet, and the dashboard shows a warning.

It is worth adding context documentation at `.agents/llm-docs/repos/shop-web.md`,
covering: architecture, conventions, UI languages and viewports to capture in
layout snapshots, and known gaps. You can assign the Agent to write this
document as a standalone task.

### 3. Assign work

No special commands or keywords are needed; just say it:

| You want to | Example request | The Agent runs |
| --- | --- | --- |
| Plan | "Create a Plan for: customers get an email when an order is cancelled" | Plan |
| Implement | "Implement Plan T01 in `.agents/plan/<package>`" | Implement |
| Review | "Review the implementation of Plan T01" | Review |
| Fix per a Review | "Fix per report `<report path>`" | Implement, repair run |
| Small work outside the chain | "Update the context documentation of shop-web" | Standalone task |
| Edit the framework itself | "Fix the cleanup rule in the router" | Framework maintenance |
| Just ask | "Which tasks does Plan T01 depend on?" | Answer, no files created |

Each layer runs only when you ask for it; the Agent does not move on to the next
layer by itself. The Agent picks the smallest team of roles with enough
expertise. To choose the team yourself, name the roles in your request; the role
catalog is in [`AGENTS.md`](AGENTS.md#ai-agent-roles).

## A full working cycle

1. **Plan.** The Agent investigates the source and asks when a product decision
   is missing. The result is a Plan package in
   `.agents/plan/<request-slug>_<YYYYMMDD-HHmmss>/`, one file per task with: What
   to do (REQs), How to do it, Participating roles, Required quality gates (QGs).
   Read and settle the Plan before implementing.
2. **Implement.** The Agent edits the source in the product repository, within
   the Plan's scope. Verification roles conclude each QG by reasoning on the
   source. The results go into the `Implementation Record` section at the end of
   the Plan file. When the UI changes, layout screenshots are in
   `.tmp/layout-snapshots/` (not in git).
3. **Review.** The Agent checks each QG against the source and writes a report to
   `.agents/review/<plan-set>/<task>/round-<NN>-review-...md`. The report has two
   sections: `Business` (a PASS, FAIL or BLOCKED conclusion with FINDs, RISKs and
   BLOCKs) and `Evaluations` (an assessment of each role of the Implement run).
4. **Fix.** When Business is FAIL, assign "Fix per report ...". Implement runs a
   repair run with the team named in the report, then you ask for a new Review
   round.
5. **Commit.** The Agent commits or pushes only when you ask. Changes in a
   product repository are committed in the submodule first; then a Hub commit
   includes the submodule pointer, Plan, report, records and framework
   improvements of the same run.

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
definition is in
[`core-agent.rule.md`](.agents/llm-docs/rules/core-agent.rule.md#safety-rules-and-self-improvement).

Records live in `.agents/records/<layer>/<YYYY-MM-DD>.jsonl`. To look up history:

```powershell
python -B .agents/llm-docs/evals/layer_record.py query --issue-key <issue key>
python -B .agents/llm-docs/evals/layer_record.py query --layer review --plan-set <package> --task T01
python -B .agents/llm-docs/evals/layer_record.py check
```

## Local tools

- **Dashboard:** monitors Claude Code sessions, quota, Plan/Review progress, file
  and git changes in the Hub and every repository, and warns about partially
  registered repositories. Run `.tools\dashboard\dashboard.bat` or
  `node .tools/dashboard/dashboard.js`.
- **claude-resume, claude-schedule:** resume a session after the quota resets,
  and schedule a task with Windows Task Scheduler.

Details and options: [`.tools/README.md`](.tools/README.md).

## Checks after editing the framework

```powershell
python -B -m unittest discover -s .agents/llm-docs/evals/tests -p "test_*.py"
```

Pick the check commands that match what you edited: see
[Framework checks](AGENTS.md#framework-checks).

## Directory structure

```text
AGENTS.md        root: structure, flow, roles, repository routing
CONTEXT.md       how responses to the user are presented
.agents/         layer instructions, roles, rules, tools, Plans, reports, records
.repos/          manifest and submodules of the product repositories
.tools/          dashboard, claude-resume, claude-schedule
.tmp/            temporary output, not in git
```

Full tree: [`AGENTS.md`](AGENTS.md#structure).

## Reference documentation

| To learn about | Read |
| --- | --- |
| Structure, flow, roles, repository registration | [`AGENTS.md`](AGENTS.md) |
| How the Agent presents answers, summaries, proposals | [`CONTEXT.md`](CONTEXT.md) |
| Choosing a layer, shared contracts, self-improvement | [Router](.agents/instructions/layered-task-execution.instructions.md) |
| Each layer in detail | [Plan](.agents/instructions/plan.instructions.md), [Implement](.agents/instructions/implement.instructions.md), [Review](.agents/instructions/review.instructions.md) |
| Each role's expertise | [`.agents/roles/`](.agents/roles/) |
| Safety and test rules | [`core-agent`](.agents/llm-docs/rules/core-agent.rule.md), [`test-verification`](.agents/llm-docs/rules/test-verification.rule.md) |
| Local tools | [`.tools/README.md`](.tools/README.md) |

## License

[MIT](LICENSE).
