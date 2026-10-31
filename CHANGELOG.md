# Changelog

Every notable change to PIRL is recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- Review picks its team by the `volume` of the reviewed Implement run (`small` below 300 changed lines, `medium` from 300 to 1000, `large` above 1000): `code-reviewer` concludes every QG that is not a UI QG in every round, `ux-designer` joins when the diff changes the UI, and `code-analyst`, `solution-architect` and `business-analyst` join only for `code-reviewer`'s RISKs and BLOCKs, or, under `large`, each to check one aspect of its conclusions.
  `review_roles` lists the roles that actually ran.
- The Implementation Record records `volume` and holds one `### REQ-NN` block per REQ (implementation role, verification roles, result with `path:start-end` ranges, verification result per QG, what the user confirmed) in place of `role_work`, `checkpoint_evidence`, `quality_gate_evidence`, `role_challenge_results` and `review_handoff`.
- Each question of a layer run (each QG, suspicion, check or item to analyze) has exactly one owning role; assignments copy the REQs, QGs and record excerpts of the part and the snapshot verbatim instead of passing the whole Plan, and each framework file and fixed input is read once per run.
- Each repair at Implement, and each verification after it, runs in a new agent that receives only the cause of the repair and the excerpts that concern it.
- For each UI QG, `layout_verification` indexes the files and line ranges that hold its measurements, with and without the diff.
- Self-evaluation improves the framework only for issues that meet the new improvement threshold: the cause lies in the framework, it affects how the framework runs, and it can recur in another task or repository; a mistake specific to one project or one task's content changes no framework file.
- A reviewer outside the role team (for example an advisor tool the host offers) is consulted only in an Implement run; Plan and Review runs consult none.

## [0.2.0] - 2026-10-31

### Added

- A new install registers a version-pinned browser MCP server in the project-level MCP file of Claude Code (`.mcp.json`), Codex CLI (`.codex/config.toml`), Cursor (`.cursor/mcp.json`) and Gemini CLI (`.gemini/settings.json`), so layout verification has the browser tools it needs.
  The Codex CLI entry allows the server 60 seconds to start (`startup_timeout_sec`), because Codex gives up after 10 seconds by default and the first start downloads the server.
  `--no-mcp` skips it, and `sync --mcp` or `sync --no-mcp` changes the setting of an existing install.
  A file the user owns or edited is never overwritten; the installer prints the entry to add by hand.
- `node .pirl/bin/pirl.mjs mcp` starts that server, so a host's file names only this command and a new pin never rewrites it.
  The command removes the server's code-running tool (`browser_run_code_unsafe`) from the tool list and refuses calls to it, since the server cannot turn that tool off.

### Changed

- Layout verification captures a closed set: at most two mock patterns (`normal`, and `abnormal` only for conditions a REQ, QG or the specification names), the responsive sizes the target repository's context documentation defines or else desktop 1920×1080, tablet 768×1024 and mobile 390×844, and every UI language; no sizes around breakpoints and no combinations of the agent's own choosing.
- Layout captures go through the browser tools the host exposes by an MCP server; capture scripts and runners are not allowed, and code passed to a code-running tool may not loop over captures.
- A repeat capture after a repair covers only what the repair can change, and a failed check is pre-existing only when the same element fails for the same cause without the diff.
- Plans compare every width-dependent UI clause with the room the REQs leave, and Implement re-derives such clauses before capturing.

## [0.1.2] - 2026-10-30

### Fixed

- Fixed an issue where play layers could define REQ and QG values beyond the specified requirement scope.

### Added

- Introduced the Clean Plan rule, requiring plan layers to perform a self-audit of the purpose and validity of each generated plan.

## [0.1.1] - 2026-10-29

### Added

- `package.json` lists 16 npm keywords, the same as the repository's GitHub topics: the hosts PIRL supports (`claude-code`, `github-copilot`, `codex`, `cursor`, `gemini-cli`), the kind of tool (`ai-agents`, `ai-coding`, `coding-agent`, `agentic-workflow`, `multi-agent`, `developer-tools`) and what it does (`planner`, `implementation`, `code-review`, `spec-driven-development`, `agent-skills`).
- `package.json` links the npm page to the README on GitHub (`homepage`) and to the issue tracker (`bugs`).

## [0.1.0] - 2026-10-29

First release on npm.

### Added

- `npx pirl-framework` installs the framework into `.pirl/` at the root of a repository, asks which hosts to set up and writes their adapter files; `init --host <list>` does the same without asking.
- Adapter files for Claude Code, GitHub Copilot, Codex CLI, Cursor and Gemini CLI: the instructions each host loads in every session and one entry per skill, in that host's own folders.
- `update` brings `.pirl/` to a new version and keeps local improvements: a file changed only upstream is replaced, a file changed on both sides is merged with `git merge-file`, and conflicts stop the update until `update --continue`.
- `remove`, `sync`, `check` and `status` commands, and `manifest.json` recording the installed version, files, hosts and adapter files.
- The `pirl-standalone` skill for standalone tasks and the `pirl-maintain` skill for framework maintenance.

### Changed

- `AGENTS.md` defines the Hub as the folder that holds it, so the framework works both from its own repository and from `.pirl/` inside a workspace; the Safety, Git and Target repository sections cover a Hub installed inside the target repository.
- `layer_record.py start` pins the installed version from `manifest.json` when the Hub is installed inside a workspace, instead of that workspace's commit.
- Line endings are compared as LF, so a CRLF checkout on Windows is not reported as a change.
- The README is a short landing page; the details live in `AGENTS.md`, the router and the skills.

[0.2.0]: https://github.com/tdmadc107/PIRL-framework/releases/tag/v0.2.0
[0.1.2]: https://github.com/tdmadc107/PIRL-framework/releases/tag/v0.1.2
[0.1.1]: https://github.com/tdmadc107/PIRL-framework/releases/tag/v0.1.1
[0.1.0]: https://github.com/tdmadc107/PIRL-framework/releases/tag/v0.1.0
