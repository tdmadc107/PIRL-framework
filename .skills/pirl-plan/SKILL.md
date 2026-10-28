---
name: pirl-plan
description: Runs the Plan layer of the PIRL framework. Turns a product request into a Plan package for one target repository, one file per task, with REQs, the approach, implementation and verification roles, and quality gates that can be proven by reasoning on the source. Use only when the user's own words ask to create, write, split or adjust a Plan. Do not use to implement or review a Plan, to answer a question, for a standalone task or to edit the framework itself.
metadata:
  id: .skills/pirl-plan
  kind: skill
  layer: plan
  version: 1.2.0
---

# Plan

Carries out one Plan layer run.
The [Plan contract](../../.agents/instructions/plan.instructions.md) owns the decisions and exit conditions; the [router](../../.agents/instructions/layered-task-execution.instructions.md) owns the shared contracts; [AGENTS.md](../../AGENTS.md) owns the core rules, roles and target repository.
This skill owns the order of the steps, the Plan file format and the helper script.
Where a step names a section, that section decides.

## When to use

- The user's own words ask for a Plan, per the [conditions for opening a layer](../../AGENTS.md#choosing-a-layer).
- Not for carrying out a Plan ([`pirl-implement`](../pirl-implement/SKILL.md)), checking an implementation ([`pirl-review`](../pirl-review/SKILL.md)), a question that only needs an explanation, a [standalone task](../../.agents/instructions/standalone-and-maintenance.instructions.md#standalone-tasks) or [framework maintenance](../../.agents/instructions/standalone-and-maintenance.instructions.md#framework-maintenance).

## Resources

| Resource | Use |
| --- | --- |
| [`assets/plan-template.md`](assets/plan-template.md) | Template of one Plan task file |
| [`references/plan-format.md`](references/plan-format.md) | Frontmatter fields, sections, file naming and output location |
| [`scripts/new_plan.py`](scripts/new_plan.py) | Creates the package directory and one task file from the template, with the package name, task ID, file name and timestamp filled in |
| [`validate_layer_artifact.py`](../../.agents/evals/validate_layer_artifact.py) | Checks the Plan structure before handoff |
| [`layer_record.py`](../../.agents/evals/layer_record.py) | Pins the framework version at the start and writes the run's record |

## Procedure

Run the commands from the Hub root.

1. **Open the run.** Apply the [core rules](../../AGENTS.md#core-rules) and [CONTEXT.md](../../CONTEXT.md).
   Run `python -B .agents/evals/layer_record.py start` and keep the returned `framework_ref` ([Timing and evaluator](../../.agents/instructions/layered-task-execution.instructions.md#timing-and-evaluator)).
2. **Target repository.** Identify it per [AGENTS.md](../../AGENTS.md#target-repository) and read its context documentation.
3. **Planning team.** When the request leaves open what to change or the new content, ask first and wait for the answers ([contract](../../.agents/instructions/plan.instructions.md#investigating-and-settling-decisions)).
   Pick the roles by the "Select when" column, or keep exactly the roles the user named ([AI Agent roles at the Plan layer](../../.agents/instructions/plan.instructions.md#ai-agent-roles-at-the-plan-layer)).
   Delegate each role to a separate agent per the [assignment principles](../../.agents/instructions/layered-task-execution.instructions.md#assignment-principles).
4. **Investigate and settle decisions** ([contract](../../.agents/instructions/plan.instructions.md#investigating-and-settling-decisions)).
   Ask only about missing decisions that change the result and request the content only the user can supply, each in the form of [Asking for a decision or for content](../../CONTEXT.md#46-asking-for-a-decision-or-for-content); continue the independent parts.
   Asking pauses the run: the next steps, self-evaluation included, follow the answers.
   When no part has enough basis, write no Plan file: skip steps 5 to 7 and continue at step 8 with the `blocked` outcome of [Saving and handoff](../../.agents/instructions/plan.instructions.md#saving-and-handoff).
5. **Split the work into tasks** ([contract](../../.agents/instructions/plan.instructions.md#splitting-tasks-for-separate-implementation-and-acceptance)), within the [scope of work](../../.agents/instructions/plan.instructions.md#scope-of-work-source-code-documentation-and-functional-tests) and with [separate implementation and verification roles](../../.agents/instructions/plan.instructions.md#separating-implementation-roles-from-verification-roles).
6. **Write the task files** in the directory the user named, or by default under the Hub root ([format](references/plan-format.md#location-and-naming)).
   The first task starts the package; each next task joins it:

   ```powershell
   python -B .skills/pirl-plan/scripts/new_plan.py --request-slug <request-slug> --todo-slug <todo-slug> [--out-dir <dir>]
   python -B .skills/pirl-plan/scripts/new_plan.py --plan-set <plan-set> --todo-slug <todo-slug> [--out-dir <dir>]
   ```

   Replace every `<...>` placeholder so the content is [sufficient to execute](../../.agents/instructions/plan.instructions.md#content-must-be-sufficient-to-execute).
7. **Self-review and validate** ([contract](../../.agents/instructions/plan.instructions.md#self-review-before-handoff)), then fix and rerun until the validator passes:

   ```powershell
   python -B .agents/evals/validate_layer_artifact.py --kind plan --path <package directory>
   ```

8. **Self-evaluate.** `process-auditor`, in a separate agent, evaluates the run, applies improvements and writes exactly one record ([Self-evaluation and improvement](../../.agents/instructions/layered-task-execution.instructions.md#self-evaluation-and-improvement)):

   ```powershell
   python -B .agents/evals/layer_record.py append --input <JSON file>
   python -B .agents/evals/layer_record.py check
   ```

9. **Clean up** temporary resources ([router](../../.agents/instructions/layered-task-execution.instructions.md#cleaning-up-temporary-resources-before-handoff)).
10. **Hand off and report** ([Saving and handoff](../../.agents/instructions/plan.instructions.md#saving-and-handoff), [Reporting](../../.agents/instructions/layered-task-execution.instructions.md#reporting)).
    Stop there: Implement opens only when the user asks for it.
