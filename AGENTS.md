# Start here

This repository is PIRL (Plan – Implement – Review Layer): a Hub that
coordinates software development work for AI Agents. The framework runs entirely
on instruction files: three layers, Plan, Implement and Review, define what the
Agent does, how it does it and what it produces. Each layer is run through its
skill in `.skills/`. The product repositories the Agent works on are not part of
the Hub; the user names the target repository of each request, as described in
[Target repository](#target-repository).

Always apply the [core rules](#core-rules) on safety, scope and evidence, even
when no layer is opened.

Read [CONTEXT.md](CONTEXT.md) before the first answer of each session and apply
it to every answer, summary, report and proposal sent to the user, even when no
layer is opened.

# Structure

```text
AGENTS.md                         root: core rules, structure, flow, Agent roles, target repository
CONTEXT.md                        how responses to the user are presented
.agents/
  instructions/
    layered-task-execution.instructions.md   router: layer selection, shared contracts
    plan.instructions.md                     Plan layer contract
    implement.instructions.md                Implement layer contract
    review.instructions.md                   Review layer contract
  roles/          expertise of each role: <role-id>.role.md
  evals/
    validate_layer_artifact.py   Plan/Review validator
    layer_record.py              self-evaluation record tool
    tests/                       tests of the tools, the role catalog and the skills
    records/                     self-evaluation records: <layer>/<YYYY-MM-DD>.jsonl (local, ignored by Git)
.skills/
  pirl-plan/      Plan skill: SKILL.md, assets/, references/, scripts/
  pirl-implement/ Implement skill: same layout
  pirl-review/    Review skill: same layout
.tools/           local tools (dashboard, claude-resume, claude-schedule)
.tmp/             temporary output, ignored by Git (layout snapshots, tool logs)
<plan-set>/       Plan package and its Review reports, created at the Hub root unless the user names another directory (ignored by Git)
```

| Source | Owns |
| --- | --- |
| `AGENTS.md` | Core rules, structure, flow, role catalog, target repository, check commands, Git |
| `CONTEXT.md` | How answers, summaries, reports, proposals and syntheses sent to the user are presented |
| Router | How to choose a layer, layer boundaries, shared contracts (verification by reasoning, functional tests, layout, shared snapshots and older records, self-evaluation and improvement, cleanup) |
| Layer instruction | Each role's responsibilities at the layer, the decisions the layer settles, the content its output must hold and its exit conditions |
| Skill | How one layer run is carried out: when the skill applies, the ordered procedure linking each step to the contract that owns it, the output format and template, helper scripts |
| Role file | Shared expertise of one role, identical in every layer |
| Evals | Checking handoff artifacts, writing and checking records, the tests of the framework tools and skills |
| Record | History of self-evaluation and improvement for each layer run; appended only through the tool and kept on the local machine |

Each rule lives in exactly one owner; other files point to it instead of
copying it.

# Core rules

## Safety

- Preserve unrelated user changes, including uncommitted work in the Hub and in
  every target repository.
- Hub-root operational paths are `.git`, `.github`, `.gitignore`, `.gitmodules`,
  `.vscode` and `LICENSE`; the working directory of every target repository,
  wherever it lives, is protected the same way. Never delete or move them, and
  never reset or clean them wholesale (for example `git clean`,
  `git reset --hard`, `git checkout -- .`, `git submodule deinit`, or deleting a
  repository directory) unless the user explicitly asks for that operation.
  Removing temporary files that the current run created inside them follows the
  router's cleanup rule.
- Edit files inside those paths only as the active layer contract or the user's
  direct assignment allows. For example, Implement edits product files in the
  target repository within the scope its contract defines. Never edit files
  inside `.git` by hand.
- Files inside a target repository, including its own `.github`, `.gitignore`
  or `.vscode`, follow that task scope, not the Hub-root list.
- Do not switch branches, reset, or stash inside a target repository, or update
  a submodule pointer, unless the user asks.
- Do not commit, push, deploy, alter production data, expose secrets, or contact
  people without explicit authority.
- Do not run destructive or externally consequential actions beyond the user's
  authorized scope.
- Never print, log, commit, or include in Plans, reports, records, or replies:
  credentials, tokens, private keys, API keys, password hashes, one-time codes,
  session identifiers, private payloads, or private reasoning.
- Do not invent command, agent, source, or verification results.

### Safety rules and self-improvement

Safety rules are: every rule in this Safety section; the [Git](#git) section;
and any rule anywhere in the framework that limits commit, push, deploy,
secrets or destructive and externally consequential actions, or that requires
the user's decision or authorization. The self-improvement guards of the router
are safety rules too: the mode-self guard (a self-evaluation record never
applies fixes itself; improvements that touch no safety rule are applied in the
same turn as user-directed maintenance under the standing authorization in the
[Workflow](#workflow) section, and everything else goes to the user) and the
never-loosen rule below, including this definition. That authorization covers
improvements that touch no safety rule and nothing else.

Code and tests that enforce a safety rule are part of that rule: for example,
the check in `.agents/evals/layer_record.py` that rejects applied fixes from a
self-evaluation, together with its tests.

Self-improvement may make a safety rule stricter or clearer. It must never
loosen, narrow, remove or work around one, even when that rule blocked the
current run. A change that would loosen a safety rule is not applied: the run
records it as pending with reason `safety` and asks the user, and only the
user's explicit approval allows it.

## Scope

- Keep work bounded to the user request, the selected layer, the target
  repository's own context documentation, and the repositories the user
  authorized.
- Prefer existing repository patterns over new abstractions unless evidence
  justifies a change.
- Before important edits, inspect the relevant source and workspace state:
  build/package config, the entrypoint or route involved, related domain types,
  and nearby tests or their absence.
- Do not silently switch layers, repositories, roles, or delivery modes; state
  the handoff when another owner is needed.
- Keep assumptions, deferred work, and genuine blockers explicit.

## Evidence

Support important claims with at least one of:

- file path and symbol;
- command and summarized result;
- raw task input or user-provided fact;
- a rule, instruction, or repository document that applies to the task;
- an independent role's finding that cites its evidence.

When recording evidence:

- Distinguish observed fact, inference, assumption, and proposal.
- A claim that something is absent, always or never true, or differs from its
  source is observed fact only after everything that could contradict it has
  been read: every measured value, and for styles every rule that can reach the
  element (component, global, inherited, shared tokens). Otherwise it is an
  inference; say what was not read. Whoever carries a finding into a record,
  report or reply to the user first checks it against that evidence, or labels
  it unchecked and names what was not read.
- Back every claim about what the user said, was asked, answered, confirmed or
  delegated with a source: their message, a Plan, a record or a report. When
  none is found, write that it was not asked or not found; never fill the gap
  from assumption or from the user's silence.
- Record the exact command, working directory, status, and relevant output for
  verification claims.
- Treat failed or unavailable evidence honestly; include the blocker and next
  falsification step.

# Workflow

Plan → Implement → Review. Each layer runs only when the user's own words ask
for that layer, per the
[router's conditions for opening a layer](.agents/instructions/layered-task-execution.instructions.md#choosing-a-layer);
no layer opens the next one on its own.

| Layer | Skill | Result | Contract |
| --- | --- | --- | --- |
| Plan | [`pirl-plan`](.skills/pirl-plan/SKILL.md) | Plan files: REQs, approach, roles, quality gates (QG) | [plan.instructions.md](.agents/instructions/plan.instructions.md) |
| Implement | [`pirl-implement`](.skills/pirl-implement/SKILL.md) | Changed source/docs/tests and an Implementation Record in the Plan file | [implement.instructions.md](.agents/instructions/implement.instructions.md) |
| Review | [`pirl-review`](.skills/pirl-review/SKILL.md) | A report with `Business` + `Evaluations`, checking the QGs by reasoning on the source | [review.instructions.md](.agents/instructions/review.instructions.md) |

Plan files and Review reports are written where the user says; when the user
names no location, they go under the Hub root, per the output format of the
matching skill.

Each layer run ends with
[self-evaluation and improvement](.agents/instructions/layered-task-execution.instructions.md#self-evaluation-and-improvement):
`process-auditor` finds each role's mistakes, fixes the relevant framework files
at the root, writes one record and reports what was fixed and where.

Framework improvement is a mandatory part of every run, not a proposal:
improvements that touch no safety rule are applied within the run, even when
the self-evaluation runs in `mode: self`, without waiting for the user to
confirm; the procedure lives in the
[router](.agents/instructions/layered-task-execution.instructions.md#self-evaluation-when-mode-self).
This authorization covers only improvements that touch no safety rule;
improvements that touch a safety rule still need the user's approval.

Loading order:

1. Read the [router](.agents/instructions/layered-task-execution.instructions.md);
   the router owns how to identify the kind of work and the boundaries between kinds.
2. Depending on the kind of work the router identifies:
   - Plan, Implement or Review: run that layer's skill (`.skills/pirl-<layer>/SKILL.md`);
     the skill loads exactly the layer contract and the resources each step
     needs. A host that loads skills on its own reaches the same file; a host
     that does not reads it like any other file.
   - [Standalone task](.agents/instructions/layered-task-execution.instructions.md#standalone-tasks),
     meaning work assigned directly outside a Plan's chain: no layer is activated.
   - [Framework maintenance](.agents/instructions/layered-task-execution.instructions.md#framework-maintenance):
     edit `AGENTS.md`, `CONTEXT.md`, instructions, roles, skills or tools
     themselves, within the scope the user assigns.
   - A question that only needs an explanation and creates no durable output:
     answer within its scope, create no files.
3. For work that touches a product repository, identify the
   [target repository](#target-repository), then read its context
   documentation.

Without a layer request, do the work directly as asked under the core rules,
without creating a Plan or report. When asked to create a Plan, the Agent picks
the smallest team of roles with sufficient expertise and records it in the
Plan; when the user names roles, keep exactly that list.

Every layer and every Agent follows the
[temporary-resource cleanup duty](.agents/instructions/layered-task-execution.instructions.md#cleaning-up-temporary-resources-before-handoff)
before handoff, including standalone work and framework maintenance.

# AI Agent roles

Each layer assigns work to AI Agents by role, matching the expertise the work
needs. This table is the only catalog of role IDs. A role's expertise lives in
`.agents/roles/<ID>.role.md`; its concrete responsibilities at each layer (what
it is assigned, its inputs, when it is done) live in the role table of the
corresponding layer file. The `Used in` column says where a role can be
selected: `plan`, `implement`, `verify` (QG verification at Implement),
`review`, or `audit` (self-evaluation at the end of each layer).

| ID | Expertise | Used in |
| --- | --- | --- |
| `business-analyst` | Business logic, REQs, QGs, missing product decisions | plan, review |
| `solution-architect` | API/data contracts, ownership, permission model, boundaries and dependencies between tasks | plan, review |
| `code-analyst` | Tracing data/control flow, callers/consumers, impact on documentation, scenario tables for multi-branch flows | plan, verify, review |
| `ux-designer` | Screens, display states, interaction flows, UI strings per language, layout per viewport | plan, verify, review |
| `backend-developer` | Non-UI code: API, domain, data, jobs, CLI, scripts, tools; accompanying docs and tests under FUT | implement |
| `frontend-developer` | UI code, i18n strings, layout snapshots with mocks; accompanying docs and tests under FUT | implement |
| `technical-writer` | Documentation that must match the source: context docs, contracts, indexes, status tables | implement |
| `code-reviewer` | Challenging the diff: bugs, regressions, permissions and security, data/state consistency, guards/validators/error handling | verify, review |
| `process-auditor` | Self-evaluating a layer run, finding root causes, improving the framework, writing records | audit |

Constraints that keep roles separate from skills:

- Closed catalog: only the IDs in this table. Adding, merging or removing a role
  means editing this table together with the role file, the layer file tables
  and the framework checks, in one change.
- Layers pick roles themselves following the layer file's guidance: Plan and
  Review by the "Select when" column; the Implement team for implementation and
  verification is chosen by the Plan. The user does not need to name roles, but
  when they do, keep exactly that list.
- A role file contains only shared expertise: the questions the role answers,
  how it works, warning signs, boundaries with other roles. It does not contain
  a layer's sequence, output templates, commands or completion conditions; those
  belong to the layer contract and the layer's skill.
- Roles have no artifacts, tools, skills or evaluation mechanism of their own;
  a role is evaluated through the layer's record.
- Knowledge specific to one repository lives in that repository's context
  documentation, not in role files or skills. Roles do not rely on a host's
  skill mechanism or custom agent configuration: the layer skills are plain
  files the coordinator reads and passes on.

Assignment principles, for all three layers:

- The coordinator (the Agent receiving the request from the user) is
  responsible for the final result: it assigns work and merges results by
  evidence, not by how many roles agree.
- This framework runs layers with AI agents: every selected role of a layer
  run, including `process-auditor`, runs in a separate agent (a host
  sub-agent). A request to run a layer is an explicit request to delegate work
  to agents; a host's default instruction that the user must ask before agents
  are created is satisfied by this rule, without the user repeating it in each
  run.
- Roles that do not need each other's results run in parallel; a role that
  needs another role's result runs after that role (`process-auditor` runs after
  the layer's output is settled). The coordinator does not do the delegated
  work itself.
- When delegating, pass the role file, the role's row in the layer file's table
  (plus every row that row refers to for its completion condition), sources,
  constraints, the settled direction and the part to examine; do not hide the
  solution and do not impose the conclusion.
- Self-perform (`mode: self`) only when the host has no mechanism to create
  agents in the session or the call to create an agent fails. The coordinator
  then takes on each role in turn in the layer's order and records the concrete
  reason in the record's `summary` and in the layer's output. Lack of
  delegation does not block the work.
- A role description does not prove an independent agent. To keep a role
  independent of drafts or existing conclusions of the same run (written by the
  coordinator or another role), leave them out of the assignment and state that
  the paths holding them must not be read, or place them outside the area the
  agent can read. Until that is ensured, record each role's actual level of
  independence in the output. Self-checking is recorded as self-checking; do
  not claim independent challenge or verification that did not happen.
- A reviewer outside the run's role team (another host tool or agent, not in
  the role catalog) that a role consulted while working is part of that role's
  actual level of independence, even when independence from drafts was
  ensured. The assignment asks the role to report every consultation; the
  coordinator records each role that consulted one in the run's output. That
  opinion is not a source of evidence and does not replace the role's reasoning
  on the sources the router allows.
- A role does not verify its own output.

# Target repository

The Hub holds no product repository and keeps no registry of them. The target
repository of a request is a local Git repository that the user names, by path
or by a name that identifies exactly one local directory, or that the settled
context names (a Plan's `target_repo`, a report).

- **Path.** A Plan records the target in `target_repo` as a path relative to the
  Hub root, or as an absolute path when the repository lives outside the Hub;
  `.` means the Hub itself. The path must be an existing directory when the Plan
  is handed off.
- **Context documentation.** The documents inside the target repository that
  tell agents how it works: architecture, conventions, commands (including how
  to run tests by file, class or name), the UI languages, viewports and
  breakpoint thresholds to capture in layout snapshots, notes on capture tooling
  (where the browser automation tool is and how to install it, how to launch a
  browser without touching the user's open session, how to run a stable dev
  server, known environment obstacles) and where known gaps are recorded. They
  are usually the repository's agent instruction file (for example `AGENTS.md`
  or `CLAUDE.md`), its README, its contributing guide or a documentation folder.
- **Rules of the repository.** Constraints that apply to one repository live in
  that repository's own documentation; the Hub has no per-repository rules.

Choosing the target repository:

1. Use the repository the user's words or the settled context name. Read only
   the context documentation of that repository.
2. Choose exactly one repository, unless the request explicitly names several;
   in that case handle and record each repository separately, including the
   contracts between them.
3. If the request needs a repository and none is named, or two repositories are
   equally plausible and the choice changes the result, ask one short question.
   If the analysis can safely continue, state the assumption and carry on.
4. Do not apply one repository's rules or assumptions to another, even when both
   use the same stack: commands, directory layout and conventions must be read
   again from the target repository.

# Framework checks

Pick the checks that match the change. They only validate handoff inputs and
outputs and do not grade the wording; instruction content is re-read against
the scenario that caused the problem.

```powershell
python -B .agents/evals/validate_layer_artifact.py --kind <plan|review> --path <file or directory>
python -B .agents/evals/layer_record.py <start|append|check|query> ...
python -B -m unittest discover -s .agents/evals/tests -p "test_*.py"
```

The first command checks Plan/Review files (schema, required fields, roles,
dependencies, time zone) and runs when they are handed off. The second writes
and checks self-evaluation records as the router describes; `check` runs after
each write or when the tool itself is edited. The last command runs the tests
of the two tools above, of the role catalog, of the skills (structure, helper
scripts) and of the links between framework files; run it when editing the
tools, the role catalog, a layer's role table, a role file, a skill or the
headings that other framework files link to.

# Git

Commit or push only when the user asks. Changes in a target repository are
committed in that repository first; then the Hub commit carries the framework
improvements of the same run. When the target repository is a submodule of the
Hub, the Hub commit also updates its pointer. Plan packages
(`<request-slug>_<YYYYMMDD-HHmmss>/`, anywhere in the Hub) with the Review
reports inside them, and self-evaluation records in `.agents/evals/records/`,
describe the user's projects: they are ignored by Git and are never committed.
