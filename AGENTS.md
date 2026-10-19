# Start here

This repository is PIRL (Plan – Implement – Review Layer): a Hub that
coordinates software development work for AI Agents. The framework runs entirely
on instruction files: three layers, Plan, Implement and Review, define what the
Agent does, how it does it and what it produces. `.repos/*` are git submodules
of the product repositories, each with its own history and branches; the list
of registered repositories lives in `.repos/manifest.yaml`.

Always apply the [core rules](.agents/llm-docs/rules/core-agent.rule.md) on
safety, scope and evidence, even when no layer is opened.

Read [CONTEXT.md](CONTEXT.md) before the first answer of each session and apply
it to every answer, summary, report and proposal sent to the user, even when no
layer is opened.

# Structure

```text
AGENTS.md                         root: structure, flow, Agent roles, repository routing
CONTEXT.md                        how responses to the user are presented
.agents/
  instructions/
    layered-task-execution.instructions.md   router: layer selection, shared contracts
    plan.instructions.md                     Plan layer
    implement.instructions.md                Implement layer
    review.instructions.md                   Review layer
  roles/          expertise of each role: <role-id>.role.md
  llm-docs/
    rules/        shared rules (core-agent, test-verification)
    repos/        context documentation for each registered repository (created when needed)
    evals/        Plan/Review validator, record tool and their tests
  plan/           Plan output: <request-slug>_<YYYYMMDD-HHmmss>/<NN>-plan-...md
  review/         Review output: <plan-set>/<task>/round-<NN>-review-...md
  records/        self-evaluation records: <layer>/<YYYY-MM-DD>.jsonl
.repos/
  manifest.yaml   product repository registry
  <repo-id>/      git submodule of a product repository
.tools/           local tools (dashboard, claude-resume, claude-schedule)
.tmp/             temporary output, ignored by Git (layout snapshots, tool logs)
```

| Source | Owns |
| --- | --- |
| `AGENTS.md` | Structure, flow, role catalog, repository routing, check commands |
| `CONTEXT.md` | How answers, summaries, reports, proposals and syntheses sent to the user are presented |
| Router | How to choose a layer, layer boundaries, shared contracts (verification by reasoning, layout, shared snapshots and older records, self-evaluation and improvement, cleanup) |
| Layer instruction | Sequence, each role's responsibilities at the layer, the layer's output and exit conditions |
| Role file | Shared expertise of one role, identical in every layer |
| Rule | One constraint reused across several layers |
| `.repos/manifest.yaml` | Which repositories are registered, where they live, which commands and documents they use |
| Record | History of self-evaluation and improvement for each layer run; appended only through the tool |

Each rule lives in exactly one owner; other files point to it instead of
copying it.

# Workflow

