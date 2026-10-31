---
name: "Review Layer Instructions"
description: "Check the Plan's quality gates by reasoning on the source, without relying on builds/tests, and report Business and Evaluations (assessment of the Implement roles, causes of their issues and improvements applied)."
applyTo: ".agents/instructions/review.instructions.md"
metadata:
  id: ".agents/instructions/review"
  kind: "instruction"
  version: "2.1.1"
  status: "active"
---

# Review Layer Instructions

Apply the Review process only when the request and the [router](layered-task-execution.instructions.md) have selected this layer.
Reading or updating a Plan/report file does not activate another layer.

This contract owns the decisions and the exit conditions of a Review against a Plan; the run is carried out through the [`pirl-review` skill](../../.skills/pirl-review/SKILL.md), which owns the run procedure, the report template, its presentation rules, its location and the helper script.
Review must distinguish a wrong product, insufficient evidence and instructions that led an agent to a wrong decision.
Use exactly the two sections `Business` and `Evaluations`; keep IDs, symbols, role names and paths verbatim, and explain in plain English.

## AI Agent roles at the Review layer

The role catalog lives in the [standalone and maintenance instructions](standalone-and-maintenance.instructions.md#role-catalog) and the assignment principles in the [router](layered-task-execution.instructions.md#assignment-principles); each role's expertise lives in the role file linked in the table.
Review picks `review_roles` by the `volume` of the reviewed Implement run, recorded in the Implementation Record per the [Recording results section](implement.instructions.md#recording-results); when an older record has no `volume`, the coordinator computes it from the reviewed diff by the same rule and states it in `implementation_target`.
`code-reviewer` is the main role in every round and owns the conclusion of every QG that is not a UI QG; the other roles join only as the "Select when" column says, and each receives only the part its row names.

| Role | Select when | Responsibility at Review | Done when |
| --- | --- | --- | --- |
| [`code-reviewer`](../roles/code-reviewer.role.md) | Every round | Conclude each QG that is not a UI QG by tracing the diff from the entrypoint through callers, guards and writers/readers to the final state, against its `Required logic` and REQ; challenge the diff: bugs, regressions, permissions and security, inconsistency, guards/error handling, contracts and boundaries the diff touches, tests that violate FUT | Each such QG has `PASS\|FAIL\|BLOCKED` with the path traced, a counterexample and sources; each suspicion is proven as a FIND, kept as a grounded RISK or BLOCK, or refuted with sources |
| [`code-analyst`](../roles/code-analyst.role.md) | `small` or `medium`: `code-reviewer`'s result has a RISK or a BLOCK; `large`: every round, after `code-reviewer` | `small`/`medium`: analyze each RISK and BLOCK for its mechanism and reachability (trigger, call path, guards) so the coordinator can decide it; `large`, execution-path check: for each QG conclusion of `code-reviewer`, re-trace the path from the entrypoint through callers, guards and writers/readers to the final state, and whether its counterexample can occur | Each assigned RISK/BLOCK is confirmed, turned into a FIND or refuted, or each `code-reviewer` QG conclusion is confirmed or refuted on that aspect, with sources |
| [`solution-architect`](../roles/solution-architect.role.md) | `medium`: `code-reviewer`'s result has a RISK or a BLOCK; `large`: every round, after `code-reviewer` | `medium`: analyze each RISK and BLOCK for the contracts, ownership, task boundaries and dependencies it touches and name its owner; `large`, contract and boundary check: whether each conclusion of `code-reviewer` still holds at the contracts, ownership, task boundaries and dependencies the diff touches (other consumers, shared components, other tasks) | As `code-analyst`, for that aspect |
| [`business-analyst`](../roles/business-analyst.role.md) | `medium`: `code-reviewer`'s result has a RISK or a BLOCK; `large`: every round, after `code-reviewer` | `medium`: analyze each RISK and BLOCK against the REQs, the `Required logic` and the user's decisions; `large`, requirement check: whether each QG verdict of `code-reviewer` is true to its REQ, its `Required logic` and the user's decisions, with no self-invented criterion | As `code-analyst`, for that aspect |
| [`ux-designer`](../roles/ux-designer.role.md) | The diff changes the UI, at every `volume` | Read Implement's `layout_verification` and screenshots and conclude the UI QGs against them | Each UI QG has a conclusion with the screenshots and source checked |
| [`process-auditor`](../roles/process-auditor.role.md) | Every Review round; not recorded in `review_roles` | Re-evaluate the Implement roles (Evaluations section) and self-evaluate the Review run per the [router](layered-task-execution.instructions.md#self-evaluation-and-improvement) | Evaluations cover the Implement team; record written; improvements applied or summarized for the user |

- `review_roles` lists the roles that actually ran, in the table's order.
  A role that joins because of a RISK or a BLOCK runs after `code-reviewer` and receives only those items; its conclusion settles the item together with the coordinator, by the source.
  Under `large`, each of the three checking roles examines only its own aspect of `code-reviewer`'s conclusions, so no aspect has two owners; a disagreement between a checking role and `code-reviewer` is settled by the coordinator on the source, and the report states which conclusion holds.
- Settle disagreements by the source and merge suspicions with the same cause; do not vote.
  Delegate each role in `review_roles` per the [assignment principles](layered-task-execution.instructions.md#assignment-principles).
  The report records how each role was performed (a separate agent, or self-performed with the reason) and the actual level of independence when a role has read the run's drafts or conclusions.
- For each Implement record, assign one evaluation owner and cross-check when there is a suspicion.

## Inputs and permissions

- Read exactly the `pirl-plan/v1` Plan, the Implementation Record, the source/diff of the assigned run and any earlier report for the same task.
  Identify the snapshot before concluding and read it per the [Shared snapshots and older records section](layered-task-execution.instructions.md#shared-snapshots-and-older-records) of the router.
- Conclude each QG on the final source; when several tasks share a snapshot, record the shared snapshot in `implementation_target`.
  A mismatch with an earlier task's QG that belongs to a later task, in the order rebuilt per the router, is not a FAIL of the earlier task and is not counted against the earlier task's Implement roles; if it lies outside the later task's REQs, it is a FIND of the later task.
  An unowned change is not a FIND of any task: if it breaks a QG of the task under review, record that QG `BLOCKED` with an `escalate` BLOCK because there is no owner to assign a `repair` to; otherwise state it in `implementation_target` and `Next`.
- A Plan with `Confirmed change` annotations is the current Plan: conclude the QGs against it, after finding the trace of each annotation per the [Implement rule](implement.instructions.md#changes-to-the-plan-confirmed-by-the-user): the `plan_amendments` field of the Implementation Record, or the record of the Plan run for the same task whose `record_id` the annotation states.
  An annotation without any trace, or whose trace does not state the user's confirmation of that change, is not a baseline: conclude the QGs against the value before the change and record an `escalate` BLOCK for the user to confirm.
- Product source, tests, config, the Plan and the Implementation Record are read-only inputs.
  Review writes this run's report; framework files are edited only by `process-auditor` per the [router](layered-task-execution.instructions.md#self-evaluation-and-improvement).
  Do not edit the product, the Plan or the Implementation Record.

## Business: prove or refute each suspicion

1. Take the QGs and `Required logic` verbatim from the Plan.
   The REQs and the user's decisions explain the criteria; rubrics, reviewer preferences and instruction defects do not create new product criteria.
   Check against the [Plan's task boundaries](plan.instructions.md#splitting-tasks-for-separate-implementation-and-acceptance): do not use another task's integration criteria as a PASS condition of the task under review.
   If a QG itself needs work assigned to a later/parallel task, record that QG `BLOCKED` and create an `escalate` BLOCK back to Plan to fix the assignment/QG; do not assign `repair`/`retry` to the same task just to wait for that work.
   Do not drop the QG or record PASS yourself; still evaluate independent implementation defects that have enough evidence.
2. Trace the entrypoint, callers, guards, writers/readers, configuration and failure branches that can occur.
   Confirm the trigger is within the usage contract.
   An internal function that does not validate data does not prove the whole system lacks validation.
3. For a suspicion, connect trigger → mechanism → consequence → violated QG.
   Actively look for refuting sources, including deliberate invariants.
   Severity must rest on impact and on whether the failure path is reachable; a name, a regex or a code fragment is not enough to prove a deadlock, data loss or a Critical defect.
4. Conclude QGs by reasoning on the source per the [router](layered-task-execution.instructions.md#verification-by-reasoning): Review does not build, does not create/run tests, scripts, mocks or the application, and does not use test/build results, including results written in the Implementation Record, as a baseline or PASS/FAIL evidence.
   When the diff changes the UI, read the `layout_verification` and screenshots that Implement captured per [layout verification with mocks](layout-verification.instructions.md) as a source for UI QGs, without capturing again.
   A green test does not prove the business logic is right, and a red test does not prove the product is wrong.
   A counterexample is an input and call path traceable on the source, valid only if it can occur within the QG's scope.
5. Keep only well-grounded conclusions:
   - `FIND`: a real bug that violates a QG, with trigger, source, cause and impact.
   - `RISK`: a grounded risk mechanism while the QG still holds; record the limit, owner and revisit condition.
     A risk does not require a fix or block a business PASS.
   - `BLOCK`: missing sources, conditions or decisions needed to conclude a QG; state the missing evidence, who provides it and the action to continue.
     A refuted suspicion is removed from the findings, not relabeled as a risk to keep it.
     Missing tests, not having built/run, or red/green test results are not by themselves a FIND, RISK or BLOCK; do not ask for more tests, builds or releases.
     Conversely, tests in the diff that violate the [FUT rule](layered-task-execution.instructions.md#functional-tests-fut-rule) (not traceable to a REQ/specification, outside the functionality under development and the affected functionality, redundant duplicates, assertions contrary to the specification or that block a correct result) are a `repair` FIND; its QG field records `FUT` with the related REQ.
     A diff that changes the UI while the Implementation Record lacks `layout_verification`, or screenshots showing a layout that violates a QG, is also a `repair` FIND for the implementation role that owns the UI.
6. Give instructions by the mechanism to fix, file/symbol, order and the outcome to preserve; instructions cover editing source, documentation or tests under FUT; do not assign builds or running tests outside FUT.
   A FIND within the Plan's scope uses `repair`; if it changes settled behavior, paths or decisions, use `replan`.
   While any `replan` remains, leave `repair_roles` empty and hand off to Plan.
   If the fix stays within scope, the repair team is exactly the implementation roles accountable for `repair` FINDs and `retry` BLOCKs, in handoff order.
   RISKs are deferred: `Instructions` and `Revisit when` name the task and layer that will handle them or the work the user needs to assign; while there is no owning task, do not write "a later run" or "the next edit of <file>", and instructions for another task to handle name that task.
   `escalate` BLOCKs move to another owner.
   Assign `retry` only when there is a new action/condition; do not open another round for the same blocker.
7. Record QG `PASS|FAIL|BLOCKED`.
   Business is `FAIL` when a QG has failed or there is a `FUT` FIND; if nothing failed but mandatory grounds are missing, it is `BLOCKED`; otherwise `PASS`.
   Risks and instruction defects alone do not reverse this conclusion.

## Evaluations: assessing Implement roles

This section answers: did each role of the reviewed Implement run do its assigned part correctly, and if not, what was the root cause and where was the framework improved.
The Review's `process-auditor` carries out this section together with the Review run's self-evaluation, per the [router](layered-task-execution.instructions.md#self-evaluation-and-improvement).
Review also knows the FINDs that the Implement run missed, so this evaluation has more evidence than Implement's own self-evaluation.

1. Find the record of the reviewed Implement run with `python -B .agents/evals/layer_record.py query --layer implement --plan-set <plan-set> --task <task-id>`.
   In the result, pick the latest record whose `roles` list contains the Implement roles to evaluate and write it into the Review record's `evaluates`.
   A record that only applies improvements or corrections (`supersedes` set, `roles` containing only `coordinator`) is not the evaluated record; mention it in the EVAL's Evidence field.
   A correction record that carries all the roles is itself the evaluated record.
2. Create one EVAL for each role in `effective_implementation_roles`, then each verification role of the Plan, in the Implementation Record's order.
   Evaluate against the work, information and instructions actually assigned; do not fail the whole team over one bug.
   A verification role is evaluated on its QG conclusions: whether its reasoning stands against the source, whether it missed FINDs that Review found, whether it relied on run results instead of reasoning.
3. Each issue of an Implement role is classified by cause and improved per the [self-evaluation instructions](self-evaluation.instructions.md#issues-and-causes), recorded in the Review record with `record` set to the record in `evaluates`; the issue is attributed to the task and run that produced it per the [Shared snapshots and older records section](layered-task-execution.instructions.md#shared-snapshots-and-older-records) of the router.
   The EVAL records the cause, the `issue_key` and where it was fixed, or that it is pending the user.
4. Do not invent issues.
   Role or instruction issues do not lower the Business verdict and do not block handing off a delivery that already qualifies; if the report itself is wrong, fix the report before settling it.

## Report and rounds

Each Review round writes one `pirl-review/v1` report, built from the `review` skill's [template](../../.skills/pirl-review/assets/review-template.md) and saved where the user says, or by default under the Hub root, per the [report format](../../.skills/pirl-review/references/review-format.md).
The first round has `prior_review: null`; later rounds reference the report immediately before.
A request for additional phases or evidence for the same implementation run belongs to the current Review round: update that report and keep `review_round` and `prior_review`.
Do not increment the round just because of a message, the time of verification or an extra investigation scope.
Open a new round when assigned to review the next implementation/repair run or when the user explicitly asks for an independent round.
When editing a settled report, record the reason for the edit in the report and leave the other rounds intact.

## Finishing and next permissions

Run the report validator (command in the [`pirl-review` skill's procedure](../../.skills/pirl-review/SKILL.md#procedure)) and fix structural errors before the final response.

The coordinator and every Review role carry out the [temporary-resource cleanup](layered-task-execution.instructions.md#cleaning-up-temporary-resources-before-handoff) after the final verification, self-evaluation and record writing, then check again before the final response.
The rule applies even when Business is FAIL or the Review is blocked; do not claim completion just because the report and validator pass.

`verdict` equals `business_verdict`.
`status: completed` means the evaluation is complete: Business has a well-grounded conclusion, Evaluations cover the Implement team, the Review record is written, and temporary resources have been cleaned up and checked again under the shared contract.
A Business FAIL can still be a completed Review.
Missing input needed for the evaluation uses `status: blocked`.

If the Implementation Record or the implementation run's input is missing, keep a two-part draft with exactly the missing input.
A draft that does not meet the contract cannot be used as a source for assigning product repairs.
Complete it directly on the draft when the input arrives; do not open a round just to fill in missing information.

Report the Business result, the level of evaluation completion, the self-improvement result per the router's reporting section and links to the report/Plan.
Finish at handoff; do not implement the product, pick the next task or open a new Review round on your own.
