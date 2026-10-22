# Implementation Record format

The `implement` skill owns how the Implementation Record is laid out and where
the layout captures are stored. What each field must hold, and what a repair
run records, belongs to the
[Recording results section](../../../.agents/instructions/implement.instructions.md#recording-results)
of the Implement contract.

## Location

- One `## Implementation Record` section in the Plan file, below the four Plan
  sections, wherever the Plan file is stored.
- `scripts/add_implementation_record.py` appends the
  [template](../assets/implementation-record-template.md) only when the Plan has
  no such section; an existing section is edited in place.

## Fields

- One `- <field>: <value>` line per field, in the order of the template,
  followed by the numbered next actions.
- The validator reads `status` and `updated_at` verbatim: write them exactly as
  in the template, without backticks or a trailing period. `status` is one of
  `awaiting_confirmation`, `implemented`, `blocked`, `failed` and equals the
  Plan's frontmatter `status`; `updated_at` is an ISO-8601 timestamp with
  `+07:00`, quoted. The other fields are free text.
- Fields that the contract requires to be present even when empty take exactly
  `N/A`, as the template shows.

## Layout capture directory

- `.tmp/layout-snapshots/<plan-set>/<task-id>/<YYYYMMDD-HHmmss>/` under the Hub
  root, whatever directory holds the Plan; `scripts/new_layout_run.py` creates
  it with the current `+07:00` timestamp. The `layout_verification` field names
  it.

## Placeholders in the template

- `{{updated_at}}`: filled by `scripts/add_implementation_record.py`; update it
  on every later write of the record.
- `<…>` and the `a | b | c` alternatives: the coordinator writes the actual
  value and keeps exactly one alternative.
