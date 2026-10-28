---
name: pirl-maintain
description: Runs framework maintenance of the PIRL framework. Edits the framework's own files (AGENTS.md, CONTEXT.md, instructions, roles, skills or framework tools) within the scope the user assigns, finds the file that owns each rule, writes rules in their general form and runs the framework checks. Use only when the user's own words ask to change the framework itself outside a Plan, Implement or Review run. Do not use for work on a product repository, a standalone task, a question that only needs an explanation, or the improvements that process-auditor applies inside a layer run.
metadata:
  id: .skills/pirl-maintain
  kind: skill
  version: 1.0.0
---

# Framework maintenance

Carries out one framework maintenance task that the user assigns.
The [Framework maintenance](../../.agents/instructions/standalone-and-maintenance.instructions.md#framework-maintenance) section owns how framework files are edited and checked; [AGENTS.md](../../AGENTS.md) owns the core rules and the [safety rules](../../AGENTS.md#safety-rules-and-self-improvement).
This skill owns only the order of the steps.
Where a step names a section, that section decides.
No layer opens: no Plan, report or self-evaluation record is written.
The improvements that `process-auditor` applies inside a layer run follow the [self-evaluation instructions](../../.agents/instructions/self-evaluation.instructions.md#thorough-improvement), not this skill.

## When to use

- The user's own words ask to change the framework itself: `AGENTS.md`, `CONTEXT.md`, instructions, roles, skills or framework tools ([Choosing a layer](../../AGENTS.md#choosing-a-layer)).
- Not for work on a product repository ([`pirl-standalone`](../pirl-standalone/SKILL.md) or a layer), a question that only needs an explanation, or a layer run ([`pirl-plan`](../pirl-plan/SKILL.md), [`pirl-implement`](../pirl-implement/SKILL.md), [`pirl-review`](../pirl-review/SKILL.md)).

## Procedure

1. **Open the task.** Apply the [core rules](../../AGENTS.md#core-rules) and [CONTEXT.md](../../CONTEXT.md), then read the [standalone and maintenance instructions](../../.agents/instructions/standalone-and-maintenance.instructions.md) in full.
2. **Find the owner.** Start from the wrong or missing decision, identify the file that owns it and read the files that reference it ([Framework maintenance](../../.agents/instructions/standalone-and-maintenance.instructions.md#framework-maintenance)).
3. **Check the safety rules.** A change that loosens, narrows, removes or works around a [safety rule](../../AGENTS.md#safety-rules-and-self-improvement) is applied only when the user's own words approve that change; otherwise ask, in the form of [Asking for a decision or for content](../../CONTEXT.md#46-asking-for-a-decision-or-for-content), and apply the independent parts.
4. **Edit** within exactly the scope the user assigned, in the general form and line layout of [Framework maintenance](../../.agents/instructions/standalone-and-maintenance.instructions.md#framework-maintenance), and bump the `version` of each edited file that has one.
5. **Re-read** the edited part against the three scenarios of [Framework maintenance](../../.agents/instructions/standalone-and-maintenance.instructions.md#framework-maintenance).
6. **Run the checks** of [Framework checks](../../.agents/instructions/standalone-and-maintenance.instructions.md#framework-checks) that match the change, and fix until they pass.
7. **Clean up** temporary resources ([router](../../.agents/instructions/layered-task-execution.instructions.md#cleaning-up-temporary-resources-before-handoff)).
8. **Report** what changed, grouped by purpose, with each file and section edited, old → new version, the checks run and what remains open, in the form of [CONTEXT.md](../../CONTEXT.md#44-summarizing-a-work-session).
