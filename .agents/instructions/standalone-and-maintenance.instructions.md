---
name: "Standalone Tasks and Framework Maintenance Instructions"
description: "Standalone tasks and how the framework itself is maintained: its structure and owners, the role catalog, the constraints on roles and the checks; read only in the cases listed at the top."
applyTo: ".agents/**/*,.skills/**/*,AGENTS.md,CONTEXT.md"
metadata:
  id: ".agents/instructions/standalone-and-maintenance"
  kind: "instruction"
  version: "1.0.1"
  status: "active"
---

# Standalone tasks and framework maintenance

Read this file only in these cases:

- a standalone task: the [Standalone tasks](#standalone-tasks) section;
- framework maintenance the user assigns: the whole file;
- inside a Plan, Implement or Review run, only when a framework improvement is
  applied (`process-auditor`, or the coordinator in `mode: self`), per the
  router's [Thorough improvement](layered-task-execution.instructions.md#thorough-improvement) section.

Plan, Implement and Review runs do not read it otherwise; a question that only
needs an explanation reads it only when the question is about the framework's
structure or maintenance.

## Standalone tasks

A standalone task is work the user assigns directly that closes within that
same run, outside the Plan → Implement → Review chain: writing or updating
documentation on request, an investigation with durable output, a small fix
the user specifies. Carrying out a Plan task is still Implement, even with a
single role. A question that only needs an explanation and creates no durable
output is answered directly (step 3 of
[Choosing a layer](../../AGENTS.md#choosing-a-layer)).

No Review is scheduled, so the person doing the work closes the loop within the session:

1. Complete the delivery within exactly the scope the user assigned, under the
   core rules.
2. Self-verify: check the output against the request and the authoritative
   sources, and pick a counterexample that could refute the most important
   claim; fix wrong output before reporting. Record it as self-verification,
   not an independent review.
3. Report separately the delivery result, how it was verified and what remains
   unknown. Do not create a Plan or report unless the user asks. Standalone
   tasks write no self-evaluation record; only the three layers write one, per
   the [Self-evaluation and improvement section](layered-task-execution.instructions.md#self-evaluation-and-improvement).
4. Clean up temporary resources per the [cleanup section](layered-task-execution.instructions.md#cleaning-up-temporary-resources-before-handoff).

If the user later asks for a Review, the Review evaluates as usual;
self-verification does not replace the Review's conclusions.

### Verifying standalone work

Applies to standalone tasks and to work done directly without a layer; the
three layers verify per the
[Verification by reasoning section](layered-task-execution.instructions.md#verification-by-reasoning).

- Choose the narrowest verification that answers the open question: static
  (types, lint, syntax, metadata), unit (pure functions, services, domain
  rules), component (UI behavior and accessibility), integration (API,
  authentication, storage, multi-tier flows) or manual (visual layout, real
  browser, multi-step flows per viewport). Widen only when an affected contract
  or a concrete failure mechanism requires it; a file name or the existence of
  a test does not create that need. Tests written or run follow the
  [FUT rule](layered-task-execution.instructions.md#functional-tests-fut-rule).
- A passing command only proves the cases that ran, not invariant coverage,
  adjacent integration paths, edge behavior or the reliability of the skipped
  part. A case skipped because of the platform only proves that case does not
  run in this environment; it does not prove the product needs another
  platform. Infer environment requirements from the user's task and the
  repository's actually supported behavior.
- Report each verification with the command, its purpose, the working
  directory, pass/fail/blocker, a summary of the key output and the remaining
  risk.

## Framework maintenance

A request to edit `AGENTS.md`, `CONTEXT.md`, instructions, roles, skills or
the tools in `.agents/evals/` directly is framework maintenance within the scope
the user assigns. Do not force a product Plan or
report before editing. Improvements that `process-auditor` applies during a
layer run under the
[Self-evaluation and improvement section](layered-task-execution.instructions.md#self-evaluation-and-improvement) are
also framework maintenance, allowed by that section without a separate request.

- Start from the wrong or missing decision, then identify the owning file:
  `AGENTS.md` for the core rules, structure, roles and the target repository;
  `CONTEXT.md` for how responses to the user are presented; the router for
  layer boundaries and shared contracts; the layer contract for the roles'
  responsibilities, decisions and exit conditions; the layer's skill for the
  run procedure, the output format and the helper scripts. Read the files that
  reference the rule before changing it, so that other files do not restore the
  old behavior.
- Write rules in the framework's general form, reusable for every repository,
  host and situation of the same kind: conditions are stated by kind of
  situation, actions by role and output, not by one event that happened. The
  content of `AGENTS.md`, `CONTEXT.md`, instructions, role files, rules and tools
  contains no details specific to one run or one project as a condition or
  basis: repository or product names, paths inside a product repository,
  specific tokens or values, task or record IDs, dates, quotes from the user,
  names of a specific host or tool. Illustrative examples, when needed, are
  marked as examples and do not become conditions. Knowledge specific to one
  repository lives in that repository's own context documentation; the
  decisions and evidence of a run live in Plans, Implementation Records,
  reports and records.
- Fix with conditions and actions that are concrete enough; replace the wrong
  passage instead of piling on reminders. Re-read against three scenarios: the
  scenario that caused the problem, a similar scenario where the rule must not
  apply, and a scenario of the same kind in another repository or host; the
  rule must apply to the third scenario without changes. Do not add tests,
  validators or schemas in place of improving the content, and do not create
  tests or validators that grade wording by headings, keywords, counts or
  format.
- After editing, run the matching commands in the
  [Framework checks](#framework-checks) section below.
  The checks only confirm structure; they do not prove the quality of the wording.

### Framework structure

```text
AGENTS.md                         root: core rules, flow, choosing the kind of work, delegation, target repository
CONTEXT.md                        how responses to the user are presented
.agents/
  instructions/
    layered-task-execution.instructions.md   router: layer boundaries, assignment, shared contracts
    plan.instructions.md                     Plan layer contract
    implement.instructions.md                Implement layer contract
    review.instructions.md                   Review layer contract
    layout-verification.instructions.md      layout verification with mocks, read when a diff changes the UI
    standalone-and-maintenance.instructions.md   standalone tasks, framework maintenance, structure, role catalog
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
.tools/           external local tools, ignored by Git, not part of the framework
.tmp/             temporary output, ignored by Git (layout snapshots, tool logs)
<plan-set>/       Plan package and its Review reports, created at the Hub root unless the user names another directory (ignored by Git)
```

| Source | Owns |
| --- | --- |
| `AGENTS.md` | Core rules, flow, choosing the kind of work, delegation, target repository, Git |
| `CONTEXT.md` | How answers, summaries, reports, proposals and syntheses sent to the user are presented |
| Router | Boundaries between kinds of work, assignment principles, shared contracts (verification by reasoning, functional tests, shared snapshots and older records, self-evaluation and improvement, cleanup) |
| Standalone and maintenance instructions | Standalone tasks, framework maintenance and its check commands, this structure, the role catalog, the constraints that keep roles separate from skills |
| Layer instruction | Each role's responsibilities at the layer, the decisions the layer settles, the content its output must hold and its exit conditions; the Implement contract also holds when layout verification with mocks applies |
| Layout verification instructions | How layout is captured and checked with mocks, and how Review reads the result |
| Skill | How one layer run is carried out: when the skill applies, the ordered procedure linking each step to the contract that owns it, the output format and template, helper scripts |
| Role file | Shared expertise of one role, identical in every layer |
| Evals | Checking handoff artifacts, writing and checking records, the tests of the framework tools and skills |
| Record | History of self-evaluation and improvement for each layer run; appended only through the tool and kept on the local machine |

Each rule lives in exactly one owner; other files point to it instead of
copying it.

### Role catalog

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

### Constraints that keep roles separate from skills

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

### Framework checks

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
scripts), of the links between framework files, that private outputs stay out
of Git and that every tracked file is either framework content or listed as not
framework; run it when editing the tools, the role catalog, a layer's role
table, a role file, a skill, `.gitignore`, the headings that other framework
files link to, or when adding a top-level path.
