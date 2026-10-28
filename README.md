# PIRL Framework

**Plan – Implement – Review Layer**: a Hub that coordinates software development work for AI Agents, running entirely on instruction files.

You assign work in plain words.
The Agent reads [`AGENTS.md`](AGENTS.md), picks the right layer, splits the work among specialist roles, records the results as files in the repository, then improves the instruction files themselves after each run.

## What the framework does

- **Three layers, five skills.** Plan settles the work to do and the quality gates (QG).
  Implement edits the source according to the Plan.
  Review checks the result against the QGs by reasoning on the source.
  Each layer is run through its skill in `.skills/` (`pirl-plan`, `pirl-implement`, `pirl-review`); work outside a layer uses `pirl-standalone` or, to change the framework itself, `pirl-maintain`.
- **Any repository, any host.** PIRL lives in `.pirl/` inside your workspace and works with the host you already use.
  The Agent reads the target repository's own context documentation (its `AGENTS.md`, `CLAUDE.md`, README and similar).
- **AI Agent roles.** Each layer assigns work to roles with the right expertise, for example `business-analyst`, `backend-developer`, `code-reviewer`.
- **Self-improvement.** At the end of each layer run, the `process-auditor` role finds each role's mistakes, fixes the relevant instruction files at the root, writes a JSONL record and reports what was fixed and where.

The framework does not build, does not run the application for acceptance and does not deploy.
Those belong to your build/test/release stage.
Implement only writes and runs functional tests related to the request, and captures layout with mocks when the UI changes.

## Requirements

- An AI Agent host that can read files and run commands, for example Claude Code, GitHub Copilot, Codex CLI, Cursor or Gemini CLI.
  Layers run their roles in sub-agents; a host that cannot create them still works, and the Agent says so.
- Git.
- Node.js 18 or later, to install and update PIRL with `npx`.
- Python 3.9 or later, for the validator, the record tool and the skills' scripts.

## Quick start

### 1. Install PIRL into your workspace

Open a terminal in the folder where you work, normally the root of your repository, and run:

```powershell
npx pirl-framework
```

`npx` downloads the package and runs its installer once; it adds nothing to `node_modules/` or `package.json`.
The installer copies the framework into `.pirl/`, asks which hosts you use (the ones it finds in the folder are already marked) and writes their adapter files.
In a script or CI, where nothing can be asked, name the hosts: `npx pirl-framework init --host claude,codex`.
To be sure to get the newest version, write `npx pirl-framework@latest`.

The installer refuses to run inside `.pirl/`, asks before installing in a subfolder of a Git repository, and never overwrites a file it did not create.

### 2. What each host gets

Each host you choose gets its full set of adapter files, in that host's own folders, even when another host could read them too:

| Host (`--host`) | Instructions loaded in every session | Skills |
| --- | --- | --- |
| Claude Code (`claude`) | `.claude/rules/pirl.md` | `.claude/skills/pirl-*/` |
| GitHub Copilot (`copilot`) | `.github/instructions/pirl.instructions.md` | `.github/skills/pirl-*/` |
| Codex CLI (`codex`) | A marked block in `AGENTS.md`: `.pirl/AGENTS.md` itself, or a pointer to it (see below) | `.agents/skills/pirl-*/` |
| Cursor (`cursor`) | `.cursor/rules/pirl.mdc` | `.cursor/skills/pirl-*/` |
| Gemini CLI (`gemini`) | A marked block in `GEMINI.md` | `.gemini/skills/pirl-*/` |

The instructions hold `.pirl/AGENTS.md` and `.pirl/CONTEXT.md`, so the core rules apply from the first answer of every session.
Codex CLI stops reading its instruction files past 32 KiB by default, which the full text would exceed, so its block holds `.pirl/AGENTS.md` without `CONTEXT.md`.
Once your `AGENTS.md` also holds your own content, `sync` turns the block into a pointer to `.pirl/AGENTS.md`, which the Agent reads at the start of the session, so your content and PIRL's together stay under that limit.
Each skill entry points to its skill in `.pirl/.skills/`.
In a file you own, such as your `AGENTS.md`, PIRL only writes between `<!-- pirl:begin -->` and `<!-- pirl:end -->`; the rest stays your repository's own documentation.
When the repository has no such file yet, the installer creates it with only the PIRL block, and removing the host deletes it again.
PIRL never writes to `CLAUDE.md`: the Claude Code instructions are a separate rule file, which Claude Code loads whether or not the repository has a `CLAUDE.md`.
When you use several hosts, a host that also reads another host's folders may see PIRL twice.

Commit `.pirl/` and the adapter files with your repository, so the whole team shares the same rules and reviews the framework's improvements in pull requests.
Plans, reports and records stay out of Git through `.pirl/.gitignore`.

### 3. Assign work

No special commands or keywords are needed; just say it:

| You want to | Example request | The Agent runs |
| --- | --- | --- |
| Plan | "Create a Plan: customers get an email when an order is cancelled" | `pirl-plan` skill |
| Implement | "Implement Plan T01 in `<package>`" | `pirl-implement` skill |
| Review | "Review the implementation of Plan T01" | `pirl-review` skill |
| Fix per a Review | "Fix per report `<report path>`" | `pirl-implement` skill, repair run |
| Small work outside the chain | "Update the AGENTS.md of this repository" | `pirl-standalone` skill |
| Edit the framework itself | "Fix the cleanup rule in the router" | `pirl-maintain` skill |
| Just ask | "Which tasks does Plan T01 depend on?" | Answer, no files created |

The target repository is the workspace that holds `.pirl/` when it is a Git repository and you name no other one.
To work on another repository, give its path, relative to `.pirl/` or absolute.
The Agent learns the repository from its own documentation: architecture, conventions, the command that runs tests by file or name, UI languages and viewports, known gaps.
If the repository has no such document yet, you can ask the Agent to write one as a standalone task.

