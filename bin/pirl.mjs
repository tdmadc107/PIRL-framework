#!/usr/bin/env node
// Installs PIRL into a workspace as `.pirl/`, creates the adapter files each host loads, keeps them in sync with
// `.pirl/` and updates the framework without losing local improvements. No dependencies beyond Node and Git.

import { spawnSync } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import readline from "node:readline/promises";
import { fileURLToPath } from "node:url";
import zlib from "node:zlib";

const PACKAGE = "pirl-framework";
const DIR = ".pirl";
const MANIFEST = "manifest.json";
const UPDATE = ".tmp/update";
const BEGIN = "<!-- pirl:begin -->";
const END = "<!-- pirl:end -->";
const SOURCE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// The copy inside a workspace carries a manifest; the package itself does not.
const INSTALLED = fs.existsSync(path.join(SOURCE, MANIFEST));

// Where each host looks for the instructions it loads in every session and for project skills.
// `file` adapters are whole files owned by PIRL; `block` adapters are a marked block inside a file the user may own.
const HOSTS = {
  claude: {
    label: "Claude Code",
    instructions: { kind: "file", path: ".claude/rules/pirl.md", frontmatter: "" },
    skills: ".claude/skills",
    detect: [".claude", "CLAUDE.md"],
  },
  copilot: {
    label: "GitHub Copilot",
    instructions: { kind: "file", path: ".github/instructions/pirl.instructions.md", frontmatter: '---\napplyTo: "**"\n---\n\n' },
    skills: ".github/skills",
    detect: [".github/copilot-instructions.md", ".github/instructions", ".github/skills"],
  },
  codex: {
    label: "Codex CLI",
    instructions: { kind: "block", path: "AGENTS.md" },
    skills: ".agents/skills",
    detect: [".codex"],
  },
  cursor: {
    label: "Cursor",
    instructions: { kind: "file", path: ".cursor/rules/pirl.mdc", frontmatter: "---\ndescription: PIRL framework rules\nalwaysApply: true\n---\n\n" },
    skills: ".cursor/skills",
    detect: [".cursor"],
  },
  gemini: {
    label: "Gemini CLI",
    instructions: { kind: "block", path: "GEMINI.md" },
    skills: ".gemini/skills",
    detect: [".gemini", "GEMINI.md"],
  },
};
// Personal skill folders: a skill there with the same name can take precedence over the project's one.
const PERSONAL_SKILLS = [".claude/skills", ".copilot/skills", ".agents/skills", ".codex/skills", ".cursor/skills", ".gemini/skills"];

class Failure extends Error {
  constructor(message, code = 1) {
    super(message);
    this.code = code;
  }
}

const fail = (message, code) => {
  throw new Failure(message, code);
};
const sha = (data) => crypto.createHash("sha256").update(data).digest("hex");
const posix = (p) => p.split(path.sep).join("/");
const read = (file) => (fs.existsSync(file) ? fs.readFileSync(file) : null);
const readText = (file) => (fs.existsSync(file) ? fs.readFileSync(file, "utf8") : null);
const interactive = () => Boolean(process.stdin.isTTY && process.stdout.isTTY);

function write(file, data) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, data);
}

// Removes a file, then each parent left empty, stopping at `stop`.
function removeFile(file, stop) {
  if (fs.existsSync(file)) fs.rmSync(file);
  let dir = path.dirname(file);
  while (dir.startsWith(stop + path.sep) && fs.existsSync(dir) && fs.readdirSync(dir).length === 0) {
    fs.rmdirSync(dir);
    dir = path.dirname(dir);
  }
}

// ---------- arguments ----------

const USAGE = `Usage: npx ${PACKAGE} [command] [options]

Commands:
  init        Install PIRL into ${DIR}/ of the current folder and create the host adapters (default
              when ${DIR}/ is missing). Run again with --host to add hosts.
  update      Update ${DIR}/ to this package's version, keeping local improvements; --continue
              finishes an update that stopped on conflicts.
  remove      Remove the adapters of the hosts named with --host (${DIR}/ itself is kept).
  sync        Regenerate the adapters from ${DIR}/ after its files changed.
  check       Exit with an error when an adapter is missing or out of date.
  status      Show the installed version, hosts and local changes.

Options:
  --host <list>      Hosts, comma-separated: ${Object.keys(HOSTS).join(", ")}
  --yes              Confirm every question.
  --dir <folder>     Workspace folder (default: the current folder).
  --force            Overwrite adapters that were edited by hand.
  --base-dir <dir>   update: the files of the installed version, instead of downloading them.
  --continue         update: apply an update whose conflicts were resolved.
`;