Plan → Implement → Review. Each layer runs only when the user's own words ask
for that layer, per the
[router's conditions for opening a layer](.agents/instructions/layered-task-execution.instructions.md#choosing-a-layer);
no layer opens the next one on its own.

| Layer | Result | Contract |
| --- | --- | --- |
| Plan | Plan files: REQs, approach, roles, quality gates (QG) | [plan.instructions.md](.agents/instructions/plan.instructions.md) |
| Implement | Changed source/docs/tests and an Implementation Record in the Plan file | [implement.instructions.md](.agents/instructions/implement.instructions.md) |
| Review | A report with `Business` + `Evaluations`, checking the QGs by reasoning on the source | [review.instructions.md](.agents/instructions/review.instructions.md) |

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
   - Plan, Implement or Review: read exactly the layer contract the router points to.
   - [Standalone task](.agents/instructions/layered-task-execution.instructions.md#standalone-tasks),
     meaning work assigned directly outside a Plan's chain: no layer is activated.
   - [Framework maintenance](.agents/instructions/layered-task-execution.instructions.md#framework-maintenance):
     edit `AGENTS.md`, `CONTEXT.md`, instructions, rules or tools themselves,
     within the scope the user assigns.
   - A question that only needs an explanation and creates no durable output:
     answer within its scope, create no files.
3. For work that touches a product repository, read
   [repository routing](#repository-routing), then load the context
   documentation and rules of exactly the target repository.

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

Constraints that keep roles from turning into skills:

- Closed catalog: only the IDs in this table. Adding, merging or removing a role
  means editing this table together with the role file, the layer file tables
  and the framework checks, in one change.
- Layers pick roles themselves following the layer file's guidance: Plan and
  Review by the "Select when" column; the Implement team for implementation and
  verification is chosen by the Plan. The user does not need to name roles, but
  when they do, keep exactly that list.
- A role file contains only shared expertise: the questions the role answers,
  how it works, warning signs, boundaries with other roles. It does not contain
  a layer's sequence, output templates, commands or completion conditions.
- Roles have no artifacts, tools or evaluation mechanism of their own; a role
  is evaluated through the layer's record.
- Knowledge specific to one repository lives in that repository's
  `context_docs`, not in role files. Roles do not rely on a host's skill
  mechanism or custom agent configuration.

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

# Repository routing

`.repos/manifest.yaml` is the only registry of product repositories. Each
repository is a git submodule at `.repos/<repo-id>` and has one entry under the
`repos` key:

| Field | Meaning |
| --- | --- |
| `path` | The repository's working directory, relative to the Hub root (usually `.repos/<repo-id>`) |
| `product` | The product the repository serves |
| `stack` | Main technology stack |
| `keywords` | Request keywords used to select the repository |
| `commands` | Command name → command line run from the repository's `path` directory, used when a Plan assigns tests under FUT |
| `context_docs` | The repository's context documentation, usually `.agents/llm-docs/repos/<repo-id>.md`: architecture, conventions, viewports, breakpoint thresholds and UI languages to capture in layout snapshots, notes on capture tooling (where the browser automation tool is and how to install it, how to launch a browser without touching the user's open session, how to run a stable dev server, known environment obstacles), where known gaps are recorded |
| `rules` | Rules that apply to the repository, usually `.agents/llm-docs/rules/<name>.rule.md` |

Registering a repository: add the submodule (`git submodule add <url> .repos/<repo-id>`),
add an entry to the manifest, then create context documentation and rules if
needed. Unregistering does the reverse: `git submodule deinit -f` and `git rm`
the submodule path, delete the manifest entry and any documents that serve only
that repository.

A repository is **registered** when it has both parts: an entry in the
manifest, and a submodule declared in `.gitmodules` at exactly that entry's
`path`. Missing either part is a partial registration: the repository is not
routed yet, the Plan validator rejects a `target_repo` pointing to it, and the
dashboard warns until the missing part is added.

Choosing a repository for a request:

1. Read the manifest; choose the registered repository whose `id`, `path` or
   `keywords` match the request. Load only the `context_docs` and `rules` of the
   chosen repository.
2. Choose exactly one repository, unless the request explicitly names several;
   in that case handle and record each repository separately, including the
   contracts between them.
3. If two repositories are equally plausible and the choice changes the result,
   ask one short question. If the analysis can safely continue, state the
   assumption and carry on.
4. Do not apply one repository's rules or assumptions to another, even when both
   use the same stack: commands, directory layout and conventions must be read
   again from the target repository.

If the manifest has no repositories yet, a request that touches a product
repository cannot be routed: say so and propose registering the repository first.

# Framework checks

Pick the checks that match the change. They only validate handoff inputs and
outputs and do not grade the wording; instruction content is re-read against
the scenario that caused the problem.

```powershell
python -B .agents/llm-docs/evals/validate_layer_artifact.py --kind <plan|review> --path <file or directory>
python -B .agents/llm-docs/evals/layer_record.py <start|append|check|query> ...
python -B -m unittest discover -s .agents/llm-docs/evals/tests -p "test_*.py"
```

The first command checks Plan/Review files (schema, required fields, roles,
dependencies, time zone) and runs when they are handed off. The second writes
and checks self-evaluation records as the router describes; `check` runs after
each write or when the tool itself is edited. The last command runs the tests
of the two tools above and of the role catalog; run it when editing the tools,
the role catalog, a layer's role table or a role file.

# Git and submodules

Commit or push only when the user asks. Changes in `.repos/<name>` are
committed in that submodule first; then commit in the Hub to update the
submodule pointer, together with the Plan/report, records and framework
improvements of the same run, if any.
