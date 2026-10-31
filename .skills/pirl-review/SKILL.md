---
name: pirl-review
description: Runs the Review layer of the PIRL framework. Checks one implementation run of a Plan task against the Plan's quality gates by reasoning on the source, without building or running tests, and writes a report with a Business verdict (findings, risks, blockers) and Evaluations of the Implement roles with the framework improvements applied. Use only when the user's own words ask to review the implementation of a named Plan task or to open a new Review round. Do not use to write or implement a Plan, for a general code review outside a Plan or to edit the framework itself.
metadata:
  id: .skills/pirl-review
  kind: skill
  layer: review
  version: 1.2.0
---

# Review

Carries out one Review round.
The [Review contract](../../.agents/instructions/review.instructions.md) owns the decisions, the rounds and the exit conditions; the [router](../../.agents/instructions/layered-task-execution.instructions.md) owns the shared contracts; [AGENTS.md](../../AGENTS.md) owns the core rules, roles and target repository.
This skill owns the order of the steps, the report format and the helper script.
Where a step names a section, that section decides.

## When to use

- The user's own words ask for a Review of an implementation run, per the [conditions for opening a layer](../../AGENTS.md#choosing-a-layer).
- Not for writing a Plan ([`pirl-plan`](../pirl-plan/SKILL.md)), implementing or repairing ([`pirl-implement`](../pirl-implement/SKILL.md)), a code review that no Plan covers ([standalone task](../../.agents/instructions/standalone-and-maintenance.instructions.md#standalone-tasks)) or [framework maintenance](../../.agents/instructions/standalone-and-maintenance.instructions.md#framework-maintenance).

## Resources

| Resource | Use |
| --- | --- |
| [`assets/review-template.md`](assets/review-template.md) | Template of one Review report |
| [`references/review-format.md`](references/review-format.md) | Frontmatter fields, file naming and location, presentation rules |
| [`scripts/new_review.py`](scripts/new_review.py) | Creates the report of the next round for a Plan task, with the round, `prior_review`, `plan_file` and timestamp filled in |
| [`validate_layer_artifact.py`](../../.agents/evals/validate_layer_artifact.py) | Checks the report structure before the final response |
| [`layer_record.py`](../../.agents/evals/layer_record.py) | Pins the framework version, finds the reviewed Implement record and writes the run's record |

## Procedure

Run the commands from the Hub root.

1. **Open the run.** Apply the [core rules](../../AGENTS.md#core-rules) and [CONTEXT.md](../../CONTEXT.md).
   Run `python -B .agents/evals/layer_record.py start` and keep the returned `framework_ref` ([Timing and evaluator](../../.agents/instructions/layered-task-execution.instructions.md#timing-and-evaluator)).
2. **Read the inputs** ([Inputs and permissions](../../.agents/instructions/review.instructions.md#inputs-and-permissions)): the Plan, its Implementation Record, the diff and source of the Plan's `target_repo`, and earlier reports for the same task.
   Identify the snapshot before concluding.
3. **Round.** Decide whether this work is a new round or belongs to the current one ([Report and rounds](../../.agents/instructions/review.instructions.md#report-and-rounds)).
   A new round creates its report in the directory the user named, or by default under the Hub root ([format](references/review-format.md#location-and-naming)); the current round edits its existing report:

   ```powershell
   python -B .skills/pirl-review/scripts/new_review.py --plan <Plan file> --todo-slug <todo-slug> [--out-dir <dir>]
   ```

4. **Team.** Read the reviewed run's `volume` and pick the roles by the "Select when" column ([AI Agent roles at the Review layer](../../.agents/instructions/review.instructions.md#ai-agent-roles-at-the-review-layer)): delegate `code-reviewer`, and `ux-designer` when the diff changes the UI, first; then delegate the roles the column calls in for `code-reviewer`'s RISKs and BLOCKs, or for checking its conclusions under `large`.
   Each role runs in a separate agent per the [assignment principles](../../.agents/instructions/layered-task-execution.instructions.md#assignment-principles) and receives only its part.
5. **Business** ([contract](../../.agents/instructions/review.instructions.md#business-prove-or-refute-each-suspicion)): conclude each QG, keep only grounded FINDs, RISKs and BLOCKs, and write the `Business` section.
6. **Evaluations and self-evaluation.** `process-auditor`, in a separate agent, evaluates the roles of the reviewed Implement run ([Evaluations](../../.agents/instructions/review.instructions.md#evaluations-assessing-implement-roles)) and the Review run itself ([Self-evaluation and improvement](../../.agents/instructions/layered-task-execution.instructions.md#self-evaluation-and-improvement)), applies improvements and writes the `Evaluations` section.
   The reviewed record is found with:

   ```powershell
   python -B .agents/evals/layer_record.py query --layer implement --plan-set <plan-set> --task <task-id>
   ```

7. **Validate** the report and fix until it passes:

   ```powershell
   python -B .agents/evals/validate_layer_artifact.py --kind review --path <report file>
   ```

8. **Write the record** of the round, with `evaluates` and `task.report_file` set:

   ```powershell
   python -B .agents/evals/layer_record.py append --input <JSON file>
   python -B .agents/evals/layer_record.py check
   ```

9. **Clean up** temporary resources ([router](../../.agents/instructions/layered-task-execution.instructions.md#cleaning-up-temporary-resources-before-handoff)).
10. **Report** ([Finishing and next permissions](../../.agents/instructions/review.instructions.md#finishing-and-next-permissions), [Reporting](../../.agents/instructions/layered-task-execution.instructions.md#reporting)).
    Stop there: a repair run or a new round opens only when the user asks.
