---
name: "Self-evaluation Instructions"
description: "How process-auditor classifies the issues of a layer run, applies improvements and writes the run's record. Read in full by process-auditor; read by the coordinator only when it self-evaluates in mode: self."
applyTo: ".agents/instructions/**/*,.skills/**/*,.agents/roles/process-auditor.role.md"
metadata:
  id: ".agents/instructions/self-evaluation"
  kind: "instruction"
  version: "1.0.1"
  status: "active"
---

# Self-evaluation Instructions

This file holds the procedure of the [router's Self-evaluation and improvement section](layered-task-execution.instructions.md#self-evaluation-and-improvement), which owns when a Plan, Implement or Review run self-evaluates, who evaluates and how the result is reported.
`process-auditor` reads this whole file in every layer run; the coordinator reads it only when it self-evaluates in `mode: self`.
Standalone tasks and framework maintenance do not apply it.

## Issues and causes

An issue is a decision or output that is wrong against the request, the source, a contract or a rule, with evidence.
Each issue records the role (or `coordinator`), the wrong decision, the related rule as `file#section`, the evidence and an `issue_key`: a kebab-case key describing the issue; an issue already present in an earlier record keeps its existing key.

Before classifying, look up earlier records with `layer_record.py query --issue-key <key>` and `layer_record.py query --rule <file#section>`.
Classify by evidence, not by how many times it repeated:

| Cause | When | Required improvement |
| --- | --- | --- |
| `instruction` | Reading the rules at exactly `framework_ref`: no rule covers this case, a rule leads to the wrong decision, two rules conflict, or a rule is ambiguous | Fix the rule |
| `ineffective_fix` | An earlier record fixed an issue with the same key or the same rule, and the issue still happens | Determine why that fix failed (wrong cause, does not cover this case, the role does not load the rule), then replace or revert that fix itself, without stacking another. Record `prior_fix` |
| `input` | The rule is right but the input is missing or wrong: the Plan lacks a decision, the target repository's context documentation is incomplete or wrong | Fix where the input is produced: the rule of the layer or skill that produces it. A gap in the target repository's context documentation lies outside the framework: record that improvement `pending_user` with reason `repository` and propose it to the user as a standalone task in that repository |
| `execution` | The rule is clear, was loaded and leads to the right decision, but the role did not follow it | Increase enforcement: put that point in the role's "Done when" column in the layer file's table, or assign a verification role to check exactly that point |

## Thorough improvement

Applies in `mode: agent`, and in `mode: self` per the [Self-evaluation when `mode: self`](#self-evaluation-when-mode-self) section.
Every issue must have an improvement applied within the run.
There are no off-limits areas and no waiting for proposals:

1. Before editing any framework file, read the [standalone and maintenance instructions](standalone-and-maintenance.instructions.md).
   Fix every place that owns the cause: layer files, skills, role files, `AGENTS.md`, the router, framework tools with their tests.
   The only improvement not applied this way is one in a target repository's context documentation, handled per the `input` row above.
2. Sweep the whole framework for places still describing the old behavior and fix them in the same run.
3. Replace the wrong passage with concrete conditions and actions; do not pile on reminders, and write it in the general form described in the [Framework maintenance section](standalone-and-maintenance.instructions.md#framework-maintenance).
4. Bump the `version` of files that have one.
5. Re-read the edited part against the three scenarios of the [Framework maintenance section](standalone-and-maintenance.instructions.md#framework-maintenance).
6. Run the commands in [Framework checks](standalone-and-maintenance.instructions.md#framework-checks) that match what was edited.

Mandatory exception: never loosen the [safety rules](../../AGENTS.md#safety-rules-and-self-improvement).
An improvement that would loosen a safety rule is not applied: record `pending_user` with reason `safety` and ask the user.

## Self-evaluation when `mode: self`

The self-evaluation itself does not edit framework files: every improvement in its record is recorded as `pending_user` with reason `mode_self`, and the tool rejects `applied` in `mode: self`.
Improvements that touch no safety rule do not need the user's confirmation ([AGENTS.md](../../AGENTS.md#workflow)), so within the same run the coordinator applies each improvement that touches no safety rule as user-directed framework maintenance, following the six steps of the [Thorough improvement](#thorough-improvement) section.
It then writes a new record whose `supersedes` points to the self-evaluation record, with empty `issues` and `fixes`, and a `summary` stating each `issue_key`, the file and section edited, old → new version, the check commands run and a reference to the authorization in `AGENTS.md`.
The final response reports this in the "Self-improvement" section, without asking.

An improvement that touches a safety rule (loosening, narrowing, removing or working around it) is not applied: the record states `pending_user` with reason `safety`; the final response states the issue, cause, rule, the concrete change and the evidence of that improvement in the "Self-improvement" section, and the user's decision (apply, skip, or re-evaluate with a separate agent) is one point in "Needs confirmation" ([CONTEXT.md](../../CONTEXT.md#5-closing-block-needs-confirmation-and-proposals)); no other separate section is opened for that decision.
The run that carries out that choice writes a new record whose `supersedes` points to the old record.

## Record

Each run writes exactly one record with `python -B .agents/evals/layer_record.py append --input <JSON file>` (or by passing JSON on stdin).
On Windows, use `--input` with a UTF-8 file so non-ASCII text is not corrupted.
The tool adds `schema`, `record_id`, `recorded_at` and rejects malformed records; if the record is rejected, the run is not complete.
Do not edit the JSONL files by hand; correct a record with a new record that has `supersedes`.
Records are handoff output, stored at `.agents/evals/records/<layer>/<YYYY-MM-DD>.jsonl`.
That directory is ignored by Git because records describe the user's projects: they stay on the local machine and are never committed, and the tool still reads them for `query` and `check`.

| Field | Content |
| --- | --- |
| `layer` | `plan`, `implement` or `review` |
| `framework_ref` | The value `start` returned at the start of the run |
| `task` | `plan_set`, `task_ids`; Review adds `report_file` |
| `target_repo` | As in the Plan |
| `outcome` | `status` (Plan: `ready`, `draft`, `blocked`; Implement: the Implementation Record status; Review: `completed`, `blocked`) and `summary`; Review adds `verdict` |
| `roles` | Each participating role: `role`, `mode`, `assignment`, `result` (`PASS`, `FAIL`, `BLOCKED`) |
| `audit` | `role: process-auditor`, `mode`, `result` (`clean` or `issues`) |
| `issues` | Each issue: `id` (`ISSUE-NN`), `issue_key`, `role`, `record` (null; or the record in `evaluates` when the issue belongs to the re-evaluated run), `cause`, `decision`, `rule`, `evidence`, `prior_fix` (`<record_id>#FIX-NN`, only for `ineffective_fix`) |
| `fixes` | Each improvement: `id` (`FIX-NN`), the `issues` it addresses, `status` (`applied` or `pending_user`), `reason` when pending (`mode_self`, `safety` or `repository`), `files` (`path`, `section`), `summary`, `checks` (check commands that were run, required when `applied`) |
| `evaluates` | Review: the record of the reviewed Implement run; other layers write null |
| `supersedes` | The record being corrected, or null |

A complete record for a Plan run, as the input of `append`.
Values in `<...>` are placeholders; `framework_ref` is the object `start` returned, copied as is.
A run with no issues writes `issues: []`, `fixes: []` and `audit.result: "clean"`; a Review record also has `task.report_file` and `outcome.verdict`.

```json
{
  "layer": "plan",
  "framework_ref": {"commit": "<commit>", "files": {"<path>": "<hash>"}},
  "task": {"plan_set": "<plan-set>", "task_ids": ["T01"]},
  "target_repo": "<as in the Plan>",
  "outcome": {"status": "ready", "summary": "<summary>"},
  "roles": [{"role": "code-analyst", "mode": "agent", "assignment": "<assignment>", "result": "PASS"}],
  "audit": {"role": "process-auditor", "mode": "agent", "result": "issues"},
  "issues": [{"id": "ISSUE-01", "issue_key": "<kebab-case-key>", "role": "coordinator", "record": null,
              "cause": "instruction", "decision": "<wrong decision>", "rule": "<file#section>", "evidence": "<evidence>"}],
  "fixes": [{"id": "FIX-01", "issues": ["ISSUE-01"], "status": "applied",
             "files": [{"path": "<framework file>", "section": "<section>"}], "summary": "<change>", "checks": ["<command>"]}],
  "evaluates": null,
  "supersedes": null
}
```

Every issue must belong to at least one improvement.
