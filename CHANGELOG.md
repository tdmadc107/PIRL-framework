# Changelog

Every notable change to PIRL is recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

[0.1.0]: https://github.com/tdmadc107/PIRL-framework/releases/tag/v0.1.0
