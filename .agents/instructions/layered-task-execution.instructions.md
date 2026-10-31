---
name: "Layered Task Execution Instructions"
description: "Defines the boundaries between Plan, Implement, Review and other kinds of work, the assignment principles, and the shared contracts: verification by reasoning, functional tests, shared snapshots and older records, self-evaluation and improvement, temporary-resource cleanup."
applyTo: ".agents/instructions/**/*,.skills/**/*"
metadata:
  id: ".agents/instructions/layered-task-execution"
  kind: "instruction"
  version: "2.5.2"
  status: "active"
---

# Layered Task Execution Instructions

## Scope and sources of decisions

This contract routes work through the three layers Plan, Implement and Review and holds their shared rules.
The current request and the permissions the user has granted decide the scope; AI Agent roles supply expertise and do not add product goals or a new approval round on their own.

[AGENTS.md](../../AGENTS.md) owns the core rules, the structure, how the kind of work is chosen, the role catalog with the delegation rules and how the target repository is chosen; role files own each role's expertise; the router owns the boundaries between kinds of work, the assignment principles and the shared contracts; the [standalone and maintenance instructions](standalone-and-maintenance.instructions.md) own standalone tasks, framework maintenance, the framework structure and the role catalog; layer contracts own the roles' responsibilities at the layer, the decisions and the content of the output; each layer's skill in `.skills/` owns the run procedure, the output format and the helper scripts.
Fix things where the decision is owned; do not copy a process into several files.

The current handoff schemas are `pirl-plan/v1` and `pirl-review/v1`.
Other schemas are not handoff inputs; do not create migrations or readers for old schemas.

## Choosing a layer

