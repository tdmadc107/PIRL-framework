## Implementation Record
- status: awaiting_confirmation | implemented | blocked | failed
- updated_at: "{{updated_at}}"
- volume: small | medium | large (<N> changed lines: <added> added + <deleted> deleted over changed_paths)
- changed_paths: <relative paths or []>
- execution_mode: <separate agent per role | self-performed in turn, with the reason delegation was not possible; each role that read beyond its assignment or consulted a reviewer outside the role team, and how>
- quality_gate_results: <QG-01=PASS|FAIL|BLOCKED per the verification role's conclusion; ...>
- layout_verification: <N/A when the diff does not change the UI; or states captured, patterns (each abnormal one with the REQ or QG it traces to), languages, viewports and where they came from, the base used for comparison (base commit and uncommitted changes counted), number of screenshots, checks passed/failed (each failed check with its cause per the layout verification instructions), the .tmp/layout-snapshots/... directory, and for each UI QG the files and line ranges holding its measurements with and without the diff>
- repair_closure_evidence: <each report item -> REQ/QG, cause, solution/disposition and matching before/after evidence; or exactly N/A for the first run>
- root_cause_revalidation: <ITEM-ID=confirmed|contradicted|blocked/evidence before the fix; or exactly N/A for the first run>
- review_item_disposition: <FIND-01=resolved|failed|blocked/evidence; RISK-01=deferred/owner and revisit condition; BLOCK-01=unblocked|blocked|escalated/evidence; or exactly N/A for the first run>
- plan_amendments: <each Plan edit per the "Changes to the Plan confirmed by the user" section: Plan line, old -> new value, what the user confirmed and when; or exactly N/A>
- residual_risk: <remaining risk and impact; or none>
- role_selection_source: plan | <relative path of the source report>
- effective_implementation_roles: <list of roles in order, comma-separated>
- Next allowed owner/layer: <owner/layer>
- Authorization condition: <input or decision for the next step>
1. <concrete action and related paths>

### REQ-01
- Implementation role: <role>
- Verification role: <QG-01 -> role; ...>
- Implementation result: <what was done, as `path:start-end` per change; what was done outside the Plan and why, or none; open doubts of the self-challenge, or none>
- Verification result: <QG-01=PASS|FAIL|BLOCKED: the deciding source and the counterexample tried, in one or two sentences; ...>
- Confirmed with the user: <decision, the user's answer quoted and the date; or none>
