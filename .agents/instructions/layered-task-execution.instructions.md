---
name: "Layered Task Execution Instructions"
description: "Defines the boundaries between Plan, Implement, Review and other kinds of work, the roles and assignment principles, framework maintenance, and the shared contracts: verification by reasoning, functional tests, shared snapshots and older records, self-evaluation and improvement, temporary-resource cleanup."
applyTo: ".agents/instructions/**/*,.skills/**/*"
metadata:
  id: ".agents/instructions/layered-task-execution"
  kind: "instruction"
  version: "2.1.0"
  status: "active"
---

# Layered Task Execution Instructions

## Scope and sources of decisions

This contract routes work through the three layers Plan, Implement and Review
and holds their shared rules. The current request and the permissions the
user has granted decide the scope; AI Agent roles supply expertise and do not
add product goals or a new approval round on their own.

[AGENTS.md](../../AGENTS.md) owns the core rules, the structure, how the kind
of work is chosen, the role catalog with the delegation rules and how the target
repository is chosen; role files own each role's expertise; the router owns the
boundaries between kinds of work, the assignment principles and the shared
contracts; layer
contracts own the roles' responsibilities at the layer, the decisions and the
content of the output; each layer's skill in `.skills/` owns the run
procedure, the output format and the helper scripts.
Fix things where the decision is owned; do not copy a process into several files.

The current handoff schemas are `pirl-plan/v1` and `pirl-review/v1`. Other
schemas are not handoff inputs; do not create migrations or readers for old
schemas.

## Choosing a layer

