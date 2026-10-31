---
name: pirl-implement
description: Runs the Implement layer of the PIRL framework. Carries out exactly one Plan task in its target repository, or repairs it per a Review report for the same task, has separate verification roles conclude every quality gate by reasoning on the source, and writes the Implementation Record into the Plan file. Use only when the user's own words ask to implement a named Plan or to fix per a named Review report. Do not use to write a Plan, to review, for work outside a Plan or to edit the framework itself.
metadata:
  id: .skills/pirl-implement
  kind: skill
  layer: implement
  version: 1.1.4
---

# Implement

Carries out one Implement layer run: a first run of a Plan task, or a repair run per a Review report.
The [Implement contract](../../.agents/instructions/implement.instructions.md) owns the decisions, when layout verification with mocks applies, and the exit conditions; the [layout verification instructions](../../.agents/instructions/layout-verification.instructions.md) own how it is done; the [router](../../.agents/instructions/layered-task-execution.instructions.md) owns the shared contracts (verification by reasoning, functional tests); [AGENTS.md](../../AGENTS.md) owns the core rules, roles and target repository.
This skill owns the order of the steps, the Implementation Record format and the helper scripts.
Where a step names a section, that section decides.

## When to use

- The user's own words ask to implement a Plan task, or to fix per a Review report, per the [conditions for opening a layer](../../AGENTS.md#choosing-a-layer).
- Not for writing a Plan ([`pirl-plan`](../pirl-plan/SKILL.md)), checking an implementation ([`pirl-review`](../pirl-review/SKILL.md)), work assigned outside a Plan ([standalone task](../../.agents/instructions/standalone-and-maintenance.instructions.md#standalone-tasks)) or [framework maintenance](../../.agents/instructions/standalone-and-maintenance.instructions.md#framework-maintenance).

## Resources

| Resource | Use |
| --- | --- |
| [`assets/implementation-record-template.md`](assets/implementation-record-template.md) | Template of the Implementation Record section |
| [`references/implementation-record-format.md`](references/implementation-record-format.md) | Where the record goes, how its fields are written, the layout capture directory |
| [`scripts/add_implementation_record.py`](scripts/add_implementation_record.py) | Appends the record template to a Plan file that has none yet, with `updated_at` filled in |
| [`scripts/new_layout_run.py`](scripts/new_layout_run.py) | Creates the directory of one layout capture run for the Plan task |
| [`validate_layer_artifact.py`](../../.agents/evals/validate_layer_artifact.py) | Checks the Plan and its record before handoff |
| [`layer_record.py`](../../.agents/evals/layer_record.py) | Pins the framework version, finds earlier records and writes the run's record |

## Procedure

Run the commands from the Hub root.

1. **Open the run.** Apply the [core rules](../../AGENTS.md#core-rules) and [CONTEXT.md](../../CONTEXT.md).
   Run `python -B .agents/evals/layer_record.py start` and keep the returned `framework_ref` ([Timing and evaluator](../../.agents/instructions/layered-task-execution.instructions.md#timing-and-evaluator)).
2. **Read the inputs** ([contract](../../.agents/instructions/implement.instructions.md#reading-inputs-and-determining-scope)): exactly the named Plan file, its Implementation Record if any, the named Review report for a repair run, and the source of the Plan's `target_repo` with its context documentation ([AGENTS.md](../../AGENTS.md#target-repository)).
3. **Team.** The Plan's `implementation_roles` (or the report's `repair_roles` for a repair run), then the Plan's `verification_roles` ([AI Agent roles at the Implement layer](../../.agents/instructions/implement.instructions.md#ai-agent-roles-at-the-implement-layer)).
   Delegate each role to a separate agent per the [assignment principles](../../.agents/instructions/layered-task-execution.instructions.md#assignment-principles), with its role file, its table row and the rows that row refers to.
4. **Implement or repair** ([contract](../../.agents/instructions/implement.instructions.md#implementing-and-repairing-per-review)), with tests only under the [FUT rule](../../.agents/instructions/layered-task-execution.instructions.md#functional-tests-fut-rule) and the test command the target repository documents.
   A deviation the user confirms follows [Changes to the Plan confirmed by the user](../../.agents/instructions/implement.instructions.md#changes-to-the-plan-confirmed-by-the-user).
5. **Capture the layout** when the diff changes the UI, before verification ([Layout verification with mocks](../../.agents/instructions/implement.instructions.md#layout-verification-with-mocks)), through the host's browser tools and inside the closed capture set of the [layout verification instructions](../../.agents/instructions/layout-verification.instructions.md); write no capture script.
   Each capture run gets a new directory:

   ```powershell
   python -B .skills/pirl-implement/scripts/new_layout_run.py --plan <Plan file>
   ```

6. **Verify the quality gates by reasoning** ([contract](../../.agents/instructions/implement.instructions.md#verifying-quality-gates-by-reasoning)).
   A FAIL goes back to the implementation role that owns the part, at most two repairs of the same cause.
7. **Write the Implementation Record** ([Recording results](../../.agents/instructions/implement.instructions.md#recording-results), [format](references/implementation-record-format.md)).
   When the Plan has no record yet, add the template first; set the Plan's `status` to the record's `status`; then validate and fix until it passes:

   ```powershell
   python -B .skills/pirl-implement/scripts/add_implementation_record.py --plan <Plan file>
   python -B .agents/evals/validate_layer_artifact.py --kind plan --path <Plan file>
   ```

8. **Self-evaluate.** `process-auditor`, in a separate agent, evaluates the run, applies improvements and writes exactly one record ([Self-evaluation and improvement](../../.agents/instructions/layered-task-execution.instructions.md#self-evaluation-and-improvement)); output defects it finds go back to the owning implementation role within the same two-repair limit:

   ```powershell
   python -B .agents/evals/layer_record.py append --input <JSON file>
   python -B .agents/evals/layer_record.py check
   ```

9. **Clean up** temporary resources in the Hub and the target repository; keep the layout capture directories ([router](../../.agents/instructions/layered-task-execution.instructions.md#cleaning-up-temporary-resources-before-handoff)).
10. **Hand off and report** ([Finishing and handoff](../../.agents/instructions/implement.instructions.md#finishing-and-handoff), [Reporting](../../.agents/instructions/layered-task-execution.instructions.md#reporting)).
    Stop there: Review opens only when the user asks for it.