The kind of work is chosen per [Choosing a layer](../../AGENTS.md#choosing-a-layer) in `AGENTS.md`, which every host loads; this router holds the boundaries and shared contracts that apply once the kind of work is chosen.
Standalone tasks and framework maintenance are in the [standalone and maintenance instructions](standalone-and-maintenance.instructions.md), read only in the cases that file lists.

## AI Agent roles and assignment

The [role catalog](standalone-and-maintenance.instructions.md#role-catalog) and the [constraints that keep roles separate from skills](standalone-and-maintenance.instructions.md#constraints-that-keep-roles-separate-from-skills) live in the standalone and maintenance instructions, the delegation rules in [AGENTS.md](../../AGENTS.md#ai-agent-roles); this section holds the assignment principles.

### Assignment principles

For all three layers, together with the delegation rules in AGENTS.md:

- The coordinator (the Agent receiving the request from the user) is responsible for the final result: it assigns work and merges results by evidence, not by how many roles agree.
- Roles that do not need each other's results run in parallel; a role that needs another role's result runs after that role (`process-auditor` runs after the layer's output is settled).
  The coordinator does not do the delegated work itself.
- Each question of the run is assigned to exactly one role: each QG, each suspicion or check (for example a regression path, a contract between two components, the ownership of a change) and each item to analyze.
  Before delegating, the coordinator lists these questions and gives each one owner by the role's expertise; the assignment names the questions that other roles own, and a role that meets one of them reports it to the coordinator instead of examining it.
  Two roles never receive the same question, in parallel or in turn.
  Checking another role's conclusions is a question of its own: when a layer contract assigns such a check, each aspect it names is one question with one owner, and the checking role examines only that aspect of those conclusions.
  The coordinator reads only what it needs to choose the team and assign the parts (the request, the target repository's context documentation, the Plan's REQs, QGs and Implementation Record); the sources a part needs are read by the role that examines it.
  Each role reads only the sources that bear on its part: a part about which content a page shows does not need the page's styles, images or tests.
- When delegating, pass the role file, the role's row in the layer file's table (plus every row that row refers to for its completion condition), constraints, the settled direction and the part to examine; do not hide the solution and do not impose the conclusion.
  Copy into the assignment, verbatim, the REQs and QGs of the part and the excerpt of the Implementation Record or report that concerns them, with the source paths; do not pass the whole Plan file, and the role reads the Plan file only for a section the assignment names as missing.
  The coordinator identifies the snapshot once (the revision under review or the base revision, the command that shows the diff, and the changed paths) and copies it into every assignment; a role does not derive the snapshot again unless its part is the snapshot itself.
- Reading, for the coordinator and every role: each framework file and each fixed input (role file, layer contract section, Plan section) is read once per run and not again while it is unchanged; a link inside a file is followed only when the current step needs the section it points to, and then only that section, never recursively.
  A source is read in whole line ranges with one read per range the part needs; a search is used to locate a range, not to collect values one search at a time.
  Reads and searches that do not depend on each other's result are issued together in one step, as parallel tool calls when the host offers them, not one per step.
  Data files (measurements, logs, generated output) are read the same way: the ranges that hold the part's instances, read once.
- Self-perform (`mode: self`) only when the host has no mechanism to create agents in the session or the call to create an agent fails.
  The coordinator then takes on each role in turn in the layer's order and records the concrete reason in the record's `summary` and in the layer's output.
  Lack of delegation does not block the work.
- A role description does not prove an independent agent.
  To keep a role independent of drafts or existing conclusions of the same run (written by the coordinator or another role), leave them out of the assignment and state that the paths holding them must not be read, or place them outside the area the agent can read.
  Until that is ensured, record each role's actual level of independence in the output.
  Self-checking is recorded as self-checking; do not claim independent challenge or verification that did not happen.
- A reviewer outside the run's role team is consulted only where [AGENTS.md](../../AGENTS.md#ai-agent-roles) allows it, in an Implement run.
  There, a consultation is part of the role's actual level of independence, even when independence from drafts was ensured: the assignment asks the role to report every consultation, and the coordinator records each role that consulted one in the run's output.
  That opinion is not a source of evidence and does not replace the role's reasoning on the sources the router allows.

## Runtime Neutrality

The framework does not choose or require a provider, model, reasoning effort or host.
Do not infer from a missing tool or a skipped test that a runtime must be installed or a new operating system supported.
Only conditions needed for the assigned result can block that part.
A host without a mechanism to create agents does not block the work: the coordinator performs the roles and states the reason, per the [assignment principles](#assignment-principles).

## Verification by reasoning

This rule applies to the Plan → Implement → Review chain of development work.
Work in the chain covers implementing product source code (with accompanying documentation in the target repository), creating/updating the repository's context documentation, and writing, updating and running functional tests under the [FUT rule](#functional-tests-fut-rule) when a REQ/specification needs them.
Building, running the application/database/browser for acceptance, measuring performance or load, running tests outside FUT, building new harnesses or verification scripts, deploying and releasing belong to the user's build/test/release stage, outside the task lifecycle: that stage produces no evidence for the framework and hands no results back to the task.
Defects the user sees there are sent as an independent fix request, which is a new task.
The only exception is [layout verification with mocks](layout-verification.instructions.md) during an Implement run.

Verifying an implementation result is the agent's reasoning: read the diff and the source, trace the execution path from the entrypoint through callers, guards and write/read operations to the final state, check each `Required logic` of the QG, pick a counterexample or failure branch that could refute it, challenge competing explanations, then conclude `PASS|FAIL|BLOCKED` with sources.
Reading files, diffs, git history or searching gathers sources for the reasoning; it is not a verification run.
Test/build/run results, whether already in the repository, CI, an old report or from the test run under FUT, are not a baseline or PASS/FAIL evidence for a QG: a red test must be explained from the source, and a green test only proves the cases it ran.

Sources of evidence for a QG, for every role in all three layers:

- Allowed: file contents, diffs, git history, search results over the source and documentation; for UI QGs, also the screenshots and measurements of [layout verification with mocks](layout-verification.instructions.md) (bounding boxes, computed styles, scroll-area sizes of rendered elements in each state).
- Not evidence, whether run inside or outside the repository: scripts, harnesses or probes written to verify (bulk value comparisons, counting differing pixels between two images, computing on the reader's behalf); using a browser or runtime to force logic branches, emulate features, measure timing or check listener removal; builds, typechecks, lint and other static analysis tools; test results.
  Test results under FUT are stated next to the reasoning and do not become an evidence line of a QG.
- Calculations needed for the reasoning (ratios, unit conversions, formulas) are written with the formula and the input values taken from the source, so readers can check them themselves.

Per layer:

- Plan creates no task, step, REQ, QG or allowed path for work of the user's stage; tests are assigned only under FUT.
  If the specification has a goal in that stage, write one line saying it belongs to the user's build/test/release stage.
  Planning roles investigate by reading the source, documentation, git history and existing records; they do not build harnesses or measuring tools and do not run the application or a browser, unless the user asks for a root-cause investigation (paragraph below).
- Implement does not build, typecheck or lint and does not run the application for acceptance; it only writes, updates and runs tests under FUT, and when the diff changes the UI it verifies layout with mocks per the [layout verification instructions](layout-verification.instructions.md).
  Do not record work of the user's stage as `BLOCKED` or as remaining risk of the task; only list briefly what moves to that stage.
- Review does not build and does not create or run tests or mocks; it does not open a FIND/RISK/BLOCK because of missing tests, not having built/run, or red/green tests.
  Each conclusion is proven or refuted by reasoning on the source; tests in the diff that violate FUT are a defect to fix under the Review contract.
  For a diff that changes the UI, Review reads Implement's screenshots and layout verification summary per the [layout verification instructions](layout-verification.instructions.md).
- No layer asks the user for build/test/release results, measurements, screenshots or operational data for a task to be `implemented`, PASS or closed.
  Do not put them in `Authorization condition`, `Next allowed owner/layer`, a confirmation checkpoint, `awaiting_confirmation` or the task's open-items list; do not hold a task or report waiting for them.
  A task ends when its own QGs have been concluded by reasoning.
  Layout screenshots produced by the Implement run itself per the [layout verification instructions](layout-verification.instructions.md) are not data supplied by the user.

Commands the user requests run in every layer: when the user explicitly asks for a command or check, run exactly the requested part in that run and report the result separately; the result does not replace QG reasoning and does not extend to other commands.
A request to investigate the root cause of a bug/issue lets the role responsible for the investigation reproduce the defect in that run: run commands, related tests, the application or small test data at the boundary that causes the defect to tell hypotheses apart.
Stop once the cause has been distinguished; the reproduction result is diagnostic evidence, not a QG baseline, and does not entail running the whole system.

The Plan/report validator commands, the `layer_record.py` commands, the framework check commands after self-improvement and the `git status` sweep during cleanup are contractual handoff procedures; they still run as specified and are not product verification.
Instructions to run, measure or reproduce in a repository's documentation apply only when the user assigns that work directly (including as a standalone task) or asks for a root-cause investigation; instructions to write/run tests apply within the limits of FUT; instructions to capture layout apply per the layout verification with mocks section; outside those cases, use the same mechanism of reasoning on the source.

## Functional tests (FUT rule)

Applies to all writing, updating and running of tests, inside and outside the three layers.
Tests that are created or updated must be functional tests based on the REQ/specification.
If the user explicitly asks for something else, follow that request.

- Source: each test traces back to a REQ or specification item of the functionality under development, or of functionality affected by it.
  "Affected" must be grounded in the source: a call path, contract or shared data that the change touches; do not infer it from module names, the existence of a test or a wish to "be safe".
- Content: assert functional behavior observable at the functionality's contract (input → outcome/state, refusal/failure branches the specification names).
  Do not lock in implementation details, do not use the implementation's algorithm as the expected result, and do not assert things the specification does not require (wording, order, timing, format) in a way that blocks a correct result.
- Extent: only enough tests to tell right from wrong for the assigned behavior.
  Do not add combinations, edge cases, performance or platforms the specification does not require, do not test the same behavior twice, and do not spread to unrelated functionality.
  If an existing test already protects that behavior, update it instead of writing a new one.
- Updates: tests of affected functionality that still assert the old behavior are fixed to the new logic; tests that only served a removed flow are deleted.
- Running: run only the tests of the functionality under development and the affected functionality, selected by file, class or test name, with the command the target repository's context documentation gives.
  Never run tests of unrelated functionality or the whole suite/system, even when you believe the change has no impact.
  Compilation performed by that test command itself is part of the run, not a separate build.
- Results: a run only proves the cases that ran.
  A red test is explained from the source (wrong product or wrong test) before fixing the right side; in the Plan → Implement → Review chain, test results are not a QG baseline.

## Shared snapshots and older records

Applies to every layer when drawing conclusions about the source, the documentation or an older record (Implementation Record, report, record).
Separate three things: the current source, what the record states, and the changes between those two points in time.

- When the current source differs from what an older record states, that only proves the source changed after the record; it does not prove the record was wrong when written.
  Treat the record as wrong only when a time-stamped source (a capture, a diff, a commit, a measurement) shows the statement was wrong at the time it was written; otherwise record the mismatch as a change that happened after that record.
- A change in the snapshot that no Implementation Record of the package records (not in any task's `changed_paths`) is an unowned change.
  State it in the run's output with its path and its effect on the conclusions; do not attribute it to any task or role, and do not use it as grounds for a role's issue.
  The user assigns an Implement run or a standalone task to record it.
- When several tasks of a package share one snapshot (the same commit, or the same set of changes that cannot be separated by task), attribute a mismatch (a broken QG, a wrong documentation sentence, a value that does not match) to the task that made it wrong, in run order: rebuild the state after each task from the base revision, that task's REQs and its `changed_paths`.
  Something that was still right when a task completed and only became wrong after a change belonging to a later task's REQ is a mismatch of the later task, even when the earlier task wrote or synced it.
  Rewriting a whole file does not make a task own every sentence of the file after another task changes what the sentence describes.
  When the source, diffs and records are not enough to separate the order, record the conclusion as an inference with its basis.

Review applies these rules to conclude QGs and attribute issues to Implement roles per the [Inputs and permissions section](review.instructions.md#inputs-and-permissions); Implement applies the first rule when correcting an older record, per the [Recording results section](implement.instructions.md#recording-results).

## Self-evaluation and improvement

Each Plan, Implement or Review run (including repair runs and every Review round) self-evaluates before handoff, whether the result is PASS, FAIL or blocked, and improves the framework only for the issues that meet the [improvement threshold](self-evaluation.instructions.md#improvement-threshold).
Standalone tasks and framework maintenance do not apply this section.

Asking the user for a decision or for content is not a handoff: the run pauses and continues with the answers, and it self-evaluates once, after its output is settled, never at a pause.

### Timing and evaluator

- At the start of the run, the coordinator runs `python -B .agents/evals/layer_record.py start` and keeps the returned `framework_ref`: the Hub commit and the hashes of framework files that differ from that commit.
  When the Hub is installed inside a workspace, `framework_ref` holds the installed version from the Hub's `manifest.json` in place of a commit, and the hashes of framework files that differ from that version.
  This is the version of the rules the run applies.
- After the layer's output is settled and before cleanup, [`process-auditor`](../roles/process-auditor.role.md) evaluates the run: every role that took part and the coordinator itself (choosing the team, assigning work, merging results).
  At Review, `process-auditor` also re-evaluates the roles of the reviewed Implement run per the [Evaluations section](review.instructions.md#evaluations-assessing-implement-roles).
- Delegate `process-auditor` to a separate agent per the [assignment principles](#assignment-principles) and record `mode: agent`.
  Only when the host has no tool to create sub-agents or the call fails does the coordinator self-evaluate, record `mode: self` and state that reason in `summary`.

### Issues, improvements and the record

`process-auditor` classifies each issue by cause, applies the improvements and writes the run's record per the [self-evaluation instructions](self-evaluation.instructions.md), which it reads in full; the coordinator reads them only when it self-evaluates in `mode: self`.

Output issues (product source, Plan, report) are also returned to the owning role to fix within the run, under the layer's contract and limits (for example Implement's two-repair limit).
`process-auditor` only edits framework files.

### Reporting

The run's final response has a "Self-improvement" section: the `record_id`, then for each applied improvement the issue, cause, file and section edited, old → new version, and a summary of the change; or a single sentence "no issue meets the improvement threshold".
In `mode: self`, the `record_id` is the maintenance record that supersedes the self-evaluation record.
An improvement pending the user for reason `safety` is described in the "Self-improvement" section, and the decision about it is one point of "Needs confirmation" per the [Self-evaluation when `mode: self`](self-evaluation.instructions.md#self-evaluation-when-mode-self) section.
An improvement pending for reason `repository` is described in the "Self-improvement" section and offered as one point of "Proposals" ([CONTEXT.md](../../CONTEXT.md#5-closing-block-needs-confirmation-and-proposals)): the user assigns it as a standalone task in the target repository.

## Cleaning up temporary resources before handoff

This rule applies to every Plan, Implement and Review layer, standalone tasks and framework maintenance.
It does not change how work is routed.
The role/agent that creates temporary resources must clean them up itself; the coordinator is responsible for checking the whole run, including work delegated to sub-agents.
Do not push cleanup to a later layer or wait for the user to remind you.
PASS, FAIL, blocked or cancelled, everything no longer needed must be cleaned up before handing off the corresponding result.

- The mandatory cleanup scope is the Git-committable area of the Hub and of each target repository used: tracked files and untracked files not excluded by `.gitignore`.
  Paths ignored by Git (for example `.tmp/` at the Hub root, `node_modules/`, build directories) and locations outside the repository are not committed and are not part of the cleanup duty; they may be kept for a later run.
  The `.tmp/layout-snapshots/` directory of [layout verification with mocks](layout-verification.instructions.md) is handoff output and is always kept.
- When creating temporary files, directories or sessions in the committable area, keep their paths/owners in the working context; do not create extra manifests or cleanup logs just to track them.
  Run Python tools with `python -B` to avoid `__pycache__`.
- In that area, delete as soon as their purpose is served: probe scripts, input drafts, images, traces, logs, caches and the run's own temporary directories.
  Everywhere, close the browser/temporary processes the run started once they are no longer needed; do not stop pre-existing shared sessions or services that are output the user needs to keep using.
- Before deleting raw evidence, save the trigger, reproduction steps, runtime, measurements and conclusions needed into the official output under the applicable contract.
  Keep source, user inputs, Plans, reports and records.
  Keep raw files only when the user asks or when they are a defined handoff output; do not use possible reuse as an excuse to keep clutter.
  Do not leave required references pointing to temporary files about to be deleted, to paths ignored by Git or to locations outside the repository, because they do not go with commits.
  Plan packages with their Review reports and self-evaluation records are the exception: they are local by design, ignored by Git ([AGENTS.md](../../AGENTS.md#git)), and refer to each other by path or `record_id`.
- Verify ownership and the absolute path before deleting, using specific targets.
  Do not delete the whole TEMP, run a broad `git clean`, or treat every untracked file as clutter.
  For resources with an unclear owner, verify first; do not delete by mistake to reach a clean state.
  Sub-agents clean up their own part and report exactly what remains if they hit a real error; the coordinator takes it over and handles it in the same run.
- After the last verification command that can regenerate files, sweep `git status --short` of the Hub and each target repository used: every remaining change or untracked file must be handoff output or a pre-existing user change.
  Claim completion only after cleaning up and checking again.
  If a file is locked or permissions are genuinely missing, clean up what can be cleaned, report the path, cause, owner and the steps to resolve it; keep the cleanup duty open and report the product result separately, without pretending it is clean or changing the QGs.

## Finishing and confirmation

Finish after delivery and cleanup of temporary resources under the shared contract above; report separately the result, evidence and what is still missing for each part.
Keep the permissions already granted and do not ask for routine confirmation again.
Next work that belongs to another task/layer needs a corresponding instruction; do not start it just because a report proposes it.
