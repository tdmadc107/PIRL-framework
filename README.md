<div align="center">

# 🧭 PIRL — Plan · Implement · Review Layer

**Give your AI coding agent a team, a plan and a review — in one `npx` command.**

[![npm version](https://img.shields.io/npm/v/pirl-framework?color=2f6fe4&label=npm)](https://www.npmjs.com/package/pirl-framework)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![node](https://img.shields.io/badge/node-%E2%89%A518-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![python](https://img.shields.io/badge/python-%E2%89%A53.9-3776AB?logo=python&logoColor=white)](https://www.python.org)

[⚡ Quick Start](#-quick-start) · [🧰 Hosts](#-supported-hosts) · [🔧 Commands](#-commands) · [📖 Docs](#-documentation)

</div>

---

## 🤔 Why PIRL?

PIRL turns the AI coding agent you already use into a small, disciplined team, running entirely on instruction files:

- 📝 **Plan → 🔨 Implement → 🔍 Review.** Work is settled into tasks with quality gates, implemented, then checked against those gates on the source.
- 👥 **Specialist roles.** Each layer hands the work to roles such as `business-analyst` or `code-reviewer`, each in its own sub-agent; no role verifies its own output.
- 🧠 **Self-improving.** After every run, `process-auditor` fixes the framework's own instructions at the root cause.
- 🔒 **Safe by default.** The agent never commits, pushes, deploys or touches secrets without your explicit request.

PIRL calls no model and needs no API key: your host runs it with the model you already chose.

---

## ⚡ Quick Start

At the root of your repository:

```powershell
npx pirl-framework
```

The installer copies the framework into `.pirl/`, asks which hosts you use and writes their adapter files.
In a script or CI, name the hosts: `npx pirl-framework init --host claude,codex`.

Commit `.pirl/` and the adapter files so the whole team shares the same rules; Plans, reports and records stay out of Git through `.pirl/.gitignore`.
Then open your host at the repository root and ask in plain words:

| You want to | Example request |
| --- | --- |
| Plan | "Create a Plan: customers get an email when an order is cancelled" |
| Implement | "Implement Plan T01" |
| Review | "Review the implementation of Plan T01" |
| Fix per a Review | "Fix per report `<report path>`" |
| Work outside a Plan | "Update the AGENTS.md of this repository" |
| Change the framework | "Fix the cleanup rule in the router" |

Each layer runs only when you ask for it.

---

## 🧰 Supported Hosts

| Host | `--host` | Instructions loaded in every session | Skills |
| --- | --- | --- | --- |
| Claude Code | `claude` | `.claude/rules/pirl.md` | `.claude/skills/pirl-*/` |
| GitHub Copilot | `copilot` | `.github/instructions/pirl.instructions.md` | `.github/skills/pirl-*/` |
| Codex CLI | `codex` | A marked block in `AGENTS.md` | `.agents/skills/pirl-*/` |
| Cursor | `cursor` | `.cursor/rules/pirl.mdc` | `.cursor/skills/pirl-*/` |
| Gemini CLI | `gemini` | A marked block in `GEMINI.md` | `.gemini/skills/pirl-*/` |

In a file you own, PIRL writes only between `<!-- pirl:begin -->` and `<!-- pirl:end -->`, and it never writes to `CLAUDE.md`.

### Browser MCP server

Layout verification drives a browser through an MCP server, so a new install also registers one in the project-level MCP file of each host that has one: `.mcp.json` (Claude Code), `.codex/config.toml` (Codex CLI), `.cursor/mcp.json` (Cursor) and `.gemini/settings.json` (Gemini CLI).
The entry runs `node .pirl/bin/pirl.mjs mcp`, which starts a version-pinned Playwright MCP server through `npx`; it needs Node, npm and a browser on the machine, and nothing in your project.
The command sits between the host and the server and hides the server's code-running tool (`browser_run_code_unsafe`): it leaves the tool list and calls to it are refused.
The host asks you to approve the server, or to trust the folder, before it runs; restart the host after the install.
Codex CLI reads `.codex/config.toml` only in a project you marked as trusted, and its entry allows the server 60 seconds to start, since the first start downloads it.
PIRL creates such a file only when it is absent and never overwrites one you own or edited: it prints the entry to add by hand instead.
GitHub Copilot has no project-level file, so register the command `node .pirl/bin/pirl.mjs mcp` as an MCP server yourself.
Skip it with `--no-mcp`; an installation made before this setting existed keeps it off until you run `node .pirl/bin/pirl.mjs sync --mcp`.

---

## 🔧 Commands

| Command | What it does |
| --- | --- |
| `npx pirl-framework` | Installs PIRL; once installed, shows its status and offers to add hosts, update or remove hosts |
| `npx pirl-framework@latest update` | Updates `.pirl/` and keeps local improvements; on conflicts it changes nothing until you resolve them and run `update --continue` |
| `npx pirl-framework remove --host <list>` | Removes those hosts' adapter files; delete `.pirl/` to uninstall |
| `node .pirl/bin/pirl.mjs sync` | Regenerates the adapter files after `.pirl/` changed |

Options: `--host <list>`, `--yes`, `--dir <folder>`, `--force` (overwrite adapters edited by hand), `--mcp` / `--no-mcp` (register or stop registering the browser MCP server), `--help`.

---

## 📖 Documentation

| To learn about | Read |
| --- | --- |
| Core rules, flow, roles, target repository | [`AGENTS.md`](AGENTS.md) |
| How the agent presents its answers | [`CONTEXT.md`](CONTEXT.md) |
| Layer boundaries, shared contracts, self-improvement | [Router](.agents/instructions/layered-task-execution.instructions.md) |
| Running each kind of work | [`.skills/`](.skills/) |
| Framework structure, role catalog, checks | [Standalone and maintenance instructions](.agents/instructions/standalone-and-maintenance.instructions.md) |

To work on PIRL itself, clone this repository and run the tests at its root:

```powershell
python -B -m unittest discover -s .agents/evals/tests -p "test_*.py"
```

---

## 📄 License

[MIT](LICENSE) © tdmadc107