function parseArgs(argv) {
  const opts = { command: null, host: null, yes: false, force: false, continue: false, dir: null, baseDir: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const value = () => {
      if (i + 1 >= argv.length) fail(`${arg} needs a value`);
      return argv[++i];
    };
    if (arg === "--host") opts.host = value().split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);
    else if (arg === "--dir") opts.dir = value();
    else if (arg === "--base-dir") opts.baseDir = value();
    else if (arg === "--yes" || arg === "-y") opts.yes = true;
    else if (arg === "--force") opts.force = true;
    else if (arg === "--continue") opts.continue = true;
    else if (arg === "--help" || arg === "-h") opts.command = "help";
    else if (arg === "--version" || arg === "-v") opts.command = "version";
    else if (!arg.startsWith("-") && !opts.command) opts.command = arg;
    else fail(`unknown argument: ${arg}\n\n${USAGE}`);
  }
  for (const host of opts.host || []) if (!HOSTS[host]) fail(`unknown host: ${host} (known: ${Object.keys(HOSTS).join(", ")})`);
  return opts;
}

async function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    return (await rl.question(question)).trim();
  } finally {
    rl.close();
  }
}

async function confirm(question, opts) {
  if (opts.yes) return true;
  if (!interactive()) return false;
  return /^y(es)?$/i.test(await ask(`${question} [y/N] `));
}

// ---------- package and manifest ----------

function packageVersion() {
  if (INSTALLED) return JSON.parse(fs.readFileSync(path.join(SOURCE, MANIFEST), "utf8")).version;
  return JSON.parse(fs.readFileSync(path.join(SOURCE, "package.json"), "utf8")).version;
}

// npm renames a published `.gitignore` to `.npmignore` when it unpacks a package, so read it back from there.
function sourcePath(root, rel) {
  const file = path.join(root, rel);
  if (rel === ".gitignore" && !fs.existsSync(file) && fs.existsSync(path.join(root, ".npmignore"))) return path.join(root, ".npmignore");
  return file;
}

// The framework files of a copy: the package's `files` list, or the manifest of an installed copy.
function frameworkFiles(root) {
  const manifest = readManifest(root);
  if (manifest) return Object.keys(manifest.files).filter((f) => fs.existsSync(path.join(root, f))).sort();
  const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
  const out = new Set(["LICENSE", "README.md"].filter((f) => fs.existsSync(path.join(root, f))));
  const walk = (rel) => {
    for (const entry of fs.readdirSync(path.join(root, rel), { withFileTypes: true })) {
      const child = rel ? `${rel}/${entry.name}` : entry.name;
      if (entry.name === "__pycache__" || entry.name === "node_modules") continue;
      if (entry.isDirectory()) walk(child);
      else if (entry.isFile()) out.add(child);
    }
  };
  for (const pattern of pkg.files || []) {
    const clean = pattern.replace(/\/$/, "");
    if (clean.includes("*")) {
      const dir = path.posix.dirname(clean);
      const match = new RegExp(`^${path.posix.basename(clean).replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, "[^/]*")}$`);
      for (const name of fs.readdirSync(path.join(root, dir))) {
        if (match.test(name) && fs.statSync(path.join(root, dir, name)).isFile()) out.add(`${dir}/${name}`);
      }
    } else if (!fs.existsSync(sourcePath(root, clean))) {
      fail(`package file missing: ${clean}`);
    } else if (fs.statSync(sourcePath(root, clean)).isDirectory()) {
      walk(clean);
    } else {
      out.add(clean);
    }
  }
  out.delete("package.json");
  return [...out].sort();
}

function readManifest(pirl) {
  const text = readText(path.join(pirl, MANIFEST));
  if (text === null) return null;
  const manifest = JSON.parse(text);
  if (manifest.package !== PACKAGE) fail(`${path.join(pirl, MANIFEST)} does not belong to ${PACKAGE}`);
  return { hosts: [], adapters: {}, blocks: {}, ...manifest };
}

