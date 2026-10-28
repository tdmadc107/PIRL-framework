---
name: pirl-standalone
description: Runs a standalone task of the PIRL framework. Carries out work the user assigns directly, outside a Plan, that closes within the same run and leaves durable output, such as writing or updating documentation on request, an investigation with durable output or a small fix the user specifies, then self-verifies and reports it. Use only for such direct work. Do not use for a question that only needs an explanation, to create, implement or review a Plan, or to edit the framework itself.
metadata:
  id: .skills/pirl-standalone
  kind: skill
  version: 1.0.0
---

# Standalone task

Carries out one standalone task.
The [Standalone tasks](../../.agents/instructions/standalone-and-maintenance.instructions.md#standalone-tasks) section owns what the work must do and how it is verified; [AGENTS.md](../../AGENTS.md) owns the core rules and the target repository.
This skill owns only the order of the steps.
Where a step names a section, that section decides.
No layer opens: no Plan, report or self-evaluation record is written.

## When to use

- The user assigns work directly, outside the Plan → Implement → Review chain, and the work leaves durable output ([Choosing a layer](../../AGENTS.md#choosing-a-layer)).
- Not for a question that only needs an explanation and creates no durable output, which is answered directly; not for writing a Plan ([`pirl-plan`](../pirl-plan/SKILL.md)), carrying out a Plan task, even with a single role ([`pirl-implement`](../pirl-implement/SKILL.md)), checking an implementation ([`pirl-review`](../pirl-review/SKILL.md)) or editing the framework itself ([`pirl-maintain`](../pirl-maintain/SKILL.md)).

## Procedure

1. **Open the task.** Apply the [core rules](../../AGENTS.md#core-rules) and [CONTEXT.md](../../CONTEXT.md).
2. **Target repository.** When the work touches a product repository, identify it per [AGENTS.md](../../AGENTS.md#target-repository) and read its context documentation.
3. **Deliver** within exactly the scope the user assigned (step 1 of [Standalone tasks](../../.agents/instructions/standalone-and-maintenance.instructions.md#standalone-tasks)).
4. **Self-verify** the output (step 2 of [Standalone tasks](../../.agents/instructions/standalone-and-maintenance.instructions.md#standalone-tasks), [Verifying standalone work](../../.agents/instructions/standalone-and-maintenance.instructions.md#verifying-standalone-work)).
5. **Clean up** temporary resources ([router](../../.agents/instructions/layered-task-execution.instructions.md#cleaning-up-temporary-resources-before-handoff)).
6. **Report** the delivery result, how it was verified and what remains unknown (step 3 of [Standalone tasks](../../.agents/instructions/standalone-and-maintenance.instructions.md#standalone-tasks)), in the form of [CONTEXT.md](../../CONTEXT.md#44-summarizing-a-work-session).
