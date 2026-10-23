---
name: "Plan Layer Instructions"
description: "Create a short Plan in English, settle the business logic, assign implementation roles and verification roles that verify by reasoning."
applyTo: ".agents/instructions/plan.instructions.md"
metadata:
  id: ".agents/instructions/plan"
  kind: "instruction"
  version: "2.0.2"
  status: "active"
---

# Plan Layer Instructions

Apply the Plan process only when the request and the [router](layered-task-execution.instructions.md)
have selected this layer. Reading or updating a Plan/report file does not
activate another layer. The run is carried out through the
[`pirl-plan` skill](../../.skills/pirl-plan/SKILL.md), which owns the run procedure, the
Plan file format and the helper script; this contract owns the decisions and
the exit conditions.

A Plan settles the work to do, how to do it, the implementation roles, the
verification roles and the logic that must hold. Write it in English; keep
IDs, data keys, symbols, commands and paths verbatim when referencing them. The
output is short, but the implementers must not have to re-decide product
behavior themselves.

## AI Agent roles at the Plan layer

The role catalog lives in [AGENTS.md](../../AGENTS.md#ai-agent-roles) and the
assignment principles in the [router](layered-task-execution.instructions.md#assignment-principles);
each role's expertise lives in the role file linked in the table.
Plan picks the smallest team with enough expertise for the request using the
"Select when" column and records it in `planning_roles`. When the user names
roles, keep exactly that list. Do not add roles just to complete the process.

| Role | Select when | Responsibility at Plan | Input | Done when |
| --- | --- | --- | --- | --- |
| [`business-analyst`](../roles/business-analyst.role.md) | The request has business behavior to settle | Settle REQs, business logic and QGs; find missing product decisions | Request, existing decisions, specifications | Each REQ has a source and an outcome; a source is recorded as the user's decision only for what is in the user's words or in the verbatim text of the choices and choice descriptions the user saw when choosing; what is inferred from the source or the repository's conventions, what interprets or extends a choice, and what the agent chose itself in work the user explicitly delegated to the agent are all recorded as decided by the agent, with their basis; product choices that change the result and that nobody has decided have been asked or marked unsettled; each QG states its required logic; the basis is read from sources by the role, which runs or builds measuring tools only when the user asks for a root-cause investigation ([Investigating and settling decisions](#investigating-and-settling-decisions)) |
| [`code-analyst`](../roles/code-analyst.role.md) | The request touches the target repository's source or documentation | Read callers/consumers, configuration and constraints; identify change points and affected documentation | Source of the target repository | The change scope and allowed paths are grounded in the source; for changes that spread to other elements or consumers (inherited properties, creating a containing block or stacking context, default configuration), the element carrying the change and the list of affected ones are stated; the basis is read from sources by the role, which runs or builds measuring tools only when the user asks for a root-cause investigation ([Investigating and settling decisions](#investigating-and-settling-decisions)) |
| [`solution-architect`](../roles/solution-architect.role.md) | API/data/permission contracts change, or the package has several tasks | Settle contracts, ownership, permission model, boundaries and dependencies between tasks | Source, shared contracts | Each task has its own acceptance outcome; real dependencies are recorded; for each value, symbol or file that a task adds, changes or removes, every passage of a file shared between tasks (including context documentation) that mentions it is in that same task's REQs, `Allowed paths` and QGs, so the file stays right after each task completes; the basis is read from sources by the role, which runs or builds measuring tools only when the user asks for a root-cause investigation ([Investigating and settling decisions](#investigating-and-settling-decisions)) |
| [`ux-designer`](../roles/ux-designer.role.md) | The request touches what the user sees | Settle screens, display states, interaction flows, UI strings per language and viewports; write UI QGs as state and layout logic | Request, existing UI, the repository's context documentation | Every display state created or changed has a QG; the basis is read from sources by the role, which runs or builds measuring tools only when the user asks for a root-cause investigation ([Investigating and settling decisions](#investigating-and-settling-decisions)) |
| [`process-auditor`](../roles/process-auditor.role.md) | Every Plan run; not recorded in `planning_roles` | Self-evaluate the Plan run per the [router](layered-task-execution.instructions.md#self-evaluation-and-improvement) | Plan, sources used, each role's decisions | Record written; improvements applied or summarized for the user |

The Plan coordinator merges the roles' conclusions, settles disagreements by
sources (not by voting), writes the Plan and self-reviews it. Each role returns
expert decisions with the sources that change the approach. Each Plan file
records how the planning roles were performed on the `Planning` line of the
`Participating roles` section: a separate agent, or the coordinator
self-performing with the reason delegation was not possible, per role when they
differ. When self-performed, do not claim an independent challenge happened.

## Investigating and settling decisions

- Read the request and the existing decisions; identify the target repository
  per [AGENTS.md](../../AGENTS.md#target-repository) and the part to
  change from the source.
- Read the related callers/consumers, constraints and configuration before
  claiming a mechanism is missing; do not infer the whole system from one file
  or from an unverified review. Planning roles investigate by reading the
  source, documentation, git history and existing records; they do not build
  mock pages or measuring tools and do not run the application or a browser.
  A quantity that reading does not yield is computed from the source with its
  formula, or recorded as not yet measured. Only when the user asks for a
  root-cause investigation may the responsible role reproduce the defect per the
  [router](layered-task-execution.instructions.md#verification-by-reasoning);
  the Plan records the distinguished cause and does not turn the reproduction
  result into a QG.
- Settle the difference between the current state and the target outcome. Ask
  when a product choice that changes the result is missing; resolve details
  yourself from the source and the repository's conventions. If only one branch
  is blocked, complete the independent part of the Plan and mark the limit clearly.

## Splitting tasks for separate implementation and acceptance

- Prefer each Plan file to be one piece of work with its own outcome and
  independently verifiable QGs. Draw boundaries by behavior/contracts that can
  be completed, not by file count, technical layer or a goal of splitting as
  small as possible. Shipping in the same release is no reason to merge all
  work into one task.
- For each task, consider the state made of only the original source, the
  outputs of completed prerequisite tasks and the task's own changes: every QG
  must be provable by reasoning on the source of that state. A QG must not need
  code, configuration, fixes or evidence that are assigned only to a later task
  or a task planned to run in parallel. Do not create a task that, once
  implemented, still has to wait for a later task before Review can PASS.
- Reduce dependencies with settled contracts and a clear change scope. For
  APIs, schemas or shared files, state which part already exists, which part
  needs implementing and which task owns each change. For documents that
  several tasks edit, assign by change, not by section, column or topic: for
  each value, symbol or file that a task adds, changes or removes, search by
  token name, value and file name for every passage that mentions it, including
  exhaustive listings (component lists, directory trees), then assign that
  passage to that same task. When two tasks change the same value, each task
  updates that passage for its own change. A contract on paper does not replace
  the implementation needed to conclude a QG; two tasks editing the same
  symbol/decision cannot be treated as independent just because of
  `depends_on: []`.
- When there is a real dependency, record `depends_on` and the concrete output
  to receive in `How to do it`. The prerequisite task must meet its own QGs
  before the dependent task starts the part that needs that output. If the QGs
  cannot be closed separately, change the boundary, make the shared part a
  prerequisite task with a verifiable outcome, or merge exactly the parts that
  cannot be separated. Do not hide a dependency with mocks, deleted
  declarations, weakened QGs or abstractions created only to split tasks.
- Assign each acceptance condition to the task that owns that outcome.
  End-to-end criteria, or removing an old mechanism, that only hold once several
  parts are combined belong to an integration task that depends on those parts;
  do not restate such criteria as PASS conditions of a prerequisite task. Keep
  all package-wide requirements, and do not push a task's core behavior into
  the integration so that the task can PASS. Reasoning on a local contract does
  not prove the real execution path or data invariants; QGs of that kind must
  name the write/read points to trace.
- `depends_on` points to tasks in the same package, never to itself, and never
  forms a cycle. Re-read all QGs to find implicit dependencies: T02 needing T01
  while T01's QG needs T02 is still a cycle even when the `depends_on` list is
  valid. Fix the assignment/QGs before handoff; do not leave Implement/Review
  to repeatedly edit code to work around a task-splitting mistake.

## Scope of work: source code, documentation and functional tests

Per the [router](layered-task-execution.instructions.md#verification-by-reasoning),
a task covers implementing product source code (with accompanying documentation
in the target repository), creating/updating the target repository's context
documentation ([AGENTS.md](../../AGENTS.md#target-repository)), and functional
tests under the [FUT rule](layered-task-execution.instructions.md#functional-tests-fut-rule)
when a REQ/specification needs them.

- Never create a task, a `How to do it` step, a REQ, a QG, a `Done when` or
  `Allowed paths` for building, running the application/database/browser for
  acceptance, measuring performance, new harnesses or verification scripts,
  deploying or releasing. [Layout verification with mocks](implement.instructions.md#layout-verification-with-mocks)
  is something Implement does on its own when the diff changes the UI: the
  Plan creates no task, step or QG for it, including a numbered step assigning
  the implementation role to capture layout. UI QGs are still written as
  layout/state logic. What needs to be captured or measured beyond that
  section (viewports the user asked for, thresholds computable from the source,
  computed properties to record) goes in the logic of the UI QGs and in the
  implementation role's `Done when`; how to build the state without the diff
  belongs to that section.
- When a task has tests, state the REQ/behavior under test, the affected
  functionality with its grounds (call path, contract or shared data that is
  changed), the test files allowed to be edited and exactly which tests run.
  Do not assign tests for unrelated functionality, do not assign running the
  whole suite, and do not invent test viewpoints beyond the specification.
- Specification goals that belong to the user's stage (performance thresholds,
  device testing, running the whole system, release) do not become work in the
  package; write one line in `What to do` saying they belong to the user's
  build/test/release stage.
- QGs do not use test/build/run results as a baseline. Do not write QGs like
  "test X is green", "the full test suite is green", "`npm run build` passes",
  "seen in the browser…", "evidence on the real database" or a measurement.
  Write the source logic that must hold: situation → where it is handled →
  outcome/state and failure branches, enough for the verification role to
  trace through the source and conclude. For example, replace "the sign-up test
  is green" with "a valid code creates a `PENDING` account; a wrong code returns
  `400` and writes no data".

## Separating implementation roles from verification roles

- `implementation_roles` produce the task's output. `verification_roles` do not
  edit the output; after the implementation roles finish, they conclude each
  QG by reasoning per the
  [Implement contract](implement.instructions.md#verifying-quality-gates-by-reasoning).
  Each task has at least one role of each kind, and the two lists do not
  overlap: a role does not verify what it implemented itself.
- Pick implementation roles from the
  [Implement](implement.instructions.md#ai-agent-roles-at-the-implement-layer)
  catalog by the kind of work: `backend-developer` for all non-UI code (API,
  domain, data, jobs, CLI, scripts, tools), `frontend-developer` for the UI,
  `technical-writer` for documentation-only tasks. When a task has both sides,
  record the real dependency order, for example `backend-developer` before
  `frontend-developer` uses the new API.
- Pick verification roles by the question the QG must answer, not by a fixed
  pairing with the implementation role:
  - `code-reviewer` challenges the diff: bugs, regressions, permissions and
    security, data/state inconsistency, guards/validators/error handling that
    report false success, contract violations; the default for every code change.
  - `code-analyst` traces the flow from the entrypoint to the final state
    through every caller/consumer and builds scenario tables for QGs with many
    branches, states or orderings; suited to contract changes, many
    integration points, or documentation that must match the source.
  - `ux-designer` checks layout screenshots against UI QGs; pick it when the
    task has UI QGs.

  Examples: fixing one bug → `code-reviewer`; changing an API with its docs →
  `code-reviewer` for permissions/regressions and `code-analyst` for consumers
  and docs; adding a screen → `code-reviewer` and `ux-designer`. Combine
  several roles only when each answers its own question; each QG has exactly
  one verification role accountable for its conclusion.
- Verification is not running scripts, creating tests or running commands. Do
  not assign verification roles to build, write/run tests, run the application
  or write tools; tests belong to the implementation roles. A verification
  role's `Done when` is a `PASS|FAIL|BLOCKED` conclusion for each assigned QG,
  with the path traced, counterexamples and sources, plus a check of the tests
  in the diff against FUT when the task has tests.

## Content must be sufficient to execute

- Each REQ has a source and a concrete outcome; a QG says when something is
  allowed/refused, the state to preserve and the related failure branches. Only
  include risks with a mechanism within the request's scope; do not add
  platforms, coverage or operations that were not assigned.
- `Allowed paths` include known documents that describe the behavior about to
  change (an earlier task's contract, indexes, status tables, API/error/
  configuration/permission catalogs): search by route name, error code,
  collection, configuration, token, file name or phrases like "until task N",
  then name them.
  Anything missed is still swept by Implement under its contract; the Plan does
  not need to list every place.
- Processing steps state the change point, the chosen direction, the order that
  is really needed and the outcome. Settle decisions that affect APIs/data/
  ownership; leave equivalent implementation details for Implement to choose.
  Do not hide a missing decision inside the word "integrate".
- Pick `implementation_roles` and responsibilities by the work, not by the
  number of layers or directories; pick `verification_roles` per the section
  above. Do not make several roles accountable for the same decision without a
  merging owner.
- Re-read using one main scenario and one scenario that could refute the
  approach. The right criterion is behavior the source must guarantee, provable
  by reasoning on the source; a test/build/validator PASS does not replace that
  logic. When the task is content, the criterion is that the instructions lead
  to the right decision, not that a tool accepts the text.

## Plan file format

Each task is one Plan file. The [`pirl-plan` skill](../../.skills/pirl-plan/SKILL.md)
owns its format: the [template](../../.skills/pirl-plan/assets/plan-template.md)
with the four sections `What to do`, `How to do it`, `Participating roles` and
`Required quality gates`, and the [format reference](../../.skills/pirl-plan/references/plan-format.md)
with the frontmatter fields, file naming and output location. This contract
owns what those sections must settle.

## Self-review before handoff

1. Check each role's contribution against the request, the source, the approach
   and the QGs. If the Plan is wrong or lacks a mandatory decision, fix the
   content before declaring it ready. For a multi-task package, check separate
   acceptability per the task-splitting section above and confirm every
   package-wide requirement still has an owning task. Confirm each task
   separates implementation roles from verification roles that fit the QGs'
   questions, that no task, step or QG belongs to the user's build/test/release
   stage, that there is no separate QG for capturing layout, and that the test
   part (if any) is limited to FUT. Before declaring the Plan ready, re-read it
   with the following five checks and fix the Plan if anything is wrong:
   - Every claim about the current state (sections, tables, files, behavior,
     languages that exist) has been opened and confirmed at exactly each
     location or language the Plan names; what does not exist yet is recorded in
     the REQ as new.
   - Every table of values or derived numbers with a measurable constraint
     (contrast, luminance, size, limits) has been recalculated value by value
     against each constraint; on a conflict, fix the table or the constraint
     instead of handing over both.
   - A REQ that changes a composite element (label, icon, border, background)
     states which parts are kept, removed or added.
   - FUT commands name only test files that exist, or test files whose name a
     REQ settles for the task to create; when the Plan leaves Implement to choose
     between editing or replacing a unit (for example replacing a hook), refer to
     the test file by that unit ("the test file of the replacement hook")
     instead of naming a file that may no longer exist. `Allowed paths` include
     the shared test setup or configuration files the change needs (for example
     a fake of a browser API the test environment lacks).
   - No step of `How to do it` assigns the implementation role to capture
     layout, measure or run the application, not even a short step like
     "capture layout per the layout verification section": the extra viewports, states and properties
     to capture go in the UI QGs and in the implementation role's `Done when`.
     The UI verification role's step only says it runs after the implementation
     role captures.
2. Run the Plan validator (command in the
   [`pirl-plan` skill's procedure](../../.skills/pirl-plan/SKILL.md#procedure)) and fix
   structural errors before handoff. The validator only checks the handoff
   input (schema, required fields, roles, dependencies, time zone); it does not
   grade content. The reviewer still has to prove the Plan is right.
3. `process-auditor` self-evaluates the Plan run, applies improvements and
   writes the record per the [router](layered-task-execution.instructions.md#self-evaluation-and-improvement).
   Defects of the Plan itself are fixed in the Plan before handoff; instruction
   defects do not turn into new product requirements.

## Saving and handoff

- After the final review and self-evaluation, the coordinator and every role
  complete the [temporary-resource cleanup](layered-task-execution.instructions.md#cleaning-up-temporary-resources-before-handoff)
  and check again before declaring the Plan ready. A blocked draft must still
  clean up what is no longer needed; do not hand Plan clutter to Implement.
- Save each task file where the user says, or by default under the Hub root,
  per the [Plan file format](../../.skills/pirl-plan/references/plan-format.md).
  Do not overwrite history.
- State clearly whether the Plan has all decisions or still has unsettled
  parts, its path and the self-improvement result per the router's reporting
  section. Do not call a draft with insufficient input ready for Implement.
- Do not edit product source at Plan. Finish and hand off the specific files
  to the corresponding Implement instruction; do not start the next task on
  your own.