function writeManifest(pirl, manifest) {
  const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)));
  const out = { ...manifest, hosts: [...manifest.hosts].sort(), files: sorted(manifest.files), adapters: sorted(manifest.adapters), blocks: sorted(manifest.blocks) };
  write(path.join(pirl, MANIFEST), JSON.stringify(out, null, 2) + "\n");
}

function localChanges(pirl, manifest) {
  const changed = [];
  for (const [file, hash] of Object.entries(manifest.files)) {
    const data = read(path.join(pirl, file));
    if (data === null) changed.push(`${file} (deleted)`);
    else if (sha(data) !== hash) changed.push(file);
  }
  return changed;
}

// ---------- workspace ----------

function git(cwd, ...args) {
  const result = spawnSync("git", ["-C", cwd, ...args], { encoding: "utf8" });
  return result.status === 0 ? result.stdout.trim() : null;
}

function workspaceOf(opts) {
  if (opts.dir) return path.resolve(opts.dir);
  // The copy inside a workspace always serves the workspace that holds it.
  if (INSTALLED) return path.dirname(SOURCE);
  return process.cwd();
}

async function checkWorkspace(ws, opts) {
  if (!fs.existsSync(ws) || !fs.statSync(ws).isDirectory()) fail(`${ws} is not a folder`);
  if (posix(ws).split("/").includes(DIR)) fail(`${ws} is inside a ${DIR}/ folder; run the command in the folder that holds ${DIR}/`);
  const top = git(ws, "rev-parse", "--show-toplevel");
  if (top === null) {
    console.warn(`warning: ${ws} is not a Git repository; hosts usually load their instruction files from the repository root.`);
  } else if (fs.realpathSync(top) !== fs.realpathSync(ws)) {
    const message = `${ws} is inside the Git repository ${top} but is not its root, so hosts opened at the root may not load the adapters.`;
    if (!(await confirm(`${message}\nInstall here anyway?`, opts))) fail(`${message}\nRun the command at the repository root, or pass --yes to install here.`);
  }
}

function detectHosts(ws) {
  return Object.entries(HOSTS).filter(([, host]) => host.detect.some((p) => fs.existsSync(path.join(ws, p)))).map(([id]) => id);
}

async function chooseHosts(ws, opts, installed) {
  if (opts.host) return opts.host;
  if (!interactive()) fail("--host is required when there is no interactive terminal");
  const marked = new Set([...installed, ...detectHosts(ws)]);
  const ids = Object.keys(HOSTS);
  console.log("Hosts (marked: already set up or found in this folder):");
  ids.forEach((id, i) => console.log(`  ${marked.has(id) ? "[x]" : "[ ]"} ${i + 1}. ${HOSTS[id].label} (${id})`));
  const answer = await ask("Numbers of the hosts to set up, comma-separated (Enter keeps the marked ones): ");
  const chosen = answer
    ? answer.split(",").map((n) => {
        const id = ids[Number(n.trim()) - 1];
        if (!id) fail(`not a host number: ${n.trim()}`);
        return id;
      })
    : [...marked];
  if (chosen.length === 0) fail("no host chosen");
  return chosen;
}

// ---------- adapters ----------

