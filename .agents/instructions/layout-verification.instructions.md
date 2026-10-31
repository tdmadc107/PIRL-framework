---
name: "Layout Verification Instructions"
description: "How an Implement run captures and checks layout with mocks when its diff changes what the user sees: the browser tools, the closed capture set, the evidence, and how Review reads the result; read only when the condition in the Implement contract holds."
applyTo: ".agents/instructions/layout-verification.instructions.md"
metadata:
  id: ".agents/instructions/layout-verification"
  kind: "instruction"
  version: "1.1.3"
  status: "active"
---

# Layout verification with mocks

Read this file only when the condition in the [Implement contract](implement.instructions.md#layout-verification-with-mocks) holds: an Implement run whose diff changes what the user sees, or a Review of such a run.
Who captures, when, and the condition itself stay in that contract.

- **What:** run the frontend in development mode and answer every API call with mocks right in the browser; no backend, database, build or typecheck.
  Drive to each state the diff creates or changes, then capture and measure it inside the capture set below, and nothing outside it.
  Also check what screenshots cannot show: text in the right language, elements inside the viewport, no horizontal scrolling, focus and the Esc key when dialogs stack, the page scrolls after closing.
  This approach is for web UIs served by a dev server; for other UIs (extensions, native apps) the layout part is `BLOCKED` with an owner, without improvising a means.
  How to run a stable server and known environment obstacles belong in the tooling notes of the target repository's context documentation ([AGENTS.md](../../AGENTS.md#target-repository)), not in the framework.
- **Browser tools:** the page is opened, resized, mocked, measured and photographed through the browser-automation tools that the host exposes as tool calls by an MCP server (for example Playwright MCP): set the viewport, install the mocks, evaluate the measurements in the page and save the screenshots into the run directory with those tool calls.
  Do not write capture scripts, runners or harnesses (for example a program that launches a browser and loops over states and viewports), inside or outside the repository; mock data files under `.tmp/` are allowed.
  Code passed to a tool that runs code is the same thing: it may carry one step, never a loop over states, viewports, patterns or languages.
  The installer registers such a server in the project-level MCP file of each installed host that has one, unless the installation opted out ([Framework structure](standalone-and-maintenance.instructions.md#framework-structure)); the host loads it when a session starts and may ask the user to approve it, so a session opened before that has no such tools.
  When the host exposes no such tools, the layout part is `BLOCKED` with the user as owner, who enables the tools in the host (the approval or a restart of the session, for a registered server); do not substitute a script.
- **Capture set:** exactly the combinations of the three lists below, for each state the diff creates or changes, once with the diff and once without it; nothing else is captured, whatever the reason, including "to be safe".
  A capture outside the set is a defect of the run, not extra assurance.
  - **Patterns:** at most two kinds of mock data.
    `normal`: every field of every shown element filled with ordinary values, every part of the screen present.
    `abnormal`: only the abnormal conditions that a REQ or QG of the Plan, or the specification, names (for example an empty list, an error, a locked state, the longest or largest value the specification allows), each capture naming the item it traces to.
    A row, value, state, role or data variant that no REQ, QG or specification item names is not a pattern.
    A pattern that the person capturing considers missing is reported to the user as a proposal per the [sweep](implement.instructions.md#implementing-and-repairing-per-review) and is not captured.
  - **Viewports:** first check whether the target repository's context documentation defines the responsive sizes (devices or viewports) to capture.
    If it does, capture exactly those sizes.
    If it does not, capture exactly these three default sizes: desktop 1920×1080, tablet 768×1024, mobile 390×844.
    Do not derive sizes from the CSS breakpoints, do not add sizes on both sides of a breakpoint, and do not cross sizes with conditions of your own choosing (for example text size, zoom, theme, role, plan type).
    A display condition that the user's request or a REQ or QG of the Plan names (for example enlarged text) is captured only in the combination that item names.
  - **Languages:** every UI language that the context documentation or the i18n configuration lists.
  The number of captures is therefore at most 2 patterns × the viewports × the languages, for each state and for each side (with and without the diff).
  One screenshot per capture; the bounding boxes, computed styles and scroll areas are measured in the same capture by evaluating in the page, not by extra screenshots.
- **Measurements:** when the diff changes the size or number of elements in a row or frame of constrained width, measure in the browser the bounding boxes of the frame and of each child element in every captured viewport: children stay inside the frame and do not overlap, compared with the same measurements in the state without the diff; screenshots are not enough to conclude that.
  A width threshold between the captured sizes is not captured at sizes around it: the verification role derives it from the CSS with the inputs written out, per the [router](layered-task-execution.instructions.md#verification-by-reasoning), and compares each measured box with that value.
- **State without the diff:** the post-diff capture of the preceding task in the same package, when that capture covered exactly the screens and viewports to compare.
  Otherwise, build and capture separately the source right before the task's changes: the base commit plus every uncommitted change that does not belong to the task (from other runs, recorded or not).
  If the working tree has no such uncommitted changes, export the base commit into the run's temporary directory (for example `git archive <revision>` into `.tmp/`); if it has them, exporting the commit is not enough, so copy the working tree intact (except `.git`) into a temporary directory before the task edits it, or export the base commit and reapply exactly those changes.
  Do not use stash, checkout or reset on the working repository ([safety rules](../../AGENTS.md#safety)).
  Record in `layout_verification` the base commit and the uncommitted changes counted in the base; the Plan does not describe how to build this base.
- **Where:** mock data, screenshots and the results table go in `.tmp/layout-snapshots/<plan-set>/<task-id>/<YYYYMMDD-HHmmss>/` at the Hub root (ignored by Git), whatever directory holds the Plan; the `pirl-implement` skill's helper script creates it.
  Each run gets a new directory; do not delete or overwrite earlier runs.
  A repeat capture after a repair covers only the captures the repair can change, and the record names the earlier run that holds the evidence of the others.
  This directory is handoff output and is kept; dev servers and browser sessions the run started are still stopped or closed per the [cleanup section](layered-task-execution.instructions.md#cleaning-up-temporary-resources-before-handoff).
- **Role as evidence:** the screenshots and measurements of the checks in the What section are mandatory evidence for the layout part; they accompany, and do not replace, QG reasoning on the source.
  This run does not extend to builds, typechecks, tests outside FUT, a real backend, real devices or releases; those still belong to the user's stage.
  The verification role treats the screenshots as a source when concluding UI QGs and does not run anything itself.
  It opens only the screenshots it needs to conclude a QG; the measurements are the primary evidence.
  Each failed check is compared, instance by instance, with the same scenario in the state without the diff (an unchanged screen or route): a failure is pre-existing only when the same element fails there for the same measured cause.
  A check that also fails in the state without the diff for another element or another cause does not make the failure pre-existing.
  Only defects caused by the diff are FAIL.
  A wrong layout caused by the diff (overflow, overlap, wrong language, missing state) is a FAIL returned to `frontend-developer`, under the same two-repair limit of Implement; pre-existing defects are recorded in the summary, do not block the task, and are reported to the user with a proposal, per the [sweep](implement.instructions.md#implementing-and-repairing-per-review) of the Implement contract.
  A failed check caused by the diff that the Plan excluded from scope with a REQ naming exactly that behavior and the viewport range, together with a known-gaps entry, is not a FAIL of the task but is still a failed check: `layout_verification` lists it with the REQ and its cause (the diff), and `residual_risk` states the impact; if the Plan did not exclude it, it is a FAIL.
  When no usable browser tools are available, the layout part is `BLOCKED` with an owner.
  A diff that changes the UI without this result cannot be recorded as `implemented`.
- **Differences outside the checks:** a difference between the base and the post-diff state where bounding boxes, computed styles and scroll areas are all unchanged (for example a few differing pixels, a page height that varies between loads) is not a wrong layout caused by the diff.
  Capture the base state repeatedly to learn its own variation, record every value seen in the summary, then stop.
  Looking for the cause of such a difference or of a pre-existing defect, and measuring a behavior the checks do not require (for example hiding an element and measuring again, forcing a viewport change while a state is open, building a separate probe script), is a root-cause investigation that runs only when the user asks for it ([Verification by reasoning](layered-task-execution.instructions.md#verification-by-reasoning)); missing handling visible from the source is recorded by reasoning on the source.
  Pixel counts and repeated base captures, if any, are recorded apart from the checks and marked as not QG evidence.
- **Record:** summarize in the `layout_verification` field of the Implementation Record: states captured, the patterns (each abnormal one with the REQ or QG it traces to), languages, viewports and where they came from (the context documentation or the defaults above), the base used for comparison (commit and uncommitted changes counted), number of screenshots, checks passed/failed (each failed check with its cause: pre-existing, or caused by the diff and excluded by a Plan REQ), the directory path, and for each UI QG the files of the run directory and the line ranges in them that hold the measurements of its instances, with and without the diff.
  That index only locates values: the verification role reads exactly those ranges, and the values it reads there are the evidence.
  `.tmp/` does not go with commits, so the summary is the evidence and the path is for lookup only.
- **Review:** reads Implement's summary and screenshots and does not rerun them.
  A diff that changes the UI while the Record lacks this result, or screenshots showing a layout that violates a QG, is a `repair` FIND for `frontend-developer`.
