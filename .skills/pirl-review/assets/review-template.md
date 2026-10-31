---
schema: pirl-review/v1
content_language: en
plan_file: "{{plan_file}}"
task_id: {{task_id}}
review_round: {{review_round}}
prior_review: {{prior_review}}
review_roles: [code-reviewer]
repair_roles: []
business_verdict: PASS
verdict: PASS
status: completed
reviewed_at: "{{reviewed_at}}"
implementation_target: "<diff/commit/paths reviewed; volume of the reviewed run>"
---

# Review {{review_round_padded}}: {{task_id}} — {{title}}

## Business

### Quality gates

| QG | Result | Evidence |
| --- | --- | --- |
| QG-01 | <PASS / FAIL / BLOCKED> | <source/symbol, logic and the result of the check> |

### Findings

#### FIND-01

| Field | Content |
| --- | --- |
| QG | QG-01 |
| Impact | <realistic trigger and consequence> |
| Source | <file/symbol or trusted contract> |
| Cause | <the faulty mechanism> |
| Challenge | <grounds that refute competing explanations> |
| Roles | <role, ...> |
| Target | `<file to handle>` |
| Instructions | <concrete work for each role, in order> |
| Disposition | <repair / replan> |

### Risks

#### RISK-01

| Field | Content |
| --- | --- |
| QG | QG-02 |
| Impact | <realistic exposure and limits> |
| Source | <file/symbol> |
| Cause | <the mechanism that creates the risk> |
| Challenge | <why the risk stands while the QG still holds> |
| Roles | <role, ...> |
| Target | `<related file>` |
| Instructions | <how to mitigate when assigned> |
| Revisit when | <concrete condition> |

### Blockers

#### BLOCK-01

| Field | Content |
| --- | --- |
| QG | QG-03 |
| Missing | <mandatory input not yet available> |
| Source | <evidence of what is missing> |
| Cause | <the mechanism that blocks the conclusion> |
| Owner | <role or provider of the input> |
| Target | `<related file>` |
| Instructions | <action to unblock> |
| Disposition | <retry / escalate> |
| Condition | <change needed before continuing> |

### Next

| Field | Content |
| --- | --- |
| Next | <owner/layer, input file and condition to continue> |

## Evaluations

### EVAL-01

| Field | Content |
| --- | --- |
| Role | <Implement implementation or verification role> |
| Result | <PASS / FAIL / BLOCKED> |
| Issue | <the role's grounded wrong decision; or none> |
| Cause | <instruction / ineffective_fix / input / execution with `issue_key`; or none> |
| Improvement | <file and section edited, old → new version; or pending the user (safety); or not needed> |
| Evidence | <Implementation Record, Implement record, sources/diff checked> |
