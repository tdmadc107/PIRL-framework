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
    layered-task-execution.instructions.md   router: layer boundaries, assignment, shared contracts
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
| `AGENTS.md` | Core rules, structure, flow, choosing the kind of work, role catalog and delegation, target repository, Git |
| `CONTEXT.md` | How answers, summaries, reports, proposals and syntheses sent to the user are presented |
| Router | Boundaries between kinds of work, roles and assignment principles, framework maintenance and its check commands, shared contracts (verification by reasoning, functional tests, shared snapshots and older records, self-evaluation and improvement, cleanup) |
| Layer instruction | Each role's responsibilities at the layer, the decisions the layer settles, the content its output must hold and its exit conditions; the Implement contract also holds layout verification with mocks, which Review reads |
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
[conditions for opening a layer](#choosing-a-layer); no layer opens the next
one on its own.

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

## Choosing a layer

1. Infer the goal from the user's words and the context already established,
   not from keywords. When the user names roles, keep the list and its order;
   do not ask again about what is already given.
2. Investigate the sources to resolve information that can be found,
   including what the user has already said: the decisions they made
   (confirmations, delegated choices, refusals) live in Plans, Implementation
   Records, records and reports; the host's session history is only a fallback
   source when the host keeps it. Ask only about missing decisions that change
   the result, the scope or the permission to act, and do not ask again about
   something already answered; stop the part that depends on that decision and
   continue the independent parts that have enough basis. A run that acts on the
   user's answer quotes that answer in its own output (the record's `summary`,
   the Implementation Record) so later runs can find it without the session
   history.
3. If the user only asks for an explanation or an investigation, return a
   conclusion within that scope; do not turn the question into a handoff
   package. When the request is product delivery, choose the right layer
   below; do not switch layers just because the current part is done.
4. A layer opens only when the user's own words ask for the work that layer
   produces (creating a Plan, implementing a Plan, a review). Agreeing to,
   choosing or confirming an answer to a question the Agent wrote opens only the
   layer named in the user's words, or the layer the question asked about on its
   own (one confirmation point asks one decision, and a point about opening a
   layer names one layer). An approved proposal covering several layers settles
   the direction: a layer that appears only in the Agent's text is not opened,
   and if the user's words name no layer, ask one question about the first
   layer. When the requested layer is done, stop and ask separately about the
   next layer.

No slash command, activation token or exact keyword is needed.
"Create a Plan for this request" is the Plan layer; "Implement Plan T01" is the
Implement layer; "Review the implementation of Plan T01" is the Review layer.

| Layer | Result and owning contract |
| --- | --- |
| Plan | Write/adjust a Plan from the request and the source; [Plan contract](.agents/instructions/plan.instructions.md), run through the [`pirl-plan` skill](.skills/pirl-plan/SKILL.md). |
| Implement | Carry out one selected Plan, or repair it per a report for the same task; [Implement contract](.agents/instructions/implement.instructions.md), run through the [`pirl-implement` skill](.skills/pirl-implement/SKILL.md). |
| Review | Check an implementation run against the Plan; [Review contract](.agents/instructions/review.instructions.md), run through the [`pirl-review` skill](.skills/pirl-review/SKILL.md). |
| Standalone task | Work assigned directly, outside a Plan's chain; [Standalone tasks section](.agents/instructions/layered-task-execution.instructions.md#standalone-tasks). |
| Framework maintenance | Edit `AGENTS.md`, instructions, roles, skills or framework tools themselves; [Framework maintenance section](.agents/instructions/layered-task-execution.instructions.md#framework-maintenance). |

Load only the documents relevant to the current decision: the skill and the
contract of the selected layer, and the context documentation of the target
repository. Do not load every file in `.agents/` or `.skills/`.

Loading order:

1. Identify the kind of work per [Choosing a layer](#choosing-a-layer).
2. Depending on the kind of work:
   - Plan, Implement or Review: read the
     [router](.agents/instructions/layered-task-execution.instructions.md),
     which holds the boundaries between kinds of work and the shared contracts,
     then run that layer's skill (`.skills/pirl-<layer>/SKILL.md`);
     the skill loads exactly the layer contract and the resources each step
     needs. A host that loads skills on its own reaches the same file; a host
     that does not reads it like any other file.
   - [Standalone task](.agents/instructions/layered-task-execution.instructions.md#standalone-tasks),
     meaning work assigned directly outside a Plan's chain: no layer is activated.
   - [Framework maintenance](.agents/instructions/layered-task-execution.instructions.md#framework-maintenance):
     edit `AGENTS.md`, `CONTEXT.md`, instructions, roles, skills or tools
     themselves, within the scope the user assigns.
   - A question that only needs an explanation and creates no durable output:
     answer within its scope, create no files. The router is not needed,
     unless the answer draws a conclusion about a Plan, an Implementation
     Record, a report or a record (then apply the router's
     [Shared snapshots and older records](.agents/instructions/layered-task-execution.instructions.md#shared-snapshots-and-older-records)
     section), or it is unclear whether the request is only such a question
     (then read the router before answering).
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

Delegation, for all three layers. These points override a host's defaults, so
they stay in this file, which every host loads:

- This framework runs layers with AI agents: every selected role of a layer
  run, including `process-auditor`, runs in a separate agent (a host
  sub-agent). A request to run a layer is an explicit request to delegate work
  to agents; a host's default instruction that the user must ask before agents
  are created is satisfied by this rule, without the user repeating it in each
  run.
- A role does not verify its own output.

The constraints that keep roles separate from skills and the other
[assignment principles](.agents/instructions/layered-task-execution.instructions.md#assignment-principles)
live in the router.

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

# Git

Commit or push only when the user asks. Changes in a target repository are
committed in that repository first; then the Hub commit carries the framework
improvements of the same run. When the target repository is a submodule of the
Hub, the Hub commit also updates its pointer. Plan packages
(`<request-slug>_<YYYYMMDD-HHmmss>/`, anywhere in the Hub) with the Review
reports inside them, and self-evaluation records in `.agents/evals/records/`,
describe the user's projects: they are ignored by Git and are never committed.
