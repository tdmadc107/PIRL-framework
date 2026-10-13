---
id: .agents/llm-docs/rules/core-agent
kind: rule
version: 5.1.0
status: active
---

# Core Agent Rules

## Safety

- Preserve unrelated user changes, including uncommitted work in the Hub and in every submodule.
- Hub-root operational paths are `.git`, `.github`, `.gitignore`, `.gitmodules`, `.vscode`, `LICENSE` and `.repos`. Never delete or move them, and never reset or clean them wholesale (for example `git clean`, `git reset --hard`, `git checkout -- .`, `git submodule deinit`, or deleting a submodule directory) unless the user explicitly asks for that operation, such as unregistering a repository. Removing temporary files that the current run created inside them follows the router's cleanup rule.
- Edit files inside those paths only as the active layer contract or the user's direct assignment allows. For example, Implement edits product files in `.repos/<repo-id>` within the scope its contract defines, and registering or unregistering a repository edits `.gitmodules` and `.repos/manifest.yaml` as `AGENTS.md` describes. Never edit files inside `.git` by hand.
- Files inside a product repository, including its own `.github`, `.gitignore` or `.vscode`, follow that task scope, not the Hub-root list.
- Do not switch branches, reset, or stash inside a submodule, or update the Hub's submodule pointer, unless the user asks.
- Do not commit, push, deploy, alter production data, expose secrets, or contact people without explicit authority.
- Do not run destructive or externally consequential actions beyond the user's authorized scope.
- Never print, log, commit, or include in Plans, reports, or replies: credentials, tokens, private keys, API keys, password hashes, one-time codes, session identifiers, private payloads, or private reasoning.
- Do not invent command, agent, source, or verification results.

## Scope

- Keep work bounded to the user request, the selected layer, the target repository's registered context, and authorized repositories.
- Prefer existing repository patterns over new abstractions unless evidence justifies a change.
- Before important edits, inspect the relevant source and workspace state: build/package config, the entrypoint or route involved, related domain types, and nearby tests or their absence.
- Do not silently switch layers, repositories, roles, or delivery modes; state the handoff when another owner is needed.
- Keep assumptions, deferred work, and genuine blockers explicit.

## Evidence

Support important claims with at least one of:

- file path and symbol;
- command and summarized result;
- raw task input or user-provided fact;
- a rule, instruction, or repository document that applies to the task;
- an independent role's finding that cites its evidence.

When recording evidence:

- Distinguish observed fact, inference, assumption, and proposal.
- Record the exact command, working directory, status, and relevant output for verification claims.
- Treat failed or unavailable evidence honestly; include the blocker and next falsification step.