The kind of work is chosen per [Choosing a layer](../../AGENTS.md#choosing-a-layer)
in `AGENTS.md`, which every host loads; this router holds the boundaries and
shared contracts that apply once the kind of work is chosen.

## Standalone tasks

A standalone task is work the user assigns directly that closes within that
same run, outside the Plan → Implement → Review chain: writing or updating
documentation on request, an investigation with durable output, a small fix
the user specifies. Carrying out a Plan task is still Implement, even with a
single role. A question that only needs an explanation and creates no durable
output is answered directly (step 3 of
[Choosing a layer](../../AGENTS.md#choosing-a-layer)).

No Review is scheduled, so the person doing the work closes the loop within the session:

1. Complete the delivery within exactly the scope the user assigned, under the
   core rules.
2. Self-verify: check the output against the request and the authoritative
   sources, and pick a counterexample that could refute the most important
   claim; fix wrong output before reporting. Record it as self-verification,
   not an independent review.
3. Report separately the delivery result, how it was verified and what remains
   unknown. Do not create a Plan or report unless the user asks. Standalone
   tasks write no self-evaluation record; only the three layers write one, per
   the [Self-evaluation and improvement section](#self-evaluation-and-improvement).
4. Clean up temporary resources per the [cleanup section](#cleaning-up-temporary-resources-before-handoff).

If the user later asks for a Review, the Review evaluates as usual;
self-verification does not replace the Review's conclusions.

### Verifying standalone work

Applies to standalone tasks and to work done directly without a layer; the
three layers verify per the
[Verification by reasoning section](#verification-by-reasoning).

- Choose the narrowest verification that answers the open question: static
  (types, lint, syntax, metadata), unit (pure functions, services, domain
  rules), component (UI behavior and accessibility), integration (API,
  authentication, storage, multi-tier flows) or manual (visual layout, real
  browser, multi-step flows per viewport). Widen only when an affected contract
  or a concrete failure mechanism requires it; a file name or the existence of
  a test does not create that need. Tests written or run follow the
  [FUT rule](#functional-tests-fut-rule).
- A passing command only proves the cases that ran, not invariant coverage,
  adjacent integration paths, edge behavior or the reliability of the skipped
  part. A case skipped because of the platform only proves that case does not
  run in this environment; it does not prove the product needs another
  platform. Infer environment requirements from the user's task and the
  repository's actually supported behavior.
- Report each verification with the command, its purpose, the working
  directory, pass/fail/blocker, a summary of the key output and the remaining
  risk.

## Framework maintenance

A request to edit `AGENTS.md`, `CONTEXT.md`, instructions, roles, skills or
the tools in `.agents/evals/` and `.tools/` directly is framework maintenance within the scope the user assigns. Do not force a product Plan or
report before editing. Improvements that `process-auditor` applies during a
layer run under the
[Self-evaluation and improvement section](#self-evaluation-and-improvement) are
also framework maintenance, allowed by that section without a separate request.

- Start from the wrong or missing decision, then identify the owning file:
  `AGENTS.md` for the core rules, structure, roles and the target repository;
  `CONTEXT.md` for how responses to the user are presented; the router for
  layer boundaries and shared contracts; the layer contract for the roles'
  responsibilities, decisions and exit conditions; the layer's skill for the
  run procedure, the output format and the helper scripts. Read the files that
  reference the rule before changing it, so that other files do not restore the
  old behavior.
- Write rules in the framework's general form, reusable for every repository,
  host and situation of the same kind: conditions are stated by kind of
  situation, actions by role and output, not by one event that happened. The
  content of `AGENTS.md`, `CONTEXT.md`, instructions, role files, rules and tools
  contains no details specific to one run or one project as a condition or
  basis: repository or product names, paths inside a product repository,
  specific tokens or values, task or record IDs, dates, quotes from the user,
  names of a specific host or tool. Illustrative examples, when needed, are
  marked as examples and do not become conditions. Knowledge specific to one
  repository lives in that repository's own context documentation; the
  decisions and evidence of a run live in Plans, Implementation Records,
  reports and records.
- Fix with conditions and actions that are concrete enough; replace the wrong
  passage instead of piling on reminders. Re-read against three scenarios: the
  scenario that caused the problem, a similar scenario where the rule must not
  apply, and a scenario of the same kind in another repository or host; the
  rule must apply to the third scenario without changes. Do not add tests,
  validators or schemas in place of improving the content, and do not create
  tests or validators that grade wording by headings, keywords, counts or
  format.
- After editing, run the matching commands in the
  [Framework checks](#framework-checks) section below.
  The checks only confirm structure; they do not prove the quality of the wording.

### Framework checks

Pick the checks that match the change. They only validate handoff inputs and
outputs and do not grade the wording; instruction content is re-read against
the scenario that caused the problem.

```powershell
python -B .agents/evals/validate_layer_artifact.py --kind <plan|review> --path <file or directory>
python -B .agents/evals/layer_record.py <start|append|check|query> ...
python -B -m unittest discover -s .agents/evals/tests -p "test_*.py"
```

The first command checks Plan/Review files (schema, required fields, roles,
dependencies, time zone) and runs when they are handed off. The second writes
and checks self-evaluation records as the router describes; `check` runs after
each write or when the tool itself is edited. The last command runs the tests
of the two tools above, of the role catalog, of the skills (structure, helper
scripts) and of the links between framework files; run it when editing the
tools, the role catalog, a layer's role table, a role file, a skill or the
headings that other framework files link to.

## AI Agent roles and assignment

The role catalog and the delegation rules live in
[AGENTS.md](#assignment-principles); this section holds the rest.

### Constraints that keep roles separate from skills

Constraints that keep roles separate from skills:

- Closed catalog: only the IDs in this table. Adding, merging or removing a role
  means editing this table together with the role file, the layer file tables
  and the framework checks, in one change.
- Layers pick roles themselves following the layer file's guidance: Plan and
  Review by the "Select when" column; the Implement team for implementation and
  verification is chosen by the Plan. The user does not need to name roles, but
  when they do, keep exactly that list.
- A role file contains only shared expertise: the questions the role answers,
  how it works, warning signs, boundaries with other roles. It does not contain
  a layer's sequence, output templates, commands or completion conditions; those
  belong to the layer contract and the layer's skill.
- Roles have no artifacts, tools, skills or evaluation mechanism of their own;
  a role is evaluated through the layer's record.
- Knowledge specific to one repository lives in that repository's context
  documentation, not in role files or skills. Roles do not rely on a host's
  skill mechanism or custom agent configuration: the layer skills are plain
  files the coordinator reads and passes on.

### Assignment principles

For all three layers, together with the delegation rules in AGENTS.md:

- The coordinator (the Agent receiving the request from the user) is
  responsible for the final result: it assigns work and merges results by
  evidence, not by how many roles agree.
- Roles that do not need each other's results run in parallel; a role that
  needs another role's result runs after that role (`process-auditor` runs after
  the layer's output is settled). The coordinator does not do the delegated
  work itself.
- When delegating, pass the role file, the role's row in the layer file's table
  (plus every row that row refers to for its completion condition), sources,
  constraints, the settled direction and the part to examine; do not hide the
  solution and do not impose the conclusion.
- Self-perform (`mode: self`) only when the host has no mechanism to create
  agents in the session or the call to create an agent fails. The coordinator
  then takes on each role in turn in the layer's order and records the concrete
  reason in the record's `summary` and in the layer's output. Lack of
  delegation does not block the work.
- A role description does not prove an independent agent. To keep a role
  independent of drafts or existing conclusions of the same run (written by the
  coordinator or another role), leave them out of the assignment and state that
  the paths holding them must not be read, or place them outside the area the
  agent can read. Until that is ensured, record each role's actual level of
  independence in the output. Self-checking is recorded as self-checking; do
  not claim independent challenge or verification that did not happen.
- A reviewer outside the run's role team (another host tool or agent, not in
  the role catalog) that a role consulted while working is part of that role's
  actual level of independence, even when independence from drafts was
  ensured. The assignment asks the role to report every consultation; the
  coordinator records each role that consulted one in the run's output. That
  opinion is not a source of evidence and does not replace the role's reasoning
  on the sources the router allows.

## Runtime Neutrality

The framework does not choose or require a provider, model, reasoning effort or
host. Do not infer from a missing tool or a skipped test that a runtime must be
installed or a new operating system supported. Only conditions needed for the
assigned result can block that part. A host without a mechanism to create
agents does not block the work: the coordinator performs the roles and states
the reason, per the
[assignment principles](#assignment-principles).

## Verification by reasoning

This rule applies to the Plan → Implement → Review chain of development work.
Work in the chain covers implementing product source code (with accompanying
documentation in the target repository), creating/updating the repository's
context documentation, and writing, updating and running functional tests under
the [FUT rule](#functional-tests-fut-rule) when a REQ/specification needs them. Building, running the application/
database/browser for acceptance, measuring performance or load, running tests
outside FUT, building new harnesses or verification scripts, deploying and
releasing belong to the user's build/test/release stage, outside the task
lifecycle: that stage produces no evidence for the framework and hands no
results back to the task. Defects the user sees there are sent as an
independent fix request, which is a new task. The only exception is
[layout verification with mocks](implement.instructions.md#layout-verification-with-mocks) during an
Implement run.

Verifying an implementation result is the agent's reasoning: read the diff
and the source, trace the execution path from the entrypoint through callers,
guards and write/read operations to the final state, check each `Required logic`
of the QG, pick a counterexample or failure branch that could refute it,
challenge competing explanations, then conclude `PASS|FAIL|BLOCKED` with
sources. Reading files, diffs, git history or searching gathers sources for
the reasoning; it is not a verification run. Test/build/run results, whether
already in the repository, CI, an old report or from the test run under FUT,
are not a baseline or PASS/FAIL evidence for a QG: a red test must be explained
from the source, and a green test only proves the cases it ran.

Sources of evidence for a QG, for every role in all three layers:

- Allowed: file contents, diffs, git history, search results over the source
  and documentation; for UI QGs, also the screenshots and measurements of
  [layout verification with mocks](implement.instructions.md#layout-verification-with-mocks) (bounding
  boxes, computed styles, scroll-area sizes of rendered elements in each state).
- Not evidence, whether run inside or outside the repository: scripts,
  harnesses or probes written to verify (bulk value comparisons, counting
  differing pixels between two images, computing on the reader's behalf); using
  a browser or runtime to force logic branches, emulate features, measure
  timing or check listener removal; builds, typechecks, lint and other static
  analysis tools; test results. Test results under FUT are stated next to the
  reasoning and do not become an evidence line of a QG.
- Calculations needed for the reasoning (ratios, unit conversions, formulas)
  are written with the formula and the input values taken from the source, so
  readers can check them themselves.

Per layer:

- Plan creates no task, step, REQ, QG or allowed path for work of the user's
  stage; tests are assigned only under FUT. If the specification has a goal in
  that stage, write one line saying it belongs to the user's build/test/release
  stage. Planning roles investigate by reading the source, documentation, git
  history and existing records; they do not build harnesses or measuring tools
  and do not run the application or a browser, unless the user asks for a
  root-cause investigation (paragraph below).
- Implement does not build, typecheck or lint and does not run the application
  for acceptance; it only writes, updates and runs tests under FUT, and when the
  diff changes the UI it verifies layout with mocks per the [layout verification section](implement.instructions.md#layout-verification-with-mocks). Do not record
  work of the user's stage as `BLOCKED` or as remaining risk of the task; only
  list briefly what moves to that stage.
- Review does not build and does not create or run tests or mocks; it does not
  open a FIND/RISK/BLOCK because of missing tests, not having built/run, or
  red/green tests. Each conclusion is proven or refuted by reasoning on the
  source; tests in the diff that violate FUT are a defect to fix under the
  Review contract. For a diff that changes the UI, Review reads Implement's
  screenshots and layout verification summary per the [layout verification section](implement.instructions.md#layout-verification-with-mocks).
- No layer asks the user for build/test/release results, measurements,
  screenshots or operational data for a task to be `implemented`, PASS or
  closed. Do not put them in `Authorization condition`, `Next allowed owner/layer`,
  a confirmation checkpoint, `awaiting_confirmation` or the task's open-items
  list; do not hold a task or report waiting for them. A task ends when its own
  QGs have been concluded by reasoning. Layout screenshots produced by the
  Implement run itself per the [layout verification section](implement.instructions.md#layout-verification-with-mocks) are not data supplied by the user.

Commands the user requests run in every layer: when the user explicitly asks
for a command or check, run exactly the requested part in that run and report
the result separately; the result does not replace QG reasoning and does not
extend to other commands. A request to investigate the root cause of a bug/issue
lets the role responsible for the investigation reproduce the defect in that
run: run commands, related tests, the application or small test data at the
boundary that causes the defect to tell hypotheses apart. Stop once the cause
has been distinguished; the reproduction result is diagnostic evidence, not a
QG baseline, and does not entail running the whole system.

The Plan/report validator commands, the `layer_record.py` commands, the
framework check commands after self-improvement and the `git status` sweep
during cleanup are contractual handoff procedures; they still run as
specified and are not product verification. Instructions to run, measure or
reproduce in a repository's documentation apply only when the user assigns
that work directly (including as a standalone task) or asks for a root-cause
investigation; instructions to write/run tests apply within the limits of FUT;
instructions to capture layout apply per the layout verification with mocks
section; outside those cases, use the same mechanism of reasoning on the source.

## Functional tests (FUT rule)

Applies to all writing, updating and running of tests, inside and outside the
three layers. Tests that are created or updated must be functional tests based
on the REQ/specification. If the user explicitly asks for something else,
follow that request.

- Source: each test traces back to a REQ or specification item of the
  functionality under development, or of functionality affected by it.
  "Affected" must be grounded in the source: a call path, contract or shared
  data that the change touches; do not infer it from module names, the
  existence of a test or a wish to "be safe".
- Content: assert functional behavior observable at the functionality's
  contract (input → outcome/state, refusal/failure branches the specification
  names). Do not lock in implementation details, do not use the
  implementation's algorithm as the expected result, and do not assert things
  the specification does not require (wording, order, timing, format) in a way
  that blocks a correct result.
- Extent: only enough tests to tell right from wrong for the assigned behavior.
  Do not add combinations, edge cases, performance or platforms the
  specification does not require, do not test the same behavior twice, and do
  not spread to unrelated functionality. If an existing test already protects
  that behavior, update it instead of writing a new one.
- Updates: tests of affected functionality that still assert the old behavior
  are fixed to the new logic; tests that only served a removed flow are deleted.
- Running: run only the tests of the functionality under development and the
  affected functionality, selected by file, class or test name, with the
  command the target repository's context documentation gives. Never run tests
  of unrelated functionality or the whole suite/system, even when you believe
  the change has no impact. Compilation performed by that test command itself
  is part of the run, not a separate build.
- Results: a run only proves the cases that ran. A red test is explained from
  the source (wrong product or wrong test) before fixing the right side; in the
  Plan → Implement → Review chain, test results are not a QG baseline.

## Shared snapshots and older records

Applies to every layer when drawing conclusions about the source, the
documentation or an older record (Implementation Record, report, record).
Separate three things: the current source, what the record states, and the
changes between those two points in time.

- When the current source differs from what an older record states, that only
  proves the source changed after the record; it does not prove the record was
  wrong when written. Treat the record as wrong only when a time-stamped source
  (a capture, a diff, a commit, a measurement) shows the statement was wrong at
  the time it was written; otherwise record the mismatch as a change that
  happened after that record.
- A change in the snapshot that no Implementation Record of the package
  records (not in any task's `changed_paths`) is an unowned change. State it in
  the run's output with its path and its effect on the conclusions; do not
  attribute it to any task or role, and do not use it as grounds for a role's
  issue. The user assigns an Implement run or a standalone task to record it.
- When several tasks of a package share one snapshot (the same commit, or the
  same set of changes that cannot be separated by task), attribute a mismatch
  (a broken QG, a wrong documentation sentence, a value that does not match) to
  the task that made it wrong, in run order: rebuild the state after each task
  from the base revision, that task's REQs and its `changed_paths`. Something
  that was still right when a task completed and only became wrong after a
  change belonging to a later task's REQ is a mismatch of the later task, even
  when the earlier task wrote or synced it. Rewriting a whole file does not make
  a task own every sentence of the file after another task changes what the
  sentence describes. When the source, diffs and records are not enough to
  separate the order, record the conclusion as an inference with its basis.

Review applies these rules to conclude QGs and attribute issues to Implement
roles per the [Inputs and permissions section](review.instructions.md#inputs-and-permissions);
Implement applies the first rule when correcting an older record, per the
[Recording results section](implement.instructions.md#recording-results).

## Self-evaluation and improvement

Each Plan, Implement or Review run (including repair runs and every Review
round) self-evaluates and improves the framework before handoff, whether the
result is PASS, FAIL or blocked. Standalone tasks and framework maintenance do
not apply this section.

### Timing and evaluator

- At the start of the run, the coordinator runs
  `python -B .agents/evals/layer_record.py start` and keeps the returned
  `framework_ref`: the Hub commit and the hashes of framework files that differ
  from that commit. This is the version of the rules the run applies.
- After the layer's output is settled and before cleanup,
  [`process-auditor`](../roles/process-auditor.role.md) evaluates the run:
  every role that took part and the coordinator itself (choosing the team,
  assigning work, merging results). At Review, `process-auditor` also
  re-evaluates the roles of the reviewed Implement run per the
  [Evaluations section](review.instructions.md#evaluations-assessing-implement-roles).
- Delegate `process-auditor` to a separate agent per the
  [assignment principles](#assignment-principles) and record
  `mode: agent`. Only when the host has no tool to create sub-agents or the call
  fails does the coordinator self-evaluate, record `mode: self` and state that
  reason in `summary`.

### Issues and causes

An issue is a decision or output that is wrong against the request, the
source, a contract or a rule, with evidence. Each issue records the role (or
`coordinator`), the wrong decision, the related rule as `file#section`, the
evidence and an `issue_key`: a kebab-case key describing the issue; an issue
already present in an earlier record keeps its existing key.

Before classifying, look up earlier records with `layer_record.py query --issue-key <key>`
and `layer_record.py query --rule <file#section>`. Classify by evidence, not
by how many times it repeated:

| Cause | When | Required improvement |
| --- | --- | --- |
| `instruction` | Reading the rules at exactly `framework_ref`: no rule covers this case, a rule leads to the wrong decision, two rules conflict, or a rule is ambiguous | Fix the rule |
| `ineffective_fix` | An earlier record fixed an issue with the same key or the same rule, and the issue still happens | Determine why that fix failed (wrong cause, does not cover this case, the role does not load the rule), then replace or revert that fix itself, without stacking another. Record `prior_fix` |
| `input` | The rule is right but the input is missing or wrong: the Plan lacks a decision, the target repository's context documentation is incomplete or wrong | Fix where the input is produced: the rule of the layer or skill that produces it. A gap in the target repository's context documentation lies outside the framework: record that improvement `pending_user` with reason `repository` and propose it to the user as a standalone task in that repository |
| `execution` | The rule is clear, was loaded and leads to the right decision, but the role did not follow it | Increase enforcement: put that point in the role's "Done when" column in the layer file's table, or assign a verification role to check exactly that point |

Output issues (product source, Plan, report) are also returned to the owning
role to fix within the run, under the layer's contract and limits (for example
Implement's two-repair limit). `process-auditor` only edits framework files.

### Thorough improvement

Applies in `mode: agent`, and in `mode: self` per the
[Self-evaluation when `mode: self`](#self-evaluation-when-mode-self) section.
Every issue must have an improvement applied within the run. There are no
off-limits areas and no waiting for proposals:

1. Fix every place that owns the cause: layer files, skills, role files,
   `AGENTS.md`, the router, framework tools with their tests. The only
   improvement not applied this way is one in a target repository's context
   documentation, handled per the `input` row above.
2. Sweep the whole framework for places still describing the old behavior and
   fix them in the same run.
3. Replace the wrong passage with concrete conditions and actions; do not pile
   on reminders, and write it in the general form described in the
   [Framework maintenance section](#framework-maintenance).
4. Bump the `version` of files that have one.
5. Re-read the edited part against the three scenarios of the
   [Framework maintenance section](#framework-maintenance).
6. Run the commands in [Framework checks](#framework-checks)
   that match what was edited.

Mandatory exception: never loosen the
[safety rules](../../AGENTS.md#safety-rules-and-self-improvement).
An improvement that would loosen a safety rule is not applied: record
`pending_user` with reason `safety` and ask the user.

### Self-evaluation when `mode: self`

The self-evaluation itself does not edit framework files: every improvement in
its record is recorded as `pending_user` with reason `mode_self`, and the tool
rejects `applied` in `mode: self`. Improvements that touch no safety rule do not
need the user's confirmation ([AGENTS.md](../../AGENTS.md#workflow)), so within
the same run the coordinator applies each improvement that touches no safety
rule as user-directed framework maintenance, following the six steps of the
[Thorough improvement](#thorough-improvement) section. It then writes a new
record whose `supersedes` points to the self-evaluation record, with empty
`issues` and `fixes`, and a `summary` stating each `issue_key`, the file and
section edited, old → new version, the check commands run and a reference to
the authorization in `AGENTS.md`. The final response reports this in the
"Self-improvement" section, without asking.

An improvement that touches a safety rule (loosening, narrowing, removing or
working around it) is not applied: the record states `pending_user` with reason
`safety`; the final response states the issue, cause, rule, the concrete change
and the evidence of that improvement in the "Self-improvement" section, and the
user's decision (apply, skip, or re-evaluate with a separate agent) is one point
in "Needs confirmation"
([CONTEXT.md](../../CONTEXT.md#5-closing-block-needs-confirmation-and-proposals));
no other separate section is opened for that decision. The run that carries out
that choice writes a new record whose `supersedes` points to the old record.

### Record

Each run writes exactly one record with
`python -B .agents/evals/layer_record.py append --input <JSON file>`
(or by passing JSON on stdin). On Windows, use `--input` with a UTF-8 file so
non-ASCII text is not corrupted. The tool adds `schema`, `record_id`,
`recorded_at` and rejects malformed records; if the record is rejected, the run
is not complete. Do not edit the JSONL files by hand; correct a record with a
new record that has `supersedes`. Records are handoff output, stored at
`.agents/evals/records/<layer>/<YYYY-MM-DD>.jsonl`. That directory is ignored
by Git because records describe the user's projects: they stay on the local
machine and are never committed, and the tool still reads them for `query` and
`check`.

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

Every issue must belong to at least one improvement.

### Reporting

The run's final response has a "Self-improvement" section: the `record_id`,
then for each applied improvement the issue, cause, file and section edited,
old → new version, and a summary of the change; or a single sentence "no issues
found". In `mode: self`, the `record_id` is the maintenance record that
supersedes the self-evaluation record. An improvement pending the user for
reason `safety` is described in the "Self-improvement" section, and the decision
about it is one point of "Needs confirmation" per the
[Self-evaluation when `mode: self`](#self-evaluation-when-mode-self) section.
An improvement pending for reason `repository` is described in the
"Self-improvement" section and offered as one point of "Proposals"
([CONTEXT.md](../../CONTEXT.md#5-closing-block-needs-confirmation-and-proposals)):
the user assigns it as a standalone task in the target repository.

## Cleaning up temporary resources before handoff

This rule applies to every Plan, Implement and Review layer, standalone tasks
and framework maintenance. It does not change how work is routed. The
role/agent that creates temporary resources must clean them up itself; the
coordinator is responsible for checking the whole run, including work
delegated to sub-agents. Do not push cleanup to a later layer or wait for the
user to remind you. PASS, FAIL, blocked or cancelled, everything no longer
needed must be cleaned up before handing off the corresponding result.

- The mandatory cleanup scope is the Git-committable area of the Hub and of
  each target repository used: tracked files and untracked files not excluded
  by `.gitignore`. Paths ignored by Git (for example `.tmp/` at the Hub root,
  `node_modules/`, build directories) and locations outside the repository are
  not committed and are not part of the cleanup duty; they may be kept for a
  later run. The `.tmp/layout-snapshots/` directory of
  [layout verification with mocks](implement.instructions.md#layout-verification-with-mocks) is handoff
  output and is always kept.
- When creating temporary files, directories or sessions in the committable
  area, keep their paths/owners in the working context; do not create extra
  manifests or cleanup logs just to track them. Run Python tools with
  `python -B` to avoid `__pycache__`.
- In that area, delete as soon as their purpose is served: probe scripts, input
  drafts, images, traces, logs, caches and the run's own temporary directories.
  Everywhere, close the browser/temporary processes the run started once they
  are no longer needed; do not stop pre-existing shared sessions or services
  that are output the user needs to keep using.
- Before deleting raw evidence, save the trigger, reproduction steps, runtime,
  measurements and conclusions needed into the official output under the
  applicable contract. Keep source, user inputs, Plans, reports and records.
  Keep raw files only when the user asks or when they are a defined handoff
  output; do not use possible reuse as an excuse to keep clutter. Do not leave
  required references pointing to temporary files about to be deleted, to paths
  ignored by Git or to locations outside the repository, because they do not go
  with commits. Plan packages with their Review reports and self-evaluation
  records are the exception: they are local by design, ignored by Git
  ([AGENTS.md](../../AGENTS.md#git)), and refer to each other by path or
  `record_id`.
- Verify ownership and the absolute path before deleting, using specific
  targets. Do not delete the whole TEMP, run a broad `git clean`, or treat every
  untracked file as clutter. For resources with an unclear owner, verify first;
  do not delete by mistake to reach a clean state. Sub-agents clean up their
  own part and report exactly what remains if they hit a real error; the
  coordinator takes it over and handles it in the same run.
- After the last verification command that can regenerate files, sweep
  `git status --short` of the Hub and each target repository used: every remaining change
  or untracked file must be handoff output or a pre-existing user change.
  Claim completion only after cleaning up and checking again. If a file is
  locked or permissions are genuinely missing, clean up what can be cleaned,
  report the path, cause, owner and the steps to resolve it; keep the cleanup
  duty open and report the product result separately, without pretending it is
  clean or changing the QGs.

## Finishing and confirmation

Finish after delivery and cleanup of temporary resources under the shared
contract above; report separately the result, evidence and what is still
missing for each part. Keep the permissions already granted and do not ask for
routine confirmation again. Next work that belongs to another task/layer needs
a corresponding instruction; do not start it just because a report proposes it.
