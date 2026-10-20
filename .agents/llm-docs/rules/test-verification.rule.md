---
id: .agents/llm-docs/rules/test-verification
kind: rule
version: 6.1.0
status: active
---

# Test And Verification Rules

The processes of the three layers belong only to
[Plan](../../instructions/plan.instructions.md),
[Implement](../../instructions/implement.instructions.md) and
[Review](../../instructions/review.instructions.md).
The FUT rule section applies to all writing, updating and running of tests,
inside and outside the three layers. The remaining sections apply only to work
outside the three layers.

## FUT rule (functional tests)

Tests that are created or updated must be functional tests based on the
REQ/specification. If the user explicitly asks for something else, follow that
request.

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
  affected functionality, selected by file, class or test name. Never run tests
  of unrelated functionality or the whole suite/system, even when you believe
  the change has no impact. Compilation performed by that test command itself
  is part of the run, not a separate build.
- Results: a run only proves the cases that ran. A red test is explained from
  the source (wrong product or wrong test) before fixing the right side; in the
  Plan → Implement → Review chain, test results are not a QG baseline.

## Verification Levels

For work outside the three layers.

| Level | Use When | Examples |
|---|---|---|
| Static | Types, lint, syntax, metadata | compiler, linter, type checker |
| Unit | Pure functions, services, domain rules | tests of one function or service |
| Component | UI behavior and accessibility | component tests |
| Integration | API, authentication, storage, multi-tier flows | API tests, tests with test storage |
| Manual | Visual layout, real browser, multi-step flows | checks per viewport |

## Selection Rule

Choose the narrowest verification that answers the open question. Widen only
when an affected contract or a concrete failure mechanism requires it; a file
name or the existence of a test does not create that need.

For instruction content, read the rule against the scenario that caused the
problem and a similar scenario where it must not apply, and check the owner and
conflicting instructions. Do not create tests or validators that grade wording
by headings, keywords, counts or format. Respect a task's request to exclude new
tests/validators.

A case skipped because of the platform only proves that case does not run in
this environment; it does not prove the product needs another platform. Infer
environment requirements from the user's task and the repository's actually
supported behavior.

A passing command only proves the cases that ran, not invariant coverage,
adjacent integration paths, edge behavior or the reliability of the skipped part.

## Reporting

Record:

- the command;
- the purpose;
- the working directory;
- pass/fail/blocker;
- a summary of the key output;
- remaining risk.
