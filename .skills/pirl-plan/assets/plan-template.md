---
schema: pirl-plan/v1
content_language: en
plan_set: {{plan_set}}
task_id: {{task_id}}
title: "<Task name>"
layer: implement
status: planned
depends_on: []
created_at: "{{created_at}}"
target_repo: "<Path of the target repository, relative to the Hub root or absolute; . for the Hub itself>"
source_request: "<Short version of the user's request>"
planning_roles: [<planning-role>]
implementation_roles: [<implementation-role>]
verification_roles: [<verification-role>]
---

# {{task_id}}: <Task name>

## What to do

- REQ-01 | Source: <Request or file/symbol read> | Requirement: <Business behavior to achieve>
- Scope: <Work to be done; write exclusions only when needed to avoid misunderstanding>.
- Allowed paths: `<specific paths of source, documentation and tests under FUT, if any>`.
- Standalone task outcome: <Output that can be accepted while later/parallel tasks are not yet implemented>.
  <If the specification has build/test/release goals: one line saying they belong to the user's build/test/release stage>.

## How to do it

1. <ROLE-01: which file/symbol to change, how and with what outcome; add steps when there is a real dependency>.
   <If there are tests: ROLE-01 writes/updates tests under FUT for which REQ and which affected functionality, and runs exactly those tests (file/class/name)>.
2. <ROLE-02: after ROLE-01, reasons on the diff/source to conclude which QGs; runs no commands/tests>.

<If depends_on is set: the concrete output to receive from each prerequisite task>.
<If end-to-end criteria are assigned to another task: the owning task and the integration part to verify; not a QG of this task>.
<Input conditions or decisions to stop at, if any>.
Next step: the user names this Plan file for Implement once the Plan content fixes are complete; Implement carries out only this task within the scope above.

## Participating roles

- ROLE-01 | Type: implementation | Role: <implementation-role> | Responsible for: <Concrete work> | Input: <Information or dependent results> | Done when: <Source/documentation to deliver>
- ROLE-02 | Type: verification | Role: <verification-role> | Responsible for: <QGs and the questions to answer> | Input: <ROLE-01's diff/source> | Done when: <PASS/FAIL/BLOCKED conclusion for each QG by reasoning with sources>
- Planning | Roles: <the roles in planning_roles> | Execution: <separate agent, or the coordinator self-performing with the reason delegation was not possible; per role when they differ>

## Required quality gates

- QG-01 | Requirement: REQ-01 | Required logic: <Situation → where it is handled → outcome/state and failure branches; provable by reasoning on the source with the prerequisite inputs and this task's changes, without tests/builds/runs or later/parallel tasks>