function skillsOf(pirl) {
  const root = path.join(pirl, ".skills");
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && fs.existsSync(path.join(root, entry.name, "SKILL.md")))
    .map((entry) => {
      const text = fs.readFileSync(path.join(root, entry.name, "SKILL.md"), "utf8");
      const header = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const field = (key) => header && header[1].match(new RegExp(`^${key}:\\s*(.+)$`, "m"));
      const name = field("name");
      const description = field("description");
      if (!name || !description) fail(`${posix(path.join(DIR, ".skills", entry.name, "SKILL.md"))} has no name or description`);
      const unquote = (s) => s[1].trim().replace(/^(["'])(.*)\1$/, "$2");
      return { dir: entry.name, name: unquote(name), description: unquote(description) };
    })
    .sort((a, b) => (a.name < b.name ? -1 : 1));
}

function instructionsText(pirl) {
  const header = [
    `<!-- Generated by ${PACKAGE} from ${DIR}/AGENTS.md and ${DIR}/CONTEXT.md. Do not edit by hand: edit those files, then run \`node ${DIR}/bin/pirl.mjs sync\`. -->`,
    "",
    `# PIRL, installed in \`${DIR}/\``,
    "",
    `The PIRL framework is installed in \`${DIR}/\`, and the text below is its \`AGENTS.md\` followed by its \`CONTEXT.md\`.`,
    `The Hub root that the text names is \`${DIR}/\`: every relative path and link in it resolves from \`${DIR}/\`, not from the folder the session was opened in.`,
    `The folder that holds \`${DIR}/\` is the workspace.`,
    "",
  ].join("\n");
  const agents = readText(path.join(pirl, "AGENTS.md"));
  const context = readText(path.join(pirl, "CONTEXT.md"));
  if (agents === null || context === null) fail(`${DIR}/AGENTS.md or ${DIR}/CONTEXT.md is missing`);
  return `${header}\n${agents.trimEnd()}\n\n${context.trimEnd()}\n`;
}

function skillText(skill) {
  return [
    "---",
    `name: ${skill.name}`,
    `description: ${JSON.stringify(skill.description)}`,
    "---",
    "",
    `<!-- Generated by ${PACKAGE}. Do not edit by hand: run \`node ${DIR}/bin/pirl.mjs sync\` after ${DIR}/.skills changes. -->`,
    "",
    `This skill belongs to the PIRL framework installed in \`${DIR}/\`.`,
    `Read \`${DIR}/.skills/${skill.dir}/SKILL.md\` and follow it; relative paths in that file resolve from its own folder.`,
    "",
  ].join("\n");
}

// The adapter files and blocks the given hosts need, from the current content of `.pirl/`.
function desiredAdapters(pirl, hosts) {
  const files = {};
  const blocks = {};
  const instructions = instructionsText(pirl);
  const skills = skillsOf(pirl);
  for (const id of hosts) {
    const host = HOSTS[id];
    if (host.instructions.kind === "file") files[host.instructions.path] = host.instructions.frontmatter + instructions;
    else blocks[host.instructions.path] = instructions;
    for (const skill of skills) files[`${host.skills}/${skill.name}/SKILL.md`] = skillText(skill);
  }
  return { files, blocks };
}

function findBlock(text) {
  const start = text.indexOf(BEGIN);
  const end = text.indexOf(END);
  if (start === -1 && end === -1) return null;
  if (start === -1 || end < start) return { broken: true };
  return { start, end: end + END.length, content: text.slice(start + BEGIN.length, end).replace(/^\n/, "").replace(/\n$/, "") };
}

// Plans every change needed to make the workspace match `desired`, refusing to touch what PIRL did not create
// or what was edited by hand (unless --force). Nothing is written when a conflict is found.
function planAdapters(ws, manifest, desired, force) {
  const writes = [];
  const removes = [];
  const conflicts = [];
  const adapters = {};
  const blocks = {};

  for (const [rel, content] of Object.entries(desired.files)) {
    const file = path.join(ws, rel);
    const current = read(file);
    const recorded = manifest.adapters[rel];
    if (current !== null && recorded === undefined && sha(current) !== sha(content)) {
      conflicts.push(`${rel}: exists and was not created by ${PACKAGE}; move or remove it`);
      continue;
    }
    if (current !== null && recorded !== undefined && sha(current) !== recorded && sha(current) !== sha(content) && !force) {
      conflicts.push(`${rel}: edited by hand; pass --force to overwrite it`);
      continue;
    }
    if (current === null || sha(current) !== sha(content)) writes.push({ file, data: content });
    adapters[rel] = sha(content);
  }
  for (const [rel, recorded] of Object.entries(manifest.adapters)) {
    if (rel in desired.files) continue;
    const file = path.join(ws, rel);
    const current = read(file);
    if (current === null) continue;
    if (sha(current) !== recorded && !force) {
      conflicts.push(`${rel}: edited by hand; pass --force to remove it`);
      adapters[rel] = recorded;
    } else {
      removes.push(file);
    }
  }

  const blockFiles = new Set([...Object.keys(desired.blocks), ...Object.keys(manifest.blocks)]);
  for (const rel of blockFiles) {
    const file = path.join(ws, rel);
    const text = readText(file);
    const block = text === null ? null : findBlock(text);
    const recorded = manifest.blocks[rel];
    const wanted = desired.blocks[rel];
    if (block && block.broken) {
      conflicts.push(`${rel}: the ${BEGIN} / ${END} markers are incomplete; repair them by hand`);
      continue;
    }
    if (block && !recorded) {
      conflicts.push(`${rel}: holds a PIRL block that ${PACKAGE} did not record; remove the block by hand`);
      continue;
    }
    if (block && recorded && sha(block.content) !== recorded.hash && (wanted === undefined || sha(block.content) !== sha(wanted)) && !force) {
      conflicts.push(`${rel}: the PIRL block was edited by hand; pass --force to replace it`);
      blocks[rel] = recorded;
      continue;
    }
    if (wanted !== undefined) {
      const piece = `${BEGIN}\n${wanted}\n${END}`;
      let next;
      if (block) next = text.slice(0, block.start) + piece + text.slice(block.end);
      else if (text === null || text.trim() === "") next = `${piece}\n`;
      else next = `${text.trimEnd()}\n\n${piece}\n`;
      if (next !== text) writes.push({ file, data: next });
      blocks[rel] = { hash: sha(wanted), created: recorded ? recorded.created : text === null };
    } else if (block) {
      const rest = (text.slice(0, block.start).trimEnd() + "\n\n" + text.slice(block.end).trimStart()).trim();
      if (rest === "" && recorded.created) removes.push(file);
      else writes.push({ file, data: `${rest}\n` });
    }
  }
  return { writes, removes, conflicts, adapters, blocks };
}

function applyAdapters(ws, pirl, manifest, hosts, opts) {
  const plan = planAdapters(ws, manifest, desiredAdapters(pirl, hosts), opts.force);
  if (plan.conflicts.length) fail(`nothing was changed; resolve these first:\n  ${plan.conflicts.join("\n  ")}`);
  for (const { file, data } of plan.writes) write(file, data);
  for (const file of plan.removes) removeFile(file, ws);
  manifest.hosts = hosts;
  manifest.adapters = plan.adapters;
  manifest.blocks = plan.blocks;
  writeManifest(pirl, manifest);
  return plan;
}

function warnPersonalSkills(pirl) {
  const home = os.homedir();
  for (const skill of skillsOf(pirl)) {
    for (const dir of PERSONAL_SKILLS) {
      if (fs.existsSync(path.join(home, dir, skill.name))) {
        console.warn(`warning: ~/${dir}/${skill.name} exists; a host may use that personal skill instead of the PIRL one.`);
      }
    }
  }
}

function warnPython() {
  for (const cmd of [["python3", "--version"], ["python", "--version"], ["py", "-3", "--version"]]) {
    const result = spawnSync(cmd[0], cmd.slice(1), { encoding: "utf8" });
    const match = `${result.stdout || ""}${result.stderr || ""}`.match(/Python (\d+)\.(\d+)/);
    if (result.status === 0 && match && (Number(match[1]) > 3 || (Number(match[1]) === 3 && Number(match[2]) >= 9))) return;
  }
  console.warn("warning: Python 3.9 or later was not found; the PIRL validator, record tool and skill scripts need it.");
}

// ---------- commands ----------

async function init(opts) {
  const ws = workspaceOf(opts);
  const pirl = path.join(ws, DIR);
  let manifest = readManifest(pirl);
  let installedNow = false;
  // An installed copy can add hosts to its own workspace, but only the package can install.
  if (!manifest && INSTALLED) fail(`init runs from the package: npx ${PACKAGE} init`);
  if (!manifest) await checkWorkspace(ws, opts);
  if (!manifest && fs.existsSync(pirl)) fail(`${pirl} exists but has no ${MANIFEST}, so it was not installed by ${PACKAGE}; move it away, then run again`);
  const hosts = [...new Set([...(manifest ? manifest.hosts : []), ...(await chooseHosts(ws, opts, manifest ? manifest.hosts : []))])];
  if (!manifest) {
    const files = frameworkFiles(SOURCE);
    if (!files.includes(".gitignore")) fail("the package has no .gitignore; it is needed to keep Plans and records out of Git");
    for (const file of files) write(path.join(pirl, file), fs.readFileSync(sourcePath(SOURCE, file)));
    manifest = { package: PACKAGE, version: packageVersion(), files: {}, hosts: [], adapters: {}, blocks: {} };
    for (const file of files) manifest.files[file] = sha(fs.readFileSync(sourcePath(SOURCE, file)));
    writeManifest(pirl, manifest);
    installedNow = true;
  }
  let plan;
  try {
    plan = applyAdapters(ws, pirl, manifest, hosts, opts);
  } catch (error) {
    // A first install that cannot place its adapters leaves nothing behind.
    if (installedNow) fs.rmSync(pirl, { recursive: true, force: true });
    throw error;
  }
  warnPersonalSkills(pirl);
  warnPython();
  console.log(`${installedNow ? "Installed" : "Kept"} PIRL ${manifest.version} in ${DIR}/; hosts: ${hosts.join(", ")}; ${plan.writes.length} adapter file(s) written.`);
  console.log(`Commit ${DIR}/ and the adapter files with your repository; Git keeps Plans, reports and records out through ${DIR}/.gitignore.`);
}

async function remove(opts) {
  const ws = workspaceOf(opts);
  const pirl = path.join(ws, DIR);
  const manifest = readManifest(pirl) || fail(`PIRL is not installed in ${ws}`);
  let gone = opts.host;
  if (!gone) {
    if (!interactive()) fail("--host is required when there is no interactive terminal");
    gone = (await ask(`Hosts to remove, comma-separated (installed: ${manifest.hosts.join(", ")}): `)).split(",").map((h) => h.trim()).filter(Boolean);
    for (const host of gone) if (!HOSTS[host]) fail(`unknown host: ${host}`);
  }
  const plan = applyAdapters(ws, pirl, manifest, manifest.hosts.filter((h) => !gone.includes(h)), opts);
  console.log(`Removed ${plan.removes.length} adapter file(s); hosts left: ${manifest.hosts.join(", ") || "none"}. ${DIR}/ is kept; delete it by hand to remove PIRL completely.`);
}

function sync(opts) {
  const ws = workspaceOf(opts);
  const pirl = path.join(ws, DIR);
  const manifest = readManifest(pirl) || fail(`PIRL is not installed in ${ws}`);
  const plan = applyAdapters(ws, pirl, manifest, manifest.hosts, opts);
  console.log(`Adapters in sync: ${plan.writes.length} file(s) written, ${plan.removes.length} removed.`);
}

function check(opts) {
  const ws = workspaceOf(opts);
  const pirl = path.join(ws, DIR);
  const manifest = readManifest(pirl);
  if (!manifest) {
    console.log(`PIRL is not installed in ${ws}; nothing to check.`);
    return;
  }
  const plan = planAdapters(ws, manifest, desiredAdapters(pirl, manifest.hosts), false);
  const stale = [...plan.writes.map((w) => posix(path.relative(ws, w.file))), ...plan.removes.map((f) => posix(path.relative(ws, f)))];
  if (plan.conflicts.length || stale.length) {
    fail(`adapters are out of date (run \`node ${DIR}/bin/pirl.mjs sync\`):\n  ${[...plan.conflicts, ...stale].join("\n  ")}`);
  }
  console.log(`Adapters are up to date for: ${manifest.hosts.join(", ") || "no host"}.`);
}

function status(opts) {
  const ws = workspaceOf(opts);
  const pirl = path.join(ws, DIR);
  const manifest = readManifest(pirl);
  if (!manifest) {
    console.log(`PIRL is not installed in ${ws}.`);
    return null;
  }
  const changed = localChanges(pirl, manifest);
  console.log(`PIRL ${manifest.version} in ${pirl}`);
  console.log(`Hosts: ${manifest.hosts.join(", ") || "none"}`);
  console.log(`Framework files changed since install or update: ${changed.length ? changed.join(", ") : "none"}`);
  if (fs.existsSync(path.join(pirl, UPDATE, "state.json"))) console.log(`An update is waiting: resolve the conflicts, then run update --continue.`);
  return manifest;
}

// ---------- update ----------

function untar(buffer, dest) {
  const data = zlib.gunzipSync(buffer);
  const text = (from, length) => data.toString("utf8", from, from + length).replace(/\0.*$/s, "");
  let offset = 0;
  let longName = null;
  while (offset + 512 <= data.length) {
    if (data.subarray(offset, offset + 512).every((b) => b === 0)) break;
    const size = parseInt(text(offset + 124, 12).trim() || "0", 8);
    const type = String.fromCharCode(data[offset + 156]);
    const prefix = text(offset + 345, 155);
    let name = longName || (prefix ? `${prefix}/${text(offset, 100)}` : text(offset, 100));
    longName = null;
    const body = data.subarray(offset + 512, offset + 512 + size);
    if (type === "x") {
      const pax = body.toString("utf8").match(/\d+ path=([^\n]*)\n/);
      if (pax) longName = pax[1];
    } else if (type === "0" || type === "\0") {
      const target = path.resolve(dest, name);
      if (!target.startsWith(path.resolve(dest) + path.sep)) fail(`unsafe path in package: ${name}`);
      write(target, body);
    }
    offset += 512 + Math.ceil(size / 512) * 512;
  }
}

// Downloads the installed version from the registry, to use as the common base of a three-way merge.
function fetchBase(version, temp) {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const result = spawnSync(npm, ["pack", `${PACKAGE}@${version}`, "--pack-destination", temp, "--silent"], {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  const tarball = result.status === 0 && result.stdout.trim().split(/\r?\n/).pop();
  if (!tarball || !fs.existsSync(path.join(temp, tarball))) return null;
  untar(fs.readFileSync(path.join(temp, tarball)), path.join(temp, "base"));
  return path.join(temp, "base", "package");
}

function mergeFile(local, base, upstream, version, temp) {
  const files = ["local", "base", "upstream"].map((n) => path.join(temp, `merge-${n}`));
  [local, base, upstream].forEach((data, i) => fs.writeFileSync(files[i], data));
  const result = spawnSync("git", ["merge-file", "-p", "-L", "local", "-L", "installed", "-L", `${PACKAGE}@${version}`, ...files], { maxBuffer: 64 * 1024 * 1024 });
  if (result.status === null || result.status < 0 || result.status > 127) fail(`git merge-file failed: ${result.stderr}`);
  return { data: result.stdout, clean: result.status === 0 };
}

function applyStaged(pirl, state) {
  const stage = path.join(pirl, UPDATE, "files");
  const deletes = [...state.deletes];
  for (const file of state.writes) {
    const data = fs.readFileSync(path.join(stage, file));
    // An emptied conflict copy means the file is to be deleted.
    if (state.conflicts.includes(file) && data.toString("utf8").trim() === "") deletes.push(file);
    else write(path.join(pirl, file), data);
  }
  for (const file of deletes) removeFile(path.join(pirl, file), pirl);
  const manifest = readManifest(pirl);
  manifest.version = state.version;
  manifest.files = state.upstream;
  writeManifest(pirl, manifest);
  fs.rmSync(path.join(pirl, UPDATE), { recursive: true, force: true });
  return manifest;
}

async function update(opts) {
  const ws = workspaceOf(opts);
  const pirl = path.join(ws, DIR);
  let manifest = readManifest(pirl) || fail(`PIRL is not installed in ${ws}; run init first`);
  const statePath = path.join(pirl, UPDATE, "state.json");

  if (opts.continue) {
    const state = JSON.parse(readText(statePath) || fail("no update is waiting"));
    const unresolved = state.conflicts.filter((f) => /^(<{7}|>{7}) /m.test(fs.readFileSync(path.join(pirl, UPDATE, "files", f), "utf8")));
    if (unresolved.length) fail(`conflict markers remain in:\n  ${unresolved.map((f) => posix(path.join(DIR, UPDATE, "files", f))).join("\n  ")}`);
    manifest = applyStaged(pirl, state);
    applyAdapters(ws, pirl, manifest, manifest.hosts, opts);
    console.log(`Updated PIRL to ${manifest.version}.`);
    return;
  }
  if (INSTALLED) fail(`update runs from the new package: npx ${PACKAGE}@latest update`);
  if (fs.existsSync(statePath)) fail(`an update is already waiting; resolve it and run update --continue, or delete ${DIR}/${UPDATE}/`);
  const version = packageVersion();
  if (version === manifest.version && !opts.force) {
    applyAdapters(ws, pirl, manifest, manifest.hosts, opts);
    console.log(`PIRL ${version} is already installed; adapters are in sync.`);
    return;
  }

  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "pirl-update-"));
  try {
    const base = opts.baseDir ? path.resolve(opts.baseDir) : fetchBase(manifest.version, temp);
    if (!base) console.warn(`warning: could not download ${PACKAGE}@${manifest.version}; files changed on both sides become conflicts.`);
    const files = frameworkFiles(SOURCE);
    const upstream = Object.fromEntries(files.map((f) => [f, sha(fs.readFileSync(sourcePath(SOURCE, f)))]));
    const state = { version, upstream, writes: [], deletes: [], conflicts: [] };
    const stage = path.join(pirl, UPDATE, "files");
    for (const file of [...new Set([...files, ...Object.keys(manifest.files)])].sort()) {
      const local = read(path.join(pirl, file));
      const next = file in upstream ? fs.readFileSync(sourcePath(SOURCE, file)) : null;
      const recorded = manifest.files[file];
      const localChanged = recorded ? local === null || sha(local) !== recorded : local !== null;
      const upstreamChanged = recorded ? next === null || sha(next) !== recorded : next !== null;
      if (!upstreamChanged) continue;
      if (!localChanged || (local !== null && next !== null && local.equals(next))) {
        if (next === null) state.deletes.push(file);
        else {
          write(path.join(stage, file), next);
          state.writes.push(file);
        }
        continue;
      }
      const baseData = base ? read(sourcePath(base, file)) : null;
      if (local !== null && next !== null && baseData !== null) {
        const merged = mergeFile(local, baseData, next, version, temp);
        write(path.join(stage, file), merged.data);
        state.writes.push(file);
        if (!merged.clean) state.conflicts.push(file);
      } else {
        // A deletion against a change, or no base to merge from: the user decides from both versions.
        const note = `<<<<<<< local\n${local === null ? "(deleted locally)\n" : local.toString("utf8")}=======\n${next === null ? `(deleted in ${PACKAGE}@${version})\n` : next.toString("utf8")}>>>>>>> ${PACKAGE}@${version}\n`;
        write(path.join(stage, file), note);
        state.writes.push(file);
        state.conflicts.push(file);
      }
    }
    if (state.conflicts.length) {
      write(statePath, JSON.stringify(state, null, 2) + "\n");
      fail(
        `nothing was changed in ${DIR}/ yet. These files changed both locally and in ${version}; edit each staged copy until it holds the wanted content without conflict markers (empty a copy to delete that file), then run \`npx ${PACKAGE}@${version} update --continue\`:\n  ` +
          state.conflicts.map((f) => posix(path.join(DIR, UPDATE, "files", f))).join("\n  "),
        2,
      );
    }
    manifest = applyStaged(pirl, state);
    applyAdapters(ws, pirl, manifest, manifest.hosts, opts);
    console.log(`Updated PIRL to ${version}; ${state.writes.length} file(s) changed, ${state.deletes.length} removed.`);
  } finally {
    fs.rmSync(temp, { recursive: true, force: true });
  }
}

async function menu(opts) {
  const manifest = status(opts);
  if (!interactive()) return;
  const answer = await ask("1. Add hosts  2. Update  3. Remove hosts  Enter: quit > ");
  if (answer === "1") return init(opts);
  if (answer === "2") return update(opts);
  if (answer === "3") return remove(opts);
  return manifest;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const command = opts.command || (readManifest(path.join(workspaceOf(opts), DIR)) ? "menu" : "init");
  const commands = {
    help: () => console.log(USAGE),
    version: () => console.log(packageVersion()),
    init,
    update,
    remove,
    sync,
    check,
    status,
    menu,
  };
  if (!commands[command]) fail(`unknown command: ${command}\n\n${USAGE}`);
  await commands[command](opts);
}

main().catch((error) => {
  if (!(error instanceof Failure)) throw error;
  console.error(`${PACKAGE}: ${error.message}`);
  process.exitCode = error.code;
});
