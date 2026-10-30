---
name: "Layout Verification Instructions"
description: "How an Implement run captures and checks layout with mocks when its diff changes what the user sees, and how Review reads that result; read only when the condition in the Implement contract holds."
applyTo: ".agents/instructions/layout-verification.instructions.md"
metadata:
  id: ".agents/instructions/layout-verification"
  kind: "instruction"
  version: "1.0.2"
  status: "active"
---

# Layout verification with mocks

Read this file only when the condition in the [Implement contract](implement.instructions.md#layout-verification-with-mocks) holds: an Implement run whose diff changes what the user sees, or a Review of such a run.
Who captures, when, and the condition itself stay in that contract.

- **What:** run the frontend in development mode and answer every API call with mocks right in the browser; no backend, database, build or typecheck.
  Drive to each state the diff creates or changes, including error branches and input validation errors, then capture each state in every UI language, at the desktop and mobile viewports that the target repository's context documentation ([AGENTS.md](../../AGENTS.md#target-repository)) specifies.
  If the documentation does not specify them, take the languages from the i18n configuration and the viewports from the repository's CSS breakpoints, and record the set of viewports/languages used.
  When the diff changes the size or number of elements in a row or frame of constrained width (navigation bar, toolbar, row of cards), add viewports on both sides of every breakpoint threshold that affects that row or frame (per the context documentation or the CSS), and measure in the browser the bounding boxes of the frame and of each child element: children stay inside the frame and do not overlap, compared with the same measurements in the state without the diff; screenshots at the main viewports are not enough to conclude that.
  Also check what screenshots cannot show: text in the right language, elements inside the viewport, no horizontal scrolling, focus and the Esc key when dialogs stack, the page scrolls after closing.
  This approach is for web UIs served by a dev server; for other UIs (extensions, native apps) the layout part is `BLOCKED` with an owner, without improvising a means.
  Tools, how to run a stable server and known environment obstacles belong in the tooling notes of the target repository's context documentation ([AGENTS.md](../../AGENTS.md#target-repository)), not in the framework.
- **State without the diff:** the post-diff capture of the preceding task in the same package, when that capture covered exactly the screens and viewports to compare.
  Otherwise, build and capture separately the source right before the task's changes: the base commit plus every uncommitted change that does not belong to the task (from other runs, recorded or not).
  If the working tree has no such uncommitted changes, export the base commit into the run's temporary directory (for example `git archive <revision>` into `.tmp/`); if it has them, exporting the commit is not enough, so copy the working tree intact (except `.git`) into a temporary directory before the task edits it, or export the base commit and reapply exactly those changes.
  Do not use stash, checkout or reset on the working repository ([safety rules](../../AGENTS.md#safety)).
  Record in `layout_verification` the base commit and the uncommitted changes counted in the base; the Plan does not describe how to build this base.
- **Where:** mock scripts, screenshots and the results table go in `.tmp/layout-snapshots/<plan-set>/<task-id>/<YYYYMMDD-HHmmss>/` at the Hub root (ignored by Git), whatever directory holds the Plan; the `pirl-implement` skill's helper script creates it.
  Each run gets a new directory; do not delete or overwrite earlier runs.
  This directory is handoff output and is kept; dev servers, browsers and temporary profiles are still stopped or deleted per the [cleanup section](layered-task-execution.instructions.md#cleaning-up-temporary-resources-before-handoff).
- **Role as evidence:** the screenshots and measurements of the checks in the What section are mandatory evidence for the layout part; they accompany, and do not replace, QG reasoning on the source.
  This run does not extend to builds, typechecks, tests outside FUT, a real backend, real devices or releases; those still belong to the user's stage.
  The verification role treats the screenshots as a source when concluding UI QGs and does not run anything itself.
  Each failed check is compared with the same scenario in the state without the diff (an unchanged screen or route); only defects caused by the diff are FAIL.
  A wrong layout caused by the diff (overflow, overlap, wrong language, missing state) is a FAIL returned to `frontend-developer`, under the same two-repair limit of Implement; pre-existing defects are recorded in the summary, do not block the task, and are reported to the user with a proposal, per the [sweep](implement.instructions.md#implementing-and-repairing-per-review) of the Implement contract.
  A failed check caused by the diff that the Plan excluded from scope with a REQ naming exactly that behavior and the viewport range, together with a known-gaps entry, is not a FAIL of the task but is still a failed check: `layout_verification` lists it with the REQ and its cause (the diff), and `residual_risk` states the impact; if the Plan did not exclude it, it is a FAIL.
  When no usable browser engine is available, the layout part is `BLOCKED` with an owner.
  A diff that changes the UI without this result cannot be recorded as `implemented`.
- **Differences outside the checks:** a difference between the base and the post-diff state where bounding boxes, computed styles and scroll areas are all unchanged (for example a few differing pixels, a page height that varies between loads) is not a wrong layout caused by the diff.
  Capture the base state repeatedly to learn its own variation, record every value seen in the summary, then stop.
  Looking for the cause of such a difference or of a pre-existing defect, and measuring a behavior the checks do not require (for example hiding an element and measuring again, forcing a viewport change while a state is open, building a separate probe script), is a root-cause investigation that runs only when the user asks for it ([Verification by reasoning](layered-task-execution.instructions.md#verification-by-reasoning)); missing handling visible from the source is recorded by reasoning on the source.
  Pixel counts and repeated base captures, if any, are recorded apart from the checks and marked as not QG evidence.
- **Record:** summarize in the `layout_verification` field of the Implementation Record: states captured, languages, viewports (including the threshold-adjacent viewports measured), the base used for comparison (commit and uncommitted changes counted), number of screenshots, checks passed/failed (each failed check with its cause: pre-existing, or caused by the diff and excluded by a Plan REQ) and the directory path.
  `.tmp/` does not go with commits, so the summary is the evidence and the path is for lookup only.
- **Review:** reads Implement's summary and screenshots and does not rerun them.
  A diff that changes the UI while the Record lacks this result, or screenshots showing a layout that violates a QG, is a `repair` FIND for `frontend-developer`.
