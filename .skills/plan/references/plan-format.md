# Plan file format

The `plan` skill owns how a Plan file is laid out, named and stored. What each
section must settle belongs to the
[Plan contract](../../../.agents/instructions/plan.instructions.md).

## Location and naming

- Output directory: the directory the user names for the Plan; when the user
  names none, the Hub root.
- Package: `<output directory>/<request-slug>_<YYYYMMDD-HHmmss>/`. The
  package directory name is the `plan_set`.
- Task file: `<NN>-plan-<todo-slug>-<YYYYMMDD-HHmmss>.md`, where `NN` is the
  task number (`T01` → `01`) and the timestamp is the package timestamp, shared
  by every file of the package.
- Slugs are ASCII kebab-case: lowercase letters, digits and single hyphens.
- Timestamps use the `+07:00` time zone.
- Task IDs start at `T01` and are consecutive within the package.
- Never overwrite an existing file. Review reports of the package are placed
  per the [report format](../../review/references/review-format.md#location-and-naming).

## Frontmatter

| Field | Value |
| --- | --- |
| `schema` | `pirl-plan/v1` |
| `content_language` | `en` |
| `plan_set` | The package directory name |
| `task_id` | `T01`, `T02`, … |
| `title` | Task name, quoted |
| `layer` | `implement`: the layer that carries out the Plan |
| `status` | `planned` at handoff; Implement later sets `awaiting_confirmation`, `implemented`, `blocked` or `failed`, equal to the Implementation Record's `status` |
| `depends_on` | Task IDs of the same package; never the task itself, never a cycle |
| `created_at` | ISO-8601 timestamp with `+07:00`, quoted |
| `target_repo` | Path of the target repository, relative to the Hub root or absolute; `.` for the Hub itself; an existing directory ([AGENTS.md](../../../AGENTS.md#target-repository)) |
| `source_request` | Short version of the user's request, quoted |
| `planning_roles` | Roles registered for `plan` |
| `implementation_roles` | Roles registered for `implement` |
| `verification_roles` | Roles registered for `verify`, none of them in `implementation_roles` |

Write the frontmatter in the YAML subset the validator reads: one
`key: value` per line, inline lists such as `[code-analyst, code-reviewer]`,
quoted strings when a value contains `:` or `#`.

## Body

- Exactly four level-two sections, in this order: `What to do`, `How to do it`,
  `Participating roles`, `Required quality gates`. Add only details that change
  how the work is done; do not add per-role reports or checklists as a fifth
  section. Implement later adds one `Implementation Record` section below them.
- Line forms: `REQ-NN | Source: … | Requirement: …`;
  `ROLE-NN | Type: … | Role: … | Responsible for: … | Input: … | Done when: …`;
  `QG-NN | Requirement: REQ-NN | Required logic: …`.
- Write in English; keep IDs, data keys, symbols, commands and paths verbatim.

## Placeholders in the template

- `{{name}}`: computed values that `scripts/new_plan.py` fills in. When a file
  is written without the script, fill them by the rules above.
- `<…>`: content the coordinator writes from the settled decisions. A line of
  the form `<If …: …>` stays only when its condition holds.