Each layer runs only when you ask for it; the Agent does not move on to the next layer by itself.
The Agent picks the smallest team of roles with enough expertise.
To choose the team yourself, name the roles in your request; the role catalog is in the [standalone and maintenance instructions](.agents/instructions/standalone-and-maintenance.instructions.md#role-catalog).

Plans and reports go where you say.
If you name no location, they are created under `.pirl/`, where Git ignores Plan packages and their reports (directories named `<request-slug>_<YYYYMMDD-HHmmss>/`), because they describe your projects.

### 4. Keep, update or remove

| Command | What it does |
| --- | --- |
| `npx pirl-framework` | With `.pirl/` already there: shows the version, hosts and local changes, then offers to add hosts, update or remove hosts |
| `npx pirl-framework init --host <list>` | Adds the adapter files of more hosts |
| `npx pirl-framework@latest update` | Updates `.pirl/` and keeps the improvements made in your repository: a file changed only upstream is replaced, a file changed on both sides is merged with `git merge-file` |
| `npx pirl-framework update --continue` | Applies an update that stopped on conflicts, once you resolved them |
| `npx pirl-framework remove --host <list>` | Removes the adapter files of those hosts; `.pirl/` stays until you delete it |
| `node .pirl/bin/pirl.mjs sync` | Regenerates the adapter files after `.pirl/AGENTS.md`, `.pirl/CONTEXT.md` or a skill changed; the Agent runs it after improving the framework |
| `node .pirl/bin/pirl.mjs check` | Fails while an adapter file is out of date |

When an update finds a file changed both in your repository and upstream on the same lines, it changes nothing yet: it writes each conflicting file with conflict markers under `.pirl/.tmp/update/files/`, you edit those copies, and `update --continue` applies the whole update at once.

## A full working cycle

1. **Plan.** The Agent investigates the source and asks when a product decision is missing.
   The result is a Plan package `<request-slug>_<YYYYMMDD-HHmmss>/`, one file per task with: What to do (REQs), How to do it, Participating roles, Required quality gates (QGs).
   Read and settle the Plan before implementing.
2. **Implement.** The Agent edits the source in the target repository, within the Plan's scope.
   Verification roles conclude each QG by reasoning on the source.
   The results go into the `Implementation Record` section at the end of the Plan file.
   When the UI changes, layout screenshots are in `.tmp/layout-snapshots/` (not in git).
3. **Review.** The Agent checks each QG against the source and writes a report `<plan-set>/<task>/round-<NN>-review-...md`; with the default location it sits inside the Plan package.
   The report has two sections: `Business` (a PASS, FAIL or BLOCKED conclusion with FINDs, RISKs and BLOCKs) and `Evaluations` (an assessment of each role of the Implement run).
4. **Fix.** When Business is FAIL, assign "Fix per report ...".
   Implement runs a repair run with the team named in the report, then you ask for a new Review round.
5. **Commit.** The Agent commits or pushes only when you ask.
   The product changes and the framework improvements of the same run go in two separate commits, the product changes first.
   Plans, reports and records stay on your machine.

## Reading the self-improvement part after each run

At the end of each Plan, Implement or Review run, the Agent's response has:

- **Self-improvement:** the record ID, and for each applied improvement: the issue, cause, file and section edited, old → new version.
  Look at the diff of these files before committing.
- **Needs confirmation:** the closing block of the answer; it has a point about this improvement only when the improvement would loosen a safety rule.
  You choose to apply, skip, or have it re-evaluated by a separate agent; the details of the issue and the change are in the "Self-improvement" section.
  The evaluation is always delegated to a separate agent; only when the host cannot create agents does the Agent evaluate itself and state the reason.

Safety rules (commit, push, secrets, destructive actions, points that need your decision) are never loosened by self-improvement without your consent.
The full definition is in [`AGENTS.md`](AGENTS.md#safety-rules-and-self-improvement).

Records live in `.pirl/.agents/evals/records/<layer>/<YYYY-MM-DD>.jsonl`.
They describe your projects, so Git ignores that directory: records stay on your machine and the tool still reads them.
To look up history, from `.pirl/`:

```powershell
python -B .agents/evals/layer_record.py query --issue-key <issue key>
python -B .agents/evals/layer_record.py query --layer review --plan-set <package> --task T01
python -B .agents/evals/layer_record.py check
```

## Checks after editing the framework

```powershell
python -B -m unittest discover -s .agents/evals/tests -p "test_*.py"
node bin/pirl.mjs sync
node bin/pirl.mjs check
```

Run them from the Hub root: `.pirl/` in your workspace, or the root of this repository when you work on the framework itself.
Pick the check commands that match what you edited: see [Framework checks](.agents/instructions/standalone-and-maintenance.instructions.md#framework-checks).

## Directory structure

```text
AGENTS.md        root: core rules, flow, choosing the kind of work, delegation, target repository
CONTEXT.md       how responses to the user are presented
.agents/         layer instructions, roles, evals (validator, record tool, tests, local records)
.skills/         the pirl-plan, pirl-implement, pirl-review, pirl-standalone and pirl-maintain skills
bin/pirl.mjs     installer: install, host adapters, sync, update
package.json     npm package (source repository only)
manifest.json    installed version and files (installed copy only)
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
| Running a standalone task or framework maintenance | [`pirl-standalone`](.skills/pirl-standalone/SKILL.md), [`pirl-maintain`](.skills/pirl-maintain/SKILL.md) |
| Each role's expertise | [`.agents/roles/`](.agents/roles/) |

## License

[MIT](LICENSE).
