# Review report format

The `review` skill owns how a Review report is laid out, named, stored and
presented. What each conclusion must prove, and when a new round opens, belongs
to the [Review contract](../../../.agents/instructions/review.instructions.md).

## Location and naming

- Output directory: the directory the user names for the report; when the user
  names none, the Hub root.
- Report:
  `<output directory>/<plan-set>/<task-id-lower>-<todo-slug>/round-<NN>-review-<todo-slug>-<YYYYMMDD-HHmmss>.md`,
  where `NN` is the two-digit round number. When the Plan package also sits
  under the Hub root, the report lands inside the package directory, next to
  the Plan it reviews. Inside the Hub, the `<plan-set>/` directory is ignored by
  Git like the Plan package ([AGENTS.md](../../../AGENTS.md#git)).
- Slugs are ASCII kebab-case; timestamps use the `+07:00` time zone.
- Every round has its own file; never overwrite or delete another round.

## Frontmatter

| Field | Value |
| --- | --- |
| `schema` | `pirl-review/v1` |
| `content_language` | `en` |
| `plan_file` | The reviewed Plan file: path relative to the Hub root, or absolute when it lives outside the Hub; quoted |
| `task_id` | The Plan's `task_id` |
| `review_round` | `1`, `2`, … |
| `prior_review` | `null` in round 1; afterwards the report of the round just before, as a path like `plan_file` |
| `review_roles` | Roles registered for `review`, in the order of the contract's role table |
| `repair_roles` | Roles registered for `implement`; `[]` while a `replan` remains or nothing needs repair |
| `business_verdict` | `PASS`, `FAIL` or `BLOCKED` |
| `verdict` | Equal to `business_verdict` |
| `status` | `completed` or `blocked` |
| `reviewed_at` | ISO-8601 timestamp with `+07:00`, quoted |
| `implementation_target` | The diff, commit or paths reviewed, including a shared snapshot |

## Presentation rules

Keep the two level-two sections `Business` and `Evaluations`; use level-three/
four headings to divide the content inside. Present QGs as a three-column
table; each FIND/RISK/BLOCK and EVAL has its own two-column `Field | Content`
table under a heading containing its ID. The `Next` part uses a two-column
table. Do not merge several fields into one long bullet or cram all fields of a
finding/evaluation into one overly wide table.

This is only presentation: keep all fields, IDs, conclusions, evidence and
instructions; do not drop information to make a table shorter. In each cell,
use `<br>` when you need to separate several sources or processing steps; keep
paths, symbols and commands intact. Escape a `|` that belongs to cell content
as `\|`, including inside inline code, so it does not create a column. This
escape rule applies only to Markdown tables and does not change values in the
frontmatter. Put a blank line before/after each table.

Replace placeholders with actual content and choose one value for each status
or disposition. Each QG has exactly one row in the Quality gates table. Record
only FINDs/RISKs/BLOCKs that actually exist; a group with no items uses one
short sentence under its heading, with no empty table or fake ID. Number each
kind consecutively, keeping the order findings, risks, then blockers. EVALs
cover the settled Implement team in the Implementation Record's order; do not
add an inventory or a third level-two section that repeats the handoff.

## Placeholders in the template

- `{{name}}`: computed values that `scripts/new_review.py` fills in from the
  Plan and the earlier rounds. When a report is written without the script,
  fill them by the rules above.
- `<…>` and the `a / b` alternatives: the coordinator writes the actual content
  and keeps exactly one alternative.
