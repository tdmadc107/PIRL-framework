---
name: "Implement Layer Instructions"
description: "Implement exactly the Plan or the Review's repair instructions, have verification roles conclude the quality gates by reasoning, and write the Implementation Record into the Plan."
applyTo: ".agents/instructions/implement.instructions.md"
metadata:
  id: ".agents/instructions/implement"
  kind: "instruction"
  version: "2.4.0"
  status: "active"
---

# Implement Layer Instructions

Apply the Implement process only when the request and the [router](layered-task-execution.instructions.md) have selected this layer.
Reading or updating a Plan/report file does not activate another layer.
Work assigned directly outside a Plan follows the [standalone tasks](standalone-and-maintenance.instructions.md#standalone-tasks); do not borrow this layer's wait-for-Review rules for that work.

This contract owns the decisions of the Implement layer and the content of its results ledger.
The goal is to carry out the settled product decisions exactly, keep enough evidence for handoff and recognize when those decisions no longer fit.
The run is carried out through the [`pirl-implement` skill](../../.skills/pirl-implement/SKILL.md), which owns the run procedure, the Implementation Record format and the helper scripts.

## AI Agent roles at the Implement layer

The role catalog lives in the [standalone and maintenance instructions](standalone-and-maintenance.instructions.md#role-catalog) and the assignment principles in the [router](layered-task-execution.instructions.md#assignment-principles); each role's expertise lives in the role file linked in the table.
The Plan picks roles from the table below; a repair run uses the `repair_roles` of the Review report.
The Implement coordinator gives each role its role file, its row in the table together with the row of the role that the "Done when" column refers to with "As `<role>`" (also when that row refers on again), the work, the sources and the related REQs/QGs, then merges the results by evidence.

| Role | Type | Responsibility at Implement | Done when |
| --- | --- | --- | --- |
| [`backend-developer`](../roles/backend-developer.role.md) | implementation | Edit non-UI code, accompanying documentation and tests under FUT for that part, within the allowed paths; self-challenge its own work | As `technical-writer` for every sentence of accompanying documentation the role writes or changes, and source/docs/tests deliver all REQs of its part; self-challenge has no open doubts; no builds, typechecks, lint or verification scripts are run |
| [`frontend-developer`](../roles/frontend-developer.role.md) | implementation | Edit the UI, UI strings per language, accompanying documentation and tests under FUT; capture layout with mocks when the diff changes the UI; self-challenge | As `backend-developer`, and `layout_verification` has a capture run that passes every check when the diff changes the UI (except failed checks the Plan excluded per the [layout verification instructions](layout-verification.instructions.md)); when the diff changes the size or number of elements in a row or frame of constrained width, the bounding-box measurements per the [layout verification instructions](layout-verification.instructions.md) are in `layout_verification` and protruding elements were fixed before handing over to the verification roles; general or negative claims in `layout_verification` and the handoff report have been checked against all sources per the bullet on out-of-scope findings below the table |
| [`technical-writer`](../roles/technical-writer.role.md) | implementation | Create/update context documentation, contract documents, indexes and specification status tables for documentation-only tasks | Documentation matches the source and the REQs; every claim in each sentence written or changed, including clauses kept from the old version, has a source and has been checked per the [role's way of working](../roles/technical-writer.role.md#how-it-works): sentences stating a rule, scope or list, and the lead-in sentence or heading of a table or list, are checked element by element and at every place of use; quantities or formulas stated in words are recalculated from their definition in the source |
| [`code-reviewer`](../roles/code-reviewer.role.md) | verification | Challenge the diff: bugs, regressions, permissions and security, data/state inconsistency, guards/validators/error handling, contract violations, tests that violate FUT | `PASS\|FAIL\|BLOCKED` for each assigned QG, with the path traced, counterexamples and sources; each evidence line is a readable source with reasoning per the [router](layered-task-execution.instructions.md#verification-by-reasoning), not a run result |
| [`code-analyst`](../roles/code-analyst.role.md) | verification | Trace the flow from the entrypoint to the final state through every affected caller/consumer; build scenario tables for QGs with many branches/states/orderings; check documentation against the source | As `code-reviewer` |
| [`ux-designer`](../roles/ux-designer.role.md) | verification | Check the screenshots and measurements of the layout checks per the layout verification instructions against the UI QGs and the display source | As `code-reviewer` |
| [`process-auditor`](../roles/process-auditor.role.md) | self-evaluation | Self-evaluate the Implement run per the [router](layered-task-execution.instructions.md#self-evaluation-and-improvement); not recorded in the Plan's role lists | Record written; improvements applied or summarized for the user |

- An implementation role does not verify its own work.
  A verification role does not edit the output; a FAIL is returned to the implementation role that owns that part.
- Verification roles receive the implementation roles' diff and claims as things to check, not as conclusions.
  Team consensus is not evidence.
- Out-of-scope findings and every general or negative claim (a mismatch with the source, "there is no", "always", "every") in an implementation role's report belong to no QG, so no verification role receives them.
  The role states them only as observations after checking them against all sources that could refute them, per the [Evidence rule](../../AGENTS.md#evidence).
  The coordinator checks them against the source again before putting them in `residual_risk`, the record's `summary` or a response to the user, or states that they are unchecked and what was not read.
- When one agent takes on both implementation and verification (only when delegation is not possible under the assignment principles), the Implementation Record states that it was self-performed with the reason, and the QGs are still reasoned again on the diff by the right verification role; do not claim independent verification.

## Reading inputs and determining scope

1. The user has asked for this layer per the [conditions for opening a layer](../../AGENTS.md#choosing-a-layer).
   Identify exactly the Plan file that their words or the settled context name.
   Read the `pirl-plan/v1` Plan, the related source and the Implementation Record if any.
   Check that the tasks in `depends_on` have done the part this task needs; stop only the dependent part that is not ready.
   Do not require future tasks to be complete and do not pick the next task yourself.
   A Plan with wrong content must be clarified before dependent mutations; a missing validator run does not by itself prove the Plan wrong.
   If a QG needs work assigned to a later/parallel task, check against the [Plan's task boundaries](plan.instructions.md#splitting-tasks-for-separate-implementation-and-acceptance), record the affected QG as `BLOCKED` and hand exactly the task-splitting decision back to Plan.
   Do not do the other task yourself, weaken the QG or repeatedly edit code while the input has not changed; continue the independent parts that are clear.
2. The first run uses the Plan's `implementation_roles` in order to implement, then the Plan's `verification_roles` in order to verify.
   A repair run uses the `repair_roles` of the named Review report for the same Plan/task, then still the Plan's `verification_roles`.
   Do not merge the two teams, change roles based on the name of a defect, or add or drop assigned roles.
   A report that still has a `replan` FIND goes back to Plan; deferred risks or blockers handed to another owner alone do not open a product repair run.
3. Check the requirements, responsibilities, allowed paths, dependencies and QGs against the current state.
   Distinguish the user's pre-existing changes from what you are about to edit.
   Use the permissions already granted in the session; do not add routine approval checkpoints.
4. Each role receives its work, sources, instructions and related REQs/QGs.
   Load only the context that serves that decision.
   When delegating to a separate agent, pass the full settled direction; do not hide the solution to create an appearance of independence.
   Only when delegation is not possible under the assignment principles does the coordinator perform the roles in turn.
5. Choose equivalent implementation details within the settled direction yourself: helper placement, variable names or how to reuse source do not need a new Plan.
   Hand back only decisions that change behavior, permissions, data, scope or trade-offs the user has settled.
   State exactly what is missing and continue the independent parts; do not assume the whole task is blocked because one branch is unclear.
   A deviation from the Plan that the user confirms follows the [Changes to the Plan confirmed by the user](#changes-to-the-plan-confirmed-by-the-user) section.

## Implementing and repairing per Review

- Trace the execution path from input to result before changing anything.
  Keep each invariant where it is owned and update the affected writers/readers within scope.
- The Plan's path list is the scope of the main work, not the boundary of consistency.
  Once the behavior is stable, sweep the whole target repository and the related context documentation, not just the task's directory, for places that still describe the old behavior or lack the new behavior: contract documents, indexes and status tables, API/error/configuration/permission catalogs, UI strings, comments or code that only served the replaced flow.
  These are direct consequences of the change, so fix them in the same run even when they are outside the Plan's paths.
  Tests of the functionality under development and of affected functionality that still assert the old behavior are updated to the new logic, and tests that only served a removed flow are deleted, all under the [FUT rule](layered-task-execution.instructions.md#functional-tests-fut-rule); do not touch tests of unrelated functionality and do not build new harnesses or verification scripts, inside or outside the repository (the only exception is layout mock and capture scripts in `.tmp/` per the [layout verification instructions](layout-verification.instructions.md)).
  Points that need a product decision are not decided by you: they are recorded in the residual risk.
  Those points, and defects, issues or gaps found during the run that the task does not handle (for example a pre-existing defect the layout capture shows), are reported to the user with a proposal, and the user decides how they are handled: in the run's final reply each is presented per [Raising a problem](../../CONTEXT.md#42-raising-a-problem-issue-bug-risk), a product decision as one point of "Needs confirmation" and any other item as one point of "Proposals" ([CONTEXT.md](../../CONTEXT.md#5-closing-block-needs-confirmation-and-proposals)).
  They are not fixed outside the task's scope and are not recorded in the target repository (for example in its list of known gaps) unless the user decides so.
  This sweep does not edit historical records (settled Plans, Review reports, original specification content); the Plan changes only per the [Changes to the Plan confirmed by the user](#changes-to-the-plan-confirmed-by-the-user) section.
  The implementation indexes and status tables of the specification directory are living documents and are still kept in sync.
  Sweep again when the behavior changes after the sweep.
- In a repair run, read every FIND/RISK/BLOCK, EVAL and disposition in the report.
  Confirm the trigger and cause by reasoning on the source (reproduce only when this run was asked to investigate a root cause per the router), and look for guards or competing explanations that could refute the conclusion.
  If the report is wrong, record `contradicted` with sources; do not fix a defect that does not exist or substitute another cause yourself.
  Continue the independent items that are clear and return exactly the contradiction to Review before declaring the whole repair run complete.
- Fix `repair` FINDs and carry out the unblocking actions of `retry` BLOCKs.
  `deferred` RISKs keep their owner and revisit condition; `escalate` BLOCKs keep the owner who can provide the input.
  A retry must have a new, grounded action/condition; do not rerun hoping for luck.
  Items of another task (a RISK, FIND or BLOCK in another report) enter this repair run only when this run's source report lists them with this run's task and layer as the owner; `repair_closure_evidence` records the original report and the item ID.
  Items without such an owner keep their owner and revisit condition; if the sweep finds them, state them in `residual_risk` without fixing them along the way.
  EVAL items record the evaluation of the previous run's roles and the framework improvements the Review applied; read them to know which rules changed, but do not turn them into new product FINDs or QGs.
- Keep before/after evidence for the mechanism to fix by reasoning on the source: the old execution path that led to the defect and the change point that blocks it, with a counterexample that distinguishes the defect from valid behavior.
  Do not build, typecheck, lint or run the application; test results under FUT, when the Plan assigns them, are only stated next to the reasoning and are not an evidence line ([sources of evidence](layered-task-execution.instructions.md#verification-by-reasoning)).
  A repair run that touches the UI captures the layout again per the [layout verification instructions](layout-verification.instructions.md), into a new run directory.

### Clean code

Every implementation role applies this rule to the code it creates or changes and completes it before handing over to the verification roles.
The verification roles still work independently.

Write only code that carries out the required logic: no redundant code, no dead code, no code that degrades the logic.
Before writing code, answer:

1. Does the logic already exist in the code, and is new code really needed?
2. Can the existing code be reused?
3. Is the new code clean, and is it free of potential risks or bugs?
4. Is the new code maintainable?
5. What is the purpose of each line of code?

## Changes to the Plan confirmed by the user

The Plan is the standard that the verification roles and Review check against, so when the user has settled something that differs from the Plan, the Plan must match within the session, not be left for Review.

- **When:** during an Implement session (first run or repair run), the implementation deviates from a value, table, scope, allowed path, REQ or QG of the Plan, and the user confirms exactly that deviation in the same session, including when they answer after Implement raised a decision outside the Plan's text.
- **What:** before the verification roles conclude the QGs, edit the affected Plan lines in place and add right under each edited line an annotation `Confirmed change (user, <YYYY-MM-DD>): <old> -> <new>; <reason>`.
  Recalculate every table of values or derived numbers that depends on the changed value (for example the contrast ratio of a color that just changed).
  Record each edit in the Implementation Record's `plan_amendments`.
  The verification roles conclude the QGs against the edited Plan.
- **Does not apply:** deviations the agent chose itself that the user has not confirmed.
  Do not edit the Plan to match the code: ask the user in the session, and record the affected QGs as `BLOCKED` with the decision to be made until they answer.
  Changes to roles, `depends_on` or task boundaries are not covered by this section either and go back to the Plan layer.
  When the user confirms after the Implement session has ended, editing the Plan is a Plan run: use the same form of annotation with the `record_id` of that Plan run, and that record is the trace in place of `plan_amendments`.

## Verifying quality gates by reasoning

Per the [router](layered-task-execution.instructions.md#verification-by-reasoning), an Implement run does not build, typecheck or lint, does not run the application for acceptance, and only writes, updates and runs tests under FUT.
Each QG evidence line comes from a source the router allows; scripts, probes, browsers forcing logic branches, static tools and test results are not evidence.
When the diff changes the UI, `frontend-developer` (or the coordinator when performing that role itself) carries out [layout verification with mocks](layout-verification.instructions.md) after implementing and before handing over to the verification roles; the screenshots and measurements of the checks per the layout verification instructions are a source for the verification roles and do not replace their reasoning.
When delegating, the coordinator states which files are the measurements of the checks and which are diagnostics that are not a source.
When the Plan assigns tests, the implementation role runs only the tests of the functionality under development and the affected functionality.
A red test is explained from the source before fixing the product or the test; do not edit a test to match wrong code, and do not add tests or widen the run to increase confidence.

Each implementation role self-challenges its own work: check the REQs and the `Required logic` against the source, pick a counterexample or edge branch that could refute it, and fix in-scope gaps as soon as they are found.
Self-challenge does not replace the verification role's conclusion.

After the implementation/repair team is done, each verification role handles its assigned QGs:

1. Read the diff together with the surrounding source; trace from the entrypoint through callers, guards and write/read operations to the outcome and state that the `Required logic` states, including the refusal/failure branches that must hold.
   For UI QGs, also look at the screenshots and measurements of the checks per the layout verification instructions in the latest layout capture; if they are missing when the diff changes the UI, return a FAIL to `frontend-developer`.
2. Pick a counterexample that can occur within the QG's scope, look for guards or competing explanations, then consider whether the source refutes the claim of completion.
3. When the task has tests, read the tests in the diff and check them against FUT: traceable to a REQ, exactly the functionality under development and the affected functionality, no duplicates, no assertions the specification does not require.
   A violation is returned as a FAIL.
4. Record `PASS|FAIL|BLOCKED` for each QG with the claim, the path traced, the counterexample and sources.
   `FAIL` when a trigger → mechanism → consequence that violates the QG can be shown, or when a clause of the `Required logic` does not hold against the source even if the impact is small (for example one element or value in a documentation sentence does not match); such a point must not be recorded as a non-blocking observation with `PASS`.
   Things seen outside the `Required logic` are recorded separately as observations and do not change the conclusion.
   `BLOCKED` when sources or decisions needed to conclude are missing, not because tests have not been run.

A FAIL is returned to the implementation role that owns that part, with the trigger, mechanism and fix target; after the fix, the verification role reasons again over the affected part.
At most two repairs of the same cause per run; if it still FAILs, record `failed` with evidence.
Do not weaken a QG to match the code or add QGs mid-run.

Implement checks the product itself and does not change Review conclusions.
After writing the Implementation Record, `process-auditor` self-evaluates the Implement run, applies framework improvements and writes the record per the [router](layered-task-execution.instructions.md#self-evaluation-and-improvement).
Output defects that `process-auditor` finds are returned to the implementation role that owns that part, within the same two-repair limit above.

## Layout verification with mocks

In an Implement run of the Plan chain (first run and repair runs), when the diff creates or changes something the user sees, `frontend-developer` (or the coordinator when performing that role itself) sets up mocks and captures the layout after implementing, before the verification roles conclude the QGs.
Standalone tasks and direct work outside a Plan do this only when the user asks.

- **When:** the diff changes displayed markup/templates/components, styles (CSS/SCSS, tokens used for layout), adds screens, dialogs or popups, or changes display states (error, empty, loading, locked) or UI strings that can change the layout.
  Does not apply when the diff is only in the backend, pure domain code with no display change, tests or documentation.

When this applies, read and follow the [layout verification instructions](layout-verification.instructions.md); otherwise that file is not needed.

## Recording results

Update the Plan status and one `Implementation Record` section below the four Plan content sections.
Record the actual work, sources, changes, QG evidence, self-challenge and limits.
A repair run replaces the reference with the record of that run itself.
The Plan content changes only per the [Changes to the Plan confirmed by the user](#changes-to-the-plan-confirmed-by-the-user) section; do not edit the Plan to legitimize a direction the agent changed on its own.

The Implementation Record follows the [template](../../.skills/pirl-implement/assets/implementation-record-template.md) and the [format reference](../../.skills/pirl-implement/references/implementation-record-format.md) of the `pirl-implement` skill.
After writing it, run the Plan validator (command in the [`pirl-implement` skill's procedure](../../.skills/pirl-implement/SKILL.md#procedure)) and fix errors before handoff.

`role_work` and `role_challenge_results` cover each implementation/repair role, then each verification role, exactly once and in order; `effective_implementation_roles` contains only the implementation/repair team.
`changed_paths` stays within the paths the Plan allows; the Plan file receiving the results is the bookkeeping exception.
Consistency updates from the impact sweep are the second exception: list them separately in `changed_paths` with the sync reason, and state in `role_work` what was swept so readers know which parts were checked.
`root_cause_revalidation` and `review_item_disposition` are always present: the first run writes `N/A`, a repair run covers every report item in order.
`plan_amendments` is also always present, with `N/A` when the Plan was not edited.
When a repair run corrects a statement of an earlier Implementation Record, `repair_closure_evidence` follows the [Shared snapshots and older records section](layered-task-execution.instructions.md#shared-snapshots-and-older-records) of the router: state the time-stamped source showing the statement was wrong when written; without such a source, record the mismatch between the record and the source as a change without a record, and do not claim the old statement was wrong.
The source report must be for the same Plan/task and use `pirl-review/v1`.

## Finishing and handoff

The coordinator and every role carry out the [temporary-resource cleanup](layered-task-execution.instructions.md#cleaning-up-temporary-resources-before-handoff) after the final verification, recording and self-evaluation, then check again before handoff.
Do not declare the Implement run complete or leave the cleanup to Review; this applies even when the result is failed/blocked, keeping the source and the official evidence under the shared contract.

Record `implemented` only when the requirements and role responsibilities are met, the verification roles conclude every QG `PASS`, self-challenge has no open doubts and, when the diff changes the UI, `layout_verification` has a capture run that passes every check, except failed checks the Plan excluded per the [layout verification instructions](layout-verification.instructions.md).
A repair run must also resolve the FINDs, record a disposition for every item and clear the necessary blockers.
Do not claim a finding fixed when its cause was refuted.
`failed` reflects a violated criterion or required work not achieved; `blocked` reflects missing external input/conditions.
`awaiting_confirmation` is used only at a checkpoint that really exists in the Plan.
A QG without enough evidence is recorded `BLOCKED`; do not claim PASS.

Report the result, the decisive evidence, what is incomplete, the Plan link and the self-improvement result per the router's reporting section.
Hand off the implemented source, the exact Plan and the source report to Review or to the owner who can unblock; state the conditions to continue.
Finish the assigned run; do not open Review, pick the next task or ask again for permission for work already assigned.
