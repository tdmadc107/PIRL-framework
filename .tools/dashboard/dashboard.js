#!/usr/bin/env node
// Terminal dashboard for the PIRL Hub ("mission control"): state of the Claude Code sessions
// (context, 5h/7d quota, what they are doing), files changing according to git in the Hub and
// every submodule `.repos/*`, the framework's Plan/Review progress, and a live event log:
// new/modified/deleted files via fs.watch, stage/unstage, commits and branch switches via git.
//
// Run:    node .tools/dashboard/dashboard.js [--interval 10] [--max-age 12] [--files 10] [--agents 2] [--plans 6]
//   --interval  seconds between two git scans (default 10)
//   --max-age   only show Claude sessions updated in the last N hours (default 12)
//   --files     maximum number of files shown per repository (default 10)
//   --agents    number of most recent Claude sessions shown in the AGENTS panel (default 2)
//   --plans     number of most recent Plan tasks shown in the PLAN · REVIEW panel (default 6)
//   --no-intro  skip the boot screen
//   --once      print one frame to stdout and exit (does not take over the screen)
//   --rows N    with --once: build the frame for an N-row terminal (to check the compact layout)
// Keys: q or Ctrl+C to quit, r to rescan immediately, any other key skips the boot screen.
// Requires a terminal with 24-bit color (Windows Terminal, VS Code).
//
// AI data comes from the snapshot that ~/.claude/statusline-command.sh writes to
// ~/.claude/dashboard/sessions/<session_id>.json each time the status line updates, plus the
// end of the session transcript to tell whether the session is running a tool, thinking or waiting for you.

'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFile } = require('child_process');

const HUB = path.resolve(__dirname, '..', '..');
const PLAN_DIR = path.join(HUB, '.agents', 'plan');
const MANIFEST = path.join(HUB, '.repos', 'manifest.yaml');
const REVIEW_DIR = path.join(HUB, '.agents', 'review');
const SESSION_DIR = path.join(os.homedir(), '.claude', 'dashboard', 'sessions');

const args = parseArgs(process.argv.slice(2));
const INTERVAL_MS = Math.max(1, Number(args.interval) || 10) * 1000;
const MAX_AGE_H = Math.max(0.1, Number(args['max-age']) || 12);
const MAX_FILES = Math.max(1, Number(args.files) || 10);
const MAX_AGENTS = Math.max(1, Number(args.agents) || 2);
const MAX_PLANS = Math.max(1, Number(args.plans) || 6);
const EVENT_RING = 400;
const ONCE = Boolean(args.once);
const ONCE_ROWS = Number(args.rows) > 0 ? Math.max(12, Number(args.rows)) : null;
const RECENT_MS = 60 * 1000;
const FRAME_MS = 100;
const START = Date.now();
const INTRO_MS = 2500;

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) continue;
    const [k, v] = a.slice(2).split('=');
    out[k] = v !== undefined ? v : argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return out;
}

// ---------- git ----------

function git(cwd, gitArgs) {
  return new Promise(resolve => {
    execFile('git', ['--no-optional-locks', '-c', 'core.quotepath=off', '-C', cwd, ...gitArgs],
      { maxBuffer: 16 * 1024 * 1024, windowsHide: true },
      (err, stdout) => resolve(err ? null : stdout));
  });
}

// Reads `repos.<id>.path` from .repos/manifest.yaml (the framework's YAML subset, two-space indentation).
// An entry without `path` is kept with a null value so the registration error can be reported.
function manifestRepos() {
  let text;
  try { text = fs.readFileSync(MANIFEST, 'utf8'); } catch { return new Map(); }
  const unquote = s => s.trim().replace(/^["']|["']$/g, '');
  const out = new Map();
  let inRepos = false;
  let id = null;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.trimStart().startsWith('#')) continue;
    const indent = raw.length - raw.trimStart().length;
    const line = raw.trim();
    if (indent === 0) { inRepos = /^repos\s*:/.test(line); id = null; continue; }
    if (!inRepos) continue;
    if (indent === 2) {
      const m = line.match(/^([^:]+):\s*$/);
      id = m ? unquote(m[1]) : null;
      if (id) out.set(id, null);
    } else if (indent === 4 && id) {
      const m = line.match(/^path\s*:\s*(.+)$/);
      if (m) out.set(id, unquote(m[1]).replace(/\\/g, '/').replace(/\/+$/, '') || null);
    }
  }
  return out;
}

// The Hub plus the union of submodules in `.gitmodules` and repositories in the manifest, matched by path.
// A repository is registered when it has both (AGENTS.md, Repository routing section); missing one is partial.
function listRepos() {
  const repos = [{ name: 'Hub', dir: HUB, submodule: true, ids: [] }];
  const byPath = new Map();
  let text = '';
  try { text = fs.readFileSync(path.join(HUB, '.gitmodules'), 'utf8'); } catch { /* no submodules yet */ }
  for (const m of text.matchAll(/^\s*path\s*=\s*(.+?)\s*$/gm)) {
    const p = m[1].replace(/\\/g, '/').replace(/\/+$/, '');
    byPath.set(p, { name: p, submodule: true, ids: [] });
  }
  manifestIssues = [];
  for (const [id, p] of manifestRepos()) {
    if (!p) { manifestIssues.push(`entry ${id} in .repos/manifest.yaml has no path`); continue; }
    if (!byPath.has(p)) byPath.set(p, { name: p, submodule: false, ids: [] });
    byPath.get(p).ids.push(id);
  }
  for (const r of byPath.values()) repos.push({ ...r, dir: path.join(HUB, r.name) });
  return repos;
}

// Why a repository is not fully registered, or '' when it is.
function registryIssue(r) {
  if (r.name === 'Hub') return '';
  if (!r.ids.length) return 'submodule has no entry in .repos/manifest.yaml';
  if (r.ids.length > 1) return `several manifest entries share the path (${r.ids.join(', ')})`;
  if (!r.submodule) return `manifest entry ${r.ids[0]} points to a path that is not a submodule in .gitmodules`;
  if (r.absent) return 'submodule not cloned (git submodule update --init)';
  return '';
}

// Porcelain v2: "1 XY ..." (changed), "2 XY ... path\torig" (renamed), "u XY ..." (conflict), "? path".
function parseStatus(out) {
  const info = { branch: '', ahead: 0, behind: 0, upstream: false, files: [] };
  for (const line of out.split('\n')) {
    if (!line) continue;
    if (line.startsWith('# branch.head ')) info.branch = line.slice(14);
    else if (line.startsWith('# branch.upstream ')) info.upstream = true;
    else if (line.startsWith('# branch.ab ')) {
      const m = line.match(/\+(\d+) -(\d+)/);
      if (m) { info.ahead = +m[1]; info.behind = +m[2]; }
    } else if (line.startsWith('? ')) info.files.push({ xy: '??', path: line.slice(2) });
    else if (line.startsWith('1 ')) {
      const p = line.split(' ');
      info.files.push({ xy: p[1], path: p.slice(8).join(' ') });
    } else if (line.startsWith('2 ')) {
      const [head, orig] = line.split('\t');
      const p = head.split(' ');
      info.files.push({ xy: p[1], path: p.slice(9).join(' '), orig });
    } else if (line.startsWith('u ')) {
      const p = line.split(' ');
      info.files.push({ xy: 'UU', path: p.slice(10).join(' ') });
    }
  }
  return info;
}

function parseNumstat(out) {
  const map = new Map();
  for (const line of (out || '').split('\n')) {
    const m = line.match(/^(\d+|-)\t(\d+|-)\t(.+)$/);
    if (!m) continue;
    // Renames show as "a => b" or "dir/{a => b}"; take the new path.
    const p = m[3].replace(/\{[^{}]* => ([^{}]*)\}/, '$1').replace(/^.* => /, '').replace(/\/\//g, '/');
    map.set(p, { add: m[1], del: m[2] });
  }
  return map;
}

async function scanRepo(repo) {
  // A directory without `.git` (a submodule not cloned, or a manifest path that does not exist yet) is
  // not scanned: `git -C` would walk up to the Hub and wrongly report the Hub's changes.
  if (repo.name !== 'Hub' && !fs.existsSync(path.join(repo.dir, '.git'))) return { ...repo, absent: true, files: [] };
  // The Hub ignores changes inside submodules because each submodule has its own block.
  const ignore = repo.name === 'Hub' ? ['--ignore-submodules=dirty'] : [];
  const [status, numstat, last] = await Promise.all([
    git(repo.dir, ['status', '--porcelain=v2', '--branch', '--untracked-files=all', ...ignore]),
    git(repo.dir, ['diff', 'HEAD', '--numstat', ...ignore]),
    git(repo.dir, ['log', '-1', '--format=%h%x09%ct%x09%s']),
  ]);
  if (status === null) return { ...repo, error: 'cannot read git status', files: [] };
  const info = parseStatus(status);
  const stats = parseNumstat(numstat);
  const now = Date.now();
  for (const f of info.files) {
    const s = stats.get(f.path);
    f.add = s ? s.add : '';
    f.del = s ? s.del : '';
    try { f.mtime = fs.statSync(path.join(repo.dir, f.path)).mtimeMs; } catch { f.mtime = 0; }
    f.recent = f.mtime && now - f.mtime < RECENT_MS;
  }
  info.files.sort((a, b) => b.mtime - a.mtime || a.path.localeCompare(b.path));
  if (last) {
    const [hash, ct, subject] = last.trim().split('\t');
    info.last = { hash, time: Number(ct) * 1000, subject };
  }
  return { ...repo, ...info };
}

// ---------- the framework's Plans and Reviews ----------

// Reads the top-level scalar keys of the frontmatter; enough for the pirl-plan/v1 and pirl-review/v1 schemas.
function frontmatter(file) {
  let text;
  try { text = fs.readFileSync(file, 'utf8'); } catch { return null; }
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim().replace(/^["']|["']$/g, '');
  }
  return fm;
}

function markdownFiles(dir) {
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return []; }
  return entries.flatMap(e => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? markdownFiles(p) : e.name.endsWith('.md') ? [p] : [];
  });
}

const mtimeOf = file => { try { return fs.statSync(file).mtimeMs; } catch { return 0; } };

// One line per Plan task, with its latest Review round.
function scanFramework() {
  const tasks = new Map();
  for (const file of markdownFiles(PLAN_DIR)) {
    const fm = frontmatter(file);
    if (!fm || !fm.task_id) continue;
    const set = fm.plan_set || path.basename(path.dirname(file));
    tasks.set(`${set}/${fm.task_id}`, {
      key: `${set}/${fm.task_id}`, set, id: fm.task_id, title: fm.title || '', status: fm.status || '?',
      mtime: mtimeOf(file), review: null,
    });
  }
  for (const file of markdownFiles(REVIEW_DIR)) {
    const fm = frontmatter(file);
    if (!fm || !fm.task_id || !fm.plan_file) continue;
    // plan_file has the form .agents/plan/<plan_set>/<file>.md
    const set = path.basename(path.dirname(fm.plan_file.replace(/\\/g, '/')));
    const task = tasks.get(`${set}/${fm.task_id}`);
    if (!task) continue;
    const round = Number(fm.review_round) || 0;
    const mtime = mtimeOf(file);
    task.mtime = Math.max(task.mtime, mtime);
    if (!task.review || round > task.review.round) {
      task.review = { round, verdict: fm.verdict || '?', status: fm.status || '?' };
    }
  }
  return [...tasks.values()].sort((a, b) => b.mtime - a.mtime || a.key.localeCompare(b.key));
}

// ---------- Claude sessions ----------

const META_TYPES = new Set(['mode', 'cost-state', 'last-prompt', 'attachment', 'atis-latch', 'ai-title',
  'file-history-snapshot', 'file-history-delta', 'permission-mode', 'pr-link', 'queue-operation',
  'agent-name', 'agent-color', 'agent-setting', 'continued-in', 'summary']);

function readTail(file, bytes) {
  const fd = fs.openSync(file, 'r');
  try {
    const size = fs.fstatSync(fd).size;
    const start = Math.max(0, size - bytes);
    const buf = Buffer.alloc(size - start);
    fs.readSync(fd, buf, 0, buf.length, start);
    const lines = buf.toString('utf8').split('\n');
    if (start > 0) lines.shift(); // the first line may be cut off
    return lines;
  } finally { fs.closeSync(fd); }
}

// Infers what the session is doing from the last meaningful entry of its transcript.
function activity(transcript) {
  if (!transcript) return null;
  let lines;
  try { lines = readTail(transcript, 256 * 1024); } catch { return null; }
  for (let i = lines.length - 1; i >= 0; i--) {
    let j;
    try { j = JSON.parse(lines[i]); } catch { continue; }
    if (META_TYPES.has(j.type) || j.isSidechain) continue;
    const since = j.timestamp ? Date.parse(j.timestamp) : 0;
    const content = j.message && j.message.content;
    if (j.type === 'assistant') {
      const stop = j.message.stop_reason;
      if (stop === 'end_turn' || stop === 'stop_sequence') return { state: 'idle', since };
      const tools = Array.isArray(content) ? content.filter(c => c.type === 'tool_use') : [];
      if (tools.length) return { state: 'tool', detail: tools.map(t => t.name).join(', '), since };
      return { state: 'thinking', since };
    }
    if (j.type === 'user') {
      if (typeof content === 'string' && content.startsWith('<command-name>')) return { state: 'idle', since };
      return { state: 'thinking', since };
    }
    if (j.type === 'system') {
      if (j.subtype === 'api_error') return { state: 'error', detail: 'API error, retrying', since };
      if (j.subtype === 'compact_boundary') return { state: 'thinking', detail: 'just compacted', since };
      return { state: 'idle', since };
    }
  }
  return null;
}

function loadSessions() {
  let names = [];
  try { names = fs.readdirSync(SESSION_DIR).filter(n => n.endsWith('.json')); } catch { return []; }
  const now = Date.now();
  const list = [];
  for (const name of names) {
    const file = path.join(SESSION_DIR, name);
    let st, data;
    try {
      st = fs.statSync(file);
      if (now - st.mtimeMs > MAX_AGE_H * 3600 * 1000) continue;
      data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch { continue; }
    let transcriptTime = 0;
    try { transcriptTime = fs.statSync(data.transcript_path).mtimeMs; } catch { /* the session has no transcript yet */ }
    list.push({
      id: data.session_id || name.slice(0, -5),
      data,
      updated: Math.max(st.mtimeMs, transcriptTime),
      snapshotTime: st.mtimeMs,
      act: activity(data.transcript_path),
    });
  }
  list.sort((a, b) => b.updated - a.updated);
  return list;
}

// ---------- colors and string width ----------

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const P = {
  neon: [0, 255, 156], cyan: [0, 220, 255], teal: [0, 170, 140], border: [0, 128, 106],
  text: [190, 255, 228], white: [235, 255, 246], muted: [95, 145, 128], faint: [45, 82, 70],
  amber: [255, 184, 0], red: [255, 62, 95], magenta: [255, 50, 190], violet: [160, 120, 255],
  green: [70, 255, 130], ink: [3, 14, 11], night: [0, 38, 30],
  blue: [90, 170, 255], orange: [255, 130, 60],
};
const fg = c => `\x1b[38;2;${c[0]};${c[1]};${c[2]}m`;
const bg = c => `\x1b[48;2;${c[0]};${c[1]};${c[2]}m`;
const paint = (c, s) => fg(c) + s + RESET;
const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * Math.max(0, Math.min(1, t))));
const heat = t => (t < 0.5 ? mix(P.neon, P.amber, t * 2) : mix(P.amber, P.red, (t - 0.5) * 2));
const pulse = (now, period) => (Math.sin((now / period) * 2 * Math.PI) + 1) / 2;
const badge = (c, s) => bg(c) + fg(P.ink) + BOLD + ` ${s} ` + RESET;

const ANSI_AT = /^\x1b\[[0-9;?]*[A-Za-z]/;
const ANSI_ALL = /\x1b\[[0-9;?]*[A-Za-z]/g;
const MARK = /\p{M}/u;

function vlen(s) {
  return Array.from(s.replace(ANSI_ALL, '').replace(/\p{M}/gu, '')).length;
}

// Truncates to a display width without breaking color codes.
function truncate(s, w) {
  if (w <= 0) return '';
  if (vlen(s) <= w) return s;
  let out = '', n = 0, i = 0;
  while (i < s.length) {
    if (s[i] === '\x1b') {
      const m = s.slice(i).match(ANSI_AT);
      if (m) { out += m[0]; i += m[0].length; continue; }
    }
    const ch = String.fromCodePoint(s.codePointAt(i));
    if (!MARK.test(ch)) {
      if (n >= w - 1) break;
      n++;
    }
    out += ch;
    i += ch.length;
  }
  return out + RESET + '…';
}

function pad(s, w) {
  const t = truncate(s, w);
  return t + RESET + ' '.repeat(Math.max(0, w - vlen(t)));
}

// Left part aligned left and right part aligned right, on one line of width w.
function lr(left, right, w) {
  const rl = vlen(right);
  if (rl >= w) return truncate(right, w);
  let l = left;
  if (vlen(l) > w - rl - 1) l = truncate(l, w - rl - 1);
  return l + RESET + ' '.repeat(Math.max(0, w - vlen(l) - rl)) + right;
}

function center(s, w) {
  const t = truncate(s, w);
  const left = Math.floor((w - vlen(t)) / 2);
  return ' '.repeat(Math.max(0, left)) + t;
}

// ---------- time and number formatting ----------

const two = n => String(n).padStart(2, '0');
function hms(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${two(Math.floor(s / 3600))}:${two(Math.floor((s % 3600) / 60))}:${two(s % 60)}`;
}
function ago(ms) {
  if (!ms) return '?';
  const s = Math.max(0, Math.round((Date.now() - ms) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h${two(Math.floor((s % 3600) / 60))}`;
  return `${Math.floor(s / 86400)}d`;
}
function clock(ms) {
  const d = new Date(ms);
  return `${two(d.getHours())}:${two(d.getMinutes())}:${two(d.getSeconds())}`;
}
function stamp(ms) {
  const d = new Date(ms);
  return `${two(d.getHours())}:${two(d.getMinutes())} ${two(d.getDate())}/${two(d.getMonth() + 1)}`;
}
function toMs(t) {
  if (t === undefined || t === null || t === '') return 0;
  if (typeof t === 'number') return t < 1e12 ? t * 1000 : t;
  const n = Number(t);
  if (!Number.isNaN(n)) return toMs(n);
  return Date.parse(t) || 0;
}
function fmtTokens(n) {
  if (!n && n !== 0) return '?';
  return n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n);
}

// ---------- HUD components ----------

const FONT = {
  A: ['▄▀█', '█▀█'], G: ['█▀▀', '█▄█'], E: ['█▀▀', '██▄'], N: ['█▄ █', '█ ▀█'], T: ['▀█▀', ' █ '],
  I: ['█', '█'], C: ['█▀▀', '█▄▄'], S: ['█▀', '▄█'], D: ['█▀▄', '█▄▀'], L: ['█  ', '█▄▄'],
  H: ['█ █', '█▀█'], U: ['█ █', '█▄█'], B: ['█▄▄', '█▄█'], P: ['█▀█', '█▀▀'], R: ['█▀█', '█▀▄'], ' ': ['  ', '  '],
};
const BANNER = (() => {
  const rows = ['', ''];
  [...'PIRL HUB'].forEach((ch, i) => {
    const g = FONT[ch];
    rows[0] += (i ? ' ' : '') + g[0];
    rows[1] += (i ? ' ' : '') + g[1];
  });
  return rows;
})();
const SMALL_TITLE = 'PIRL//HUB';

// Text graded from cyan to neon, with a sweeping highlight and an occasional one-beat glitch.
function shimmer(text, now) {
  const chars = [...text];
  const w = chars.length;
  const pos = ((now / 16) % (w + 40)) - 20;
  const glitch = now % 7000 < 140;
  let out = '';
  chars.forEach((ch, x) => {
    if (ch === ' ') { out += ' '; return; }
    let c = mix(P.cyan, P.neon, x / w);
    const d = Math.abs(x - pos);
    if (d < 5) c = mix(c, P.white, 1 - d / 5);
    let glyph = ch;
    if (glitch && Math.random() < 0.08) { glyph = '▓'; c = P.magenta; }
    out += fg(c) + glyph;
  });
  return out + RESET;
}

// A bar colored by position (green, amber, red).
function gbar(pct, w) {
  const p = Math.max(0, Math.min(100, pct || 0));
  const filled = Math.round((p / 100) * w);
  let s = '';
  for (let i = 0; i < w; i++) {
    if (i < filled) s += fg(heat(w > 1 ? i / (w - 1) : 0)) + '█';
    else s += fg(P.faint) + '░';
  }
  return s + RESET;
}

// Padding rows above and below panel content; turned off on short terminals to leave room for data.
let PADY = 1;
const frame = () => 2 + 2 * PADY;

function panel(title, body, w, o = {}) {
  const b = fg(P.border);
  const iw = w - 4;
  let lines = body;
  if (o.max !== undefined && lines.length > o.max) {
    const keep = Math.max(0, o.max - 1);
    lines = o.max <= 0 ? [] : lines.slice(0, keep).concat(paint(P.muted, `… +${body.length - keep} lines, enlarge the terminal to see them`));
  }
  if (o.fill && o.max !== undefined) lines = lines.concat(Array(Math.max(0, o.max - lines.length)).fill(''));
  const head = `${b}╭─[ ${RESET}${fg(P.neon)}${BOLD}${title}${RESET}${b} ]`;
  const tail = o.tag ? ` ${RESET}${o.tag}${b} ─╮` : '─╮';
  const top = head + '─'.repeat(Math.max(0, w - vlen(head) - vlen(tail))) + tail + RESET;
  const padding = Array(PADY).fill(`${b}│${RESET}${' '.repeat(w - 2)}${b}│${RESET}`);
  const out = [vlen(top) > w ? `${b}╭${'─'.repeat(w - 2)}╮${RESET}` : top, ...padding];
  for (const l of lines) out.push(`${b}│${RESET} ${pad(l, iw)} ${b}│${RESET}`);
  out.push(...padding, `${b}╰${'─'.repeat(w - 2)}╯${RESET}`);
  return out;
}

const SPIN = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
const STATES = {
  tool: { col: P.amber, code: 'EXEC' },
  thinking: { col: P.cyan, code: 'THINK' },
  idle: { col: P.teal, code: 'STANDBY' },
  error: { col: P.red, code: 'FAULT' },
};
const KINDS = {
  NEW: P.green, MOD: P.amber, DEL: P.red, CLEAR: P.muted, STAGE: P.teal, UNSTAGE: P.muted,
  COMMIT: P.violet, BRANCH: P.magenta, AGENT: P.cyan, SYS: P.neon, PLAN: P.blue, REVIEW: P.orange,
  REPO: P.white, WARN: P.red,
};

// ---------- state ----------

let repoState = [];
let manifestIssues = []; // errors in the manifest itself (entries without path), recorded by listRepos
let reportedManifestIssues = new Set();
let planState = [];
let planLoaded = false;
let sessions = [];
let scanning = false;
let scanError = '';
const events = [];
let eventTotal = 0;
let introUntil = 0;

function pushEvent(kind, text) {
  events.unshift({ kind, text, at: Date.now() });
  eventTotal++;
  if (events.length > EVENT_RING) events.length = EVENT_RING;
}

// Logs a batch of file events grouped by (repository, top-level directory, kind): groups of up to BURST
// files get one line each, larger groups one line with a count, so installs or a bulk `git add` do not flood the log.
const BURST = 3;
function pushGrouped(entries) {
  const groups = new Map();
  for (const e of entries) {
    const top = e.sub.includes('/') ? e.sub.slice(0, e.sub.indexOf('/') + 1) : '';
    const key = `${e.tag}|${top}|${e.kind}`;
    if (!groups.has(key)) groups.set(key, { ...e, top, items: [] });
    groups.get(key).items.push(e.label || e.sub);
  }
  for (const g of groups.values()) {
    if (g.items.length <= BURST) g.items.forEach(l => pushEvent(g.kind, `${g.tag}/${l}`));
    else pushEvent(g.kind, `${g.tag}/${g.top} ×${g.items.length} · ${g.items[0]}`);
  }
}

const shortName = name => (name === 'Hub' ? 'hub' : name.replace(/^\.repos\//, ''));

// Logs repository registration changes: manifest entries and submodules added or removed, plus a warning when a
// repository becomes partially registered (registryIssue). The first scan only reports partially registered repositories.
function diffRegistry(prev, next) {
  const prevMap = new Map(prev.map(r => [r.name, r]));
  const nextMap = new Map(next.map(r => [r.name, r]));
  for (const name of new Set([...prevMap.keys(), ...nextMap.keys()])) {
    const p = prevMap.get(name), r = nextMap.get(name);
    const tag = shortName(name);
    const before = p ? registryIssue(p) : '', after = r ? registryIssue(r) : '';
    if (prev.length) {
      const was = p || { ids: [], submodule: false }, now = r || { ids: [], submodule: false };
      for (const id of now.ids) if (!was.ids.includes(id)) pushEvent('REPO', `registered ${id} → ${name}`);
      for (const id of was.ids) if (!now.ids.includes(id)) pushEvent('REPO', `unregistered ${id} (${name})`);
      if (now.submodule && !was.submodule) pushEvent('REPO', `new submodule: ${tag}`);
      if (was.submodule && !now.submodule) pushEvent('REPO', `submodule removed: ${tag}`);
      if (r && !after && before) pushEvent('REPO', `${tag}: fully registered`);
    }
    if (after && after !== before) pushEvent('WARN', `${tag}: ${after}`);
  }
  for (const issue of manifestIssues) if (!reportedManifestIssues.has(issue)) pushEvent('WARN', issue);
  reportedManifestIssues = new Set(manifestIssues);
}

// Column X of porcelain v2 is the index state; '.' means nothing staged, and untracked files count the same.
// A path can have two lines (after `git rm --cached`: `D.` and `??`); the staged line wins.
function indexStates(files) {
  const states = new Map();
  for (const f of files) {
    const s = f.xy === '??' ? '.' : f.xy[0];
    if (s !== '.' || !states.has(f.path)) states.set(f.path, s);
  }
  return states;
}

// Compares two git scans to produce log events. Git owns commits, branches, repositories and
// staging/unstaging (which only change .git/index, so fs.watch does not see them). File events are only
// produced here when fs.watch is not running, and are grouped through pushGrouped like the watcher's events.
function diffRepos(prev, next) {
  if (!prev.length) {
    const dirty = next.filter(r => r.files.length);
    pushEvent('SYS', `baseline · ${next.length} repo · ${dirty.length} changed · ${dirty.reduce((n, r) => n + r.files.length, 0)} file`);
    diffRegistry(prev, next);
    return;
  }
  diffRegistry(prev, next);
  const prevMap = new Map(prev.map(r => [r.name, r]));
  for (const r of next) {
    const p = prevMap.get(r.name);
    if (!p || r.error || p.error || r.absent || p.absent) continue;
    const tag = shortName(r.name);
    if (p.branch !== r.branch) pushEvent('BRANCH', `${tag} ${p.branch} → ${r.branch}`);
    const committed = r.last && (!p.last || p.last.hash !== r.last.hash);
    if (committed) pushEvent('COMMIT', `${tag} ${r.last.hash} ${r.last.subject}`);
    const staging = [];
    const before = indexStates(p.files), after = indexStates(r.files);
    for (const [file, s] of after) {
      if ((before.get(file) || '.') !== s) staging.push({ kind: s === '.' ? 'UNSTAGE' : 'STAGE', tag, sub: file });
    }
    // Staged entries that left the change list without a commit were undone (reset, restore, stash).
    if (!committed) {
      for (const [file, s] of before) if (s !== '.' && !after.has(file)) staging.push({ kind: 'UNSTAGE', tag, sub: file });
    }
    pushGrouped(staging);
    if (!WATCHING) {
      // The key separates the `D.` and `??` lines of the same path; when the state switches between untracked
      // and tracked (staging a new file, `git rm --cached`) it still matches the old line, avoiding false NEW/CLEAR.
      const key = f => (f.xy === '??' ? '?' : '') + f.path;
      // `git rm --cached`: the file is still on disk and only the index changed, so STAGE/UNSTAGE already covers it.
      const indexOnly = files => new Set(files.filter(f => f.xy[0] === 'D' && f.mtime).map(f => f.path));
      const old = new Map(p.files.map(f => [key(f), f]));
      const nowIndexOnly = indexOnly(r.files), wasIndexOnly = indexOnly(p.files);
      const entries = [];
      for (const f of r.files) {
        const k = old.has(key(f)) ? key(f) : [f.path, '?' + f.path].find(x => old.has(x));
        const o = k && old.get(k);
        if (k) old.delete(k);
        if (nowIndexOnly.has(f.path)) continue;
        // Staging does not change file content, so only the file's modification time produces a file event.
        const kind = !f.mtime ? 'DEL' : f.xy === '??' || f.xy.includes('A') ? 'NEW' : 'MOD';
        if (!o) entries.push({ kind, tag, sub: f.path });
        else if (o.mtime !== f.mtime) entries.push({ kind: kind === 'NEW' ? 'MOD' : kind, tag, sub: f.path });
      }
      if (!committed) {
        const cleared = new Set([...old.values()].map(o => o.path).filter(x => !wasIndexOnly.has(x)));
        for (const x of cleared) entries.push({ kind: 'CLEAR', tag, sub: x });
      }
      pushGrouped(entries);
    }
  }
}

// Compares two Plan/Review reads to log task status transitions and Review conclusions.
function diffPlans(prev, next) {
  if (!planLoaded) {
    pushEvent('SYS', `baseline · ${next.length} Plan task · ${next.filter(t => t.review).length} reviewed`);
    return;
  }
  const old = new Map(prev.map(t => [t.key, t]));
  for (const t of next) {
    const o = old.get(t.key);
    old.delete(t.key);
    const tag = `${t.id} ${t.set}`;
    if (!o) { pushEvent('PLAN', `${tag} new · ${t.status}`); continue; }
    if (o.status !== t.status) pushEvent('PLAN', `${tag} ${o.status} → ${t.status}`);
    const a = o.review, b = t.review;
    if (b && (!a || a.round !== b.round || a.verdict !== b.verdict || a.status !== b.status)) {
      pushEvent('REVIEW', `${tag} R${b.round} ${b.verdict}${b.status === 'completed' ? '' : ` (${b.status})`}`);
    }
  }
  for (const o of old.values()) pushEvent('PLAN', `${o.id} ${o.set} removed`);
}

function refreshPlans() {
  const next = scanFramework();
  diffPlans(planState, next);
  planState = next;
  planLoaded = true;
}

// ---------- real-time file watching ----------

// A recursive fs.watch on the Hub root (including `.repos/*`) also sees paths ignored by Git and files created and
// deleted between two scans. File events are batched for FLUSH_MS, then logged through pushGrouped; .git/ is skipped.
const FLUSH_MS = 700;
// Minimum gap since the previous git scan: after a git state change, scan early to log
// stage/commit/branch; after a file change only the REPOSITORIES panel needs refreshing, so wait longer.
const GIT_GAP_MS = 500;
const FILE_GAP_MS = 3000;
const GIT_DEBOUNCE_MS = 200; // one git command writes the index, refs and log in a row; wait until done before scanning
// Stage, commit, reset and branch switches only write to the git directory and replace files by renaming a .lock
// file, so a file watcher can lose track of them (recursive fs.watch on Linux). The dashboard compares the stat of
// exactly these files every GIT_POLL_MS for each repository: a few stat calls, no git, and it runs without fs.watch too.
const GIT_POLL_MS = 500;
const GIT_STATE_FILES = ['index', 'HEAD', path.join('logs', 'HEAD')];
const gitDirs = new Map(); // repository directory -> git directory
const gitStamps = new Map(); // repository directory -> stat fingerprint of GIT_STATE_FILES
let WATCHING = false;
let lastScanAt = 0;
let flushTimer = null;
let scanTimer = null;
let scanTimerAt = 0;
let scanAgain = false;
const pendingFs = new Map(); // relative path -> { renames, changes }

// Schedules an event-driven git scan, no sooner than `delay` ms from now and at least `gap` ms after the previous scan.
// Requests collapse into a single timer; a request arriving during a scan is covered by exactly one scan afterwards,
// so no change is missed and git commands never overlap. The --interval cadence does not go through here.
function requestScan(gap, delay = 0) {
  if (scanning) { scanAgain = true; return; }
  const at = Math.max(Date.now() + delay, lastScanAt + gap);
  if (scanTimer && scanTimerAt <= at) return;
  clearTimeout(scanTimer);
  scanTimerAt = at;
  scanTimer = setTimeout(() => {
    scanTimer = null;
    if (scanning) scanAgain = true; else scan();
  }, at - Date.now());
}

function repoTagFor(rel) {
  for (const r of repoState) {
    if (r.name !== 'Hub' && rel.startsWith(r.name + '/')) return { tag: shortName(r.name), sub: rel.slice(r.name.length + 1) };
  }
  return { tag: 'hub', sub: rel };
}

function onFsEvent(evt, filename) {
  if (!filename) return;
  const rel = String(filename).replace(/\\/g, '/');
  if (rel === '.git' || rel.startsWith('.git/') || rel.includes('/.git/') || rel.endsWith('/.git')) return;
  const p = pendingFs.get(rel) || { renames: 0, changes: 0 };
  if (evt === 'rename') p.renames++; else p.changes++;
  pendingFs.set(rel, p);
  if (!flushTimer) flushTimer = setTimeout(flushFs, FLUSH_MS);
}

function flushFs() {
  flushTimer = null;
  const batch = [...pendingFs.entries()];
  pendingFs.clear();
  const entries = [];
  let framework = false;
  for (const [rel, p] of batch) {
    let st = null;
    try { st = fs.statSync(path.join(HUB, rel)); } catch { /* already deleted */ }
    if (st && st.isDirectory() && !p.renames) continue; // directory contents changed: the event belongs to the files inside
    const created = st && p.renames && st.birthtimeMs > Date.now() - 5000;
    const kind = !st ? 'DEL' : created ? 'NEW' : 'MOD';
    const { tag, sub } = repoTagFor(rel);
    const label = `${sub}${st && st.isDirectory() ? '/' : ''}${!st && p.renames > 1 ? ' (created and deleted)' : ''}`;
    entries.push({ kind, tag, sub, label });
    if (rel.startsWith('.agents/plan/') || rel.startsWith('.agents/review/')) framework = true;
  }
  pushGrouped(entries);
  if (framework) refreshPlans(); // only reads Markdown files, no need to wait for the git scan
  requestScan(FILE_GAP_MS); // refresh the REPOSITORIES panel for the changes just seen
}

// A submodule's `.git` is a `gitdir: <path>` file; a regular repository has a `.git` directory.
function gitDirOf(dir) {
  const dotgit = path.join(dir, '.git');
  try {
    if (fs.statSync(dotgit).isDirectory()) return dotgit;
    const m = fs.readFileSync(dotgit, 'utf8').match(/^gitdir:\s*(.+?)\s*$/m);
    return m ? path.resolve(dir, m[1]) : null;
  } catch { return null; }
}

function pollGitState() {
  let changed = false;
  for (const r of repoState) {
    if (!gitDirs.get(r.dir)) gitDirs.set(r.dir, gitDirOf(r.dir));
    const gd = gitDirs.get(r.dir);
    if (!gd) continue;
    const stamp = GIT_STATE_FILES.map(f => {
      try { const st = fs.statSync(path.join(gd, f)); return `${st.mtimeMs}:${st.size}:${st.ino}`; } catch { return '-'; }
    }).join('|');
    const prev = gitStamps.get(r.dir);
    gitStamps.set(r.dir, stamp);
    if (prev !== undefined && prev !== stamp) changed = true;
  }
  if (changed) requestScan(GIT_GAP_MS, GIT_DEBOUNCE_MS);
}

function startWatcher() {
  try {
    const watcher = fs.watch(HUB, { recursive: true }, onFsEvent);
    watcher.on('error', e => {
      WATCHING = false;
      pushEvent('SYS', `fs.watch stopped (${e.code || e.message}); falling back to detection via git`);
    });
    WATCHING = true;
    pushEvent('SYS', 'real-time file watching: on (includes paths ignored by Git, except .git/)');
  } catch (e) {
    pushEvent('SYS', `fs.watch unavailable (${e.code || e.message}); using git status every ${INTERVAL_MS / 1000}s`);
  }
}

async function scan() {
  if (scanning) return;
  scanning = true;
  try {
    const next = await Promise.all(listRepos().map(scanRepo));
    diffRepos(repoState, next);
    repoState = next;
    refreshPlans();
    scanError = '';
  } catch (e) {
    scanError = String((e && e.message) || e);
  } finally {
    scanning = false;
    lastScanAt = Date.now();
    if (scanAgain) { scanAgain = false; requestScan(GIT_GAP_MS); }
  }
}

const sessionKeys = new Map();
let sessionsLoaded = false;

// Logs only when a session runs a tool, stops or fails; THINK beats are too frequent, so they are skipped.
function refreshSessions() {
  sessions = loadSessions();
  for (const s of sessions) {
    const act = s.act || { state: 'idle' };
    const key = `${act.state}|${act.detail || ''}`;
    const prev = sessionKeys.get(s.id);
    sessionKeys.set(s.id, key);
    if (!sessionsLoaded || prev === key) continue;
    const id = s.id.slice(0, 8);
    if (prev === undefined) pushEvent('AGENT', `${id} connected`);
    else if (act.state !== 'thinking') {
      pushEvent('AGENT', `${id} → ${STATES[act.state].code}${act.detail ? ' ' + act.detail : ''}`);
    }
  }
  sessionsLoaded = true;
}

// ---------- panels ----------

function headerPanel(W, now, tall) {
  const iw = W - 4;
  const live = `${paint(mix(P.faint, P.neon, pulse(now, 1400)), '●')} ${paint(P.neon, BOLD + 'LIVE')}  ${paint(P.white, BOLD + clock(now))}`;
  const up = `${paint(P.muted, 'UPTIME')} ${paint(P.text, hms(now - START))}`;
  const active = sessions.filter(s => s.act && (s.act.state === 'tool' || s.act.state === 'thinking')).length;
  const dirty = repoState.filter(r => r.files.length).length;
  const hub = repoState.find(r => r.name === 'Hub');
  const seg = (k, v) => `${paint(P.neon, '▸')} ${paint(P.muted, k)} ${paint(P.text, v)}`;
  const strip = [
    seg('OPERATOR', `${os.userInfo().username}@${os.hostname()}`),
    seg('BRANCH', hub ? hub.branch : '…'),
    seg('AGENTS', `${active}/${sessions.length} active`),
    seg('REPOS', `${dirty}/${repoState.length || '…'} dirty`),
    seg('PLANS', `${planState.length} task`),
  ].join('  ');
  const body = tall && iw >= vlen(BANNER[0]) + 30
    ? [lr(' ' + shimmer(BANNER[0], now), live, iw), lr(' ' + shimmer(BANNER[1], now), up, iw), '', strip]
    : [lr(shimmer(SMALL_TITLE, now), `${live}  ${up}`, iw), '', strip];
  const d = new Date(now);
  return panel('MISSION CONTROL', body, W, { tag: paint(P.muted, `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`) });
}

function quotaPanel(W, now) {
  const iw = W - 4;
  const src = sessions.filter(s => s.data.rate_limits).sort((a, b) => b.snapshotTime - a.snapshotTime)[0];
  if (!src) return panel('01 // QUOTA', [paint(P.muted, 'No quota data yet (only available when signed in with a subscription).')], W);
  const lines = [];
  const bw = Math.max(8, Math.min(48, iw - 36));
  let peak = 0;
  for (const [key, label] of [['five_hour', '5H'], ['seven_day', '7D']]) {
    const r = src.data.rate_limits[key];
    if (!r || r.used_percentage === undefined) continue;
    const pct = Math.round(Number(r.used_percentage));
    peak = Math.max(peak, pct);
    const reset = toMs(r.resets_at);
    const left = `${paint(P.text, BOLD + label)} ${gbar(pct, bw)} ${paint(heat(pct / 100), BOLD + String(pct).padStart(3) + '%')}`;
    const right = !reset ? ''
      : reset <= now ? paint(P.neon, 'RESET')
        : `${paint(P.muted, 'T-')}${paint(P.white, hms(reset - now))} ${paint(P.faint, '@ ' + stamp(reset))}`;
    if (lines.length) lines.push('');
    lines.push(lr(left, right, iw));
  }
  lines.push('', paint(P.faint, `source: status line · ${ago(src.snapshotTime)} ago`));
  return panel('01 // QUOTA', lines, W, { tag: paint(heat(peak / 100), `PEAK ${peak}%`) });
}

function agentsBody(iw, now) {
  if (!sessions.length) {
    return [paint(P.muted, `No session updated in the last ${MAX_AGE_H} hours.`),
      paint(P.faint, 'A snapshot is written at the next Claude Code status line update.')];
  }
  const lines = [];
  const cbw = Math.max(6, Math.min(22, iw - 48));
  // sessions is already sorted by latest update, so taking the head is enough.
  const shown = sessions.slice(0, MAX_AGENTS);
  shown.forEach((s, idx) => {
    const d = s.data;
    const act = s.act || { state: 'idle' };
    const st = STATES[act.state] || STATES.idle;
    const busy = act.state === 'tool' || act.state === 'thinking';
    const icon = busy ? paint(st.col, SPIN[Math.floor(now / 80) % SPIN.length])
      : act.state === 'error' ? paint(now % 1000 < 500 ? P.red : P.faint, '×') : paint(P.teal, '○');
    const model = d.model?.display_name || d.model?.id || '?';
    const effort = d.effort?.level ? ' ' + paint(P.muted, d.effort.level) : '';
    lines.push(lr(`${icon} ${paint(P.white, BOLD + s.id.slice(0, 8))}  ${paint(P.cyan, model)}${effort}`,
      `${badge(st.col, st.code)}${act.detail ? ' ' + paint(st.col, act.detail) : ''} ${paint(P.muted, hms(now - (act.since || s.updated)))}`, iw));
    const dir = String(d.workspace?.current_dir || d.cwd || '').replace(/\\/g, '/').split('/').filter(Boolean).pop() || '?';
    // The full UUID leads the line so that only the name is cut when space runs out; used for `claude --resume <id>`
    // and resume.ps1 -SessionId, because -p does not accept a shortened ID. A very narrow panel shows only the UUID.
    const where = [d.session_name, dir].filter(Boolean).join(' · ');
    lines.push('', iw - s.id.length > 4 ? `  ${paint(P.text, s.id)}  ${paint(P.muted, where)}` : paint(P.text, s.id));
    const cw = d.context_window || {};
    const pct = cw.used_percentage !== undefined ? Math.round(Number(cw.used_percentage)) : null;
    const cu = cw.current_usage || {};
    const used = cu.input_tokens !== undefined
      ? (cu.input_tokens || 0) + (cu.cache_creation_input_tokens || 0) + (cu.cache_read_input_tokens || 0) : null;
    const ctx = pct === null ? paint(P.faint, 'CTX ?')
      : `${paint(P.muted, 'CTX')} ${gbar(pct, cbw)} ${paint(heat(pct / 100), BOLD + pct + '%')}` +
        (used !== null && cw.context_window_size ? ' ' + paint(P.faint, `${fmtTokens(used)}/${fmtTokens(cw.context_window_size)}`) : '');
    const cost = d.cost || {};
    const extra = [];
    if (cost.total_cost_usd !== undefined) extra.push(paint(P.text, `$${Number(cost.total_cost_usd).toFixed(2)}`));
    if (cost.total_lines_added !== undefined) extra.push(paint(P.green, `+${cost.total_lines_added}`) + ' ' + paint(P.red, `-${cost.total_lines_removed || 0}`));
    if (cost.total_duration_ms) extra.push(paint(P.muted, `T+${ago(Date.now() - cost.total_duration_ms)}`));
    lines.push('', lr('  ' + ctx, extra.join('  '), iw));
    if (idx < shown.length - 1) lines.push('', paint(P.faint, '┈'.repeat(iw)), '');
  });
  const hidden = sessions.length - shown.length;
  if (hidden > 0) lines.push('', paint(P.faint, `… +${hidden} older sessions (--agents to show more)`));
  return lines;
}

function agentsTag() {
  const active = sessions.filter(s => s.act && (s.act.state === 'tool' || s.act.state === 'thinking')).length;
  return paint(active ? P.cyan : P.muted, `${active} ACTIVE / ${sessions.length}`);
}

function xyBadge(xy) {
  const col = xy === '??' ? P.muted : xy.includes('U') || xy.includes('D') ? P.red
    : xy.includes('A') ? P.green : xy.includes('R') ? P.magenta : P.amber;
  return paint(col, BOLD + xy.replace(/\./g, '·'));
}

function diffStat(f) {
  if (f.add === '') return '';
  if (f.add === '-') return paint(P.faint, 'bin');
  const add = +f.add, del = +f.del, total = add + del;
  const g = total ? Math.round((5 * add) / total) : 0;
  const bar = total ? paint(P.green, '▮'.repeat(g)) + paint(P.red, '▮'.repeat(5 - g)) : paint(P.faint, '▯▯▯▯▯');
  return `${paint(P.green, '+' + add)} ${paint(P.red, '-' + del)} ${bar}`;
}

function reposBody(iw, now) {
  if (!repoState.length) return [paint(P.cyan, `${SPIN[Math.floor(now / 80) % SPIN.length]} scanning repositories…`)];
  const lines = [];
  if (scanError) lines.push(paint(P.red, `× ${scanError}`));
  // Partial registrations go first so the file lists cannot push them off the screen.
  const issues = [...manifestIssues, ...repoState.filter(registryIssue).map(r => `${shortName(r.name)} · ${registryIssue(r)}`)];
  for (const issue of issues) lines.push(paint(P.red, `⚠ ${issue}`));
  if (issues.length) lines.push('');
  const clean = [];
  for (const r of repoState) {
    if (r.error) { lines.push(paint(P.red, `× ${r.name}: ${r.error}`)); continue; }
    if (!r.files.length) { clean.push(r); continue; }
    const sync = !r.upstream ? paint(P.faint, 'NO-UPSTREAM')
      : r.ahead || r.behind ? paint(P.amber, `↑${r.ahead} ↓${r.behind}`) : paint(P.faint, 'SYNCED');
    lines.push(lr(`${paint(P.neon, '▌')}${paint(P.white, BOLD + r.name)} ${paint(P.violet, `‹${r.branch}›`)} ${sync}`,
      paint(P.amber, BOLD + `${r.files.length} Δ`), iw));
    if (r.last) lines.push('', paint(P.faint, ` · ${r.last.hash} · ${ago(r.last.time)} ago · `) + paint(P.muted, r.last.subject));
    lines.push(paint(P.border, ' │'));
    const shown = r.files.slice(0, MAX_FILES);
    const more = r.files.length - shown.length;
    shown.forEach((f, i) => {
      const branch = paint(P.border, i === shown.length - 1 && !more ? ' └─' : ' ├─');
      const mark = f.recent ? paint(mix(P.faint, P.amber, pulse(now, 1200)), '◆') : ' ';
      const name = f.orig ? `${f.orig} → ${f.path}` : f.path;
      const cut = name.lastIndexOf('/') + 1;
      const nameStr = paint(P.muted, name.slice(0, cut)) + paint(f.recent ? P.neon : P.text, (f.recent ? BOLD : '') + name.slice(cut));
      const right = `${diffStat(f)} ${paint(f.recent ? P.amber : P.faint, (f.mtime ? ago(f.mtime) : '').padStart(4))}`;
      lines.push(lr(`${branch} ${xyBadge(f.xy)} ${mark} ${nameStr}`, right, iw));
    });
    if (more) lines.push(paint(P.border, ' └─') + paint(P.muted, ` … +${more} more files`));
    lines.push('', paint(P.faint, '┈'.repeat(iw)), '');
  }
  if (clean.length) {
    lines.push(paint(P.muted, 'CLEAN'), '');
    const items = clean.map(r => `${registryIssue(r) ? paint(P.red, '⚠') : paint(P.neon, '■')} ${paint(P.text, shortName(r.name))}` +
      (r.upstream && (r.ahead || r.behind) ? ' ' + paint(P.amber, `↑${r.ahead}↓${r.behind}`) : ''));
    const cell = Math.max(...items.map(vlen)) + 3;
    const perRow = Math.max(1, Math.floor(iw / cell));
    for (let i = 0; i < items.length; i += perRow) {
      if (i) lines.push('');
      lines.push(items.slice(i, i + perRow).map(x => pad(x, cell)).join(''));
    }
  } else if (lines.length >= 3 && lines[lines.length - 1] === '') lines.splice(-3); // drop the separator after the last repository
  return lines;
}

function reposTag() {
  const dirty = repoState.filter(r => r.files.length);
  const files = dirty.reduce((n, r) => n + r.files.length, 0);
  const warn = manifestIssues.length + repoState.filter(registryIssue).length;
  return paint(dirty.length ? P.amber : P.muted, `${dirty.length}/${repoState.length} DIRTY · ${files} Δ`) +
    (warn ? paint(P.red, ` · ${warn} ⚠`) : '');
}

const PLAN_STATES = {
  planned: [P.muted, 'PLANNED'], awaiting_confirmation: [P.cyan, 'AWAIT'], implemented: [P.green, 'IMPLEMENTED'],
  blocked: [P.amber, 'BLOCKED'], failed: [P.red, 'FAILED'],
};
const VERDICTS = { PASS: P.green, FAIL: P.red, BLOCKED: P.amber };

// One line per Plan task, most recently active first: Plan status, latest Review round and verdict.
function planBody(iw) {
  if (!planState.length) return [paint(P.muted, 'No Plans in .agents/plan/ yet.')];
  // The Plan package name shows only when there is more than one package, without its timestamp to leave room for the title.
  const multiSet = new Set(planState.map(t => t.set)).size > 1;
  return planState.slice(0, MAX_PLANS).map(t => {
    const [col, code] = PLAN_STATES[t.status] || [P.text, String(t.status).toUpperCase()];
    const review = t.review
      ? paint(VERDICTS[t.review.verdict] || P.text, BOLD + `R${t.review.round} ${t.review.verdict}`)
      : paint(P.faint, 'not reviewed');
    const set = multiSet ? paint(P.muted, t.set.replace(/_\d{8}-\d{6}$/, '') + ' ') : '';
    const left = `${paint(P.white, BOLD + t.id)} ${badge(col, code.padEnd(11))} ${set}${paint(P.text, t.title)}`;
    return lr(left, `${review} ${paint(P.faint, ago(t.mtime).padStart(4))}`, iw);
  }).concat(planState.length > MAX_PLANS ? [paint(P.muted, `… +${planState.length - MAX_PLANS} older tasks (--plans to show more)`)] : []);
}

function planTag() {
  const waiting = planState.filter(t => t.status === 'implemented' && !t.review).length;
  return paint(waiting ? P.amber : P.muted, `${planState.length} TASK · ${waiting} PENDING REVIEW`);
}

function logBody(now, max) {
  if (!events.length) return [paint(P.faint, 'Waiting for signals…')];
  return events.slice(0, max).map((e, i) => {
    let text = e.text;
    // The newest event appears gradually, as if being typed.
    if (i === 0 && !ONCE) {
      const n = Math.floor((now - e.at) / 12);
      if (n < text.length) text = text.slice(0, n) + (now % 400 < 200 ? '█' : ' ');
    }
    return `${paint(P.faint, clock(e.at))} ${paint(KINDS[e.kind] || P.text, BOLD + e.kind.padEnd(7))} ${paint(i === 0 ? P.white : P.text, text)}`;
  });
}

function logTag(now) {
  return `${paint(mix(P.faint, P.red, pulse(now, 1000)), '●')} ${paint(P.muted, 'REC')}`;
}

// Number of events in the last 60 seconds, in 24 buckets.
function sparkline(now) {
  const levels = '▁▂▃▄▅▆▇█';
  const buckets = Array(24).fill(0);
  for (const e of events) {
    const k = Math.floor((now - e.at) / 2500);
    if (k < 24) buckets[23 - k]++;
  }
  const max = Math.max(1, ...buckets);
  return buckets.map(n => (n ? paint(heat(n / max / 1.4), levels[Math.min(7, Math.ceil((n / max) * 7))]) : paint(P.faint, levels[0]))).join('');
}

function footerLine(W, now) {
  const left = `${badge(P.neon, 'Q')} ${paint(P.muted, 'QUIT')}  ${badge(P.cyan, 'R')} ${paint(P.muted, 'RESCAN')}`;
  const right = `${paint(P.muted, 'ACTIVITY')} ${sparkline(now)}  ${paint(P.faint, `scan ${INTERVAL_MS / 1000}s · ${repoState.length} repo · ${eventTotal} events`)}`;
  return lr(left, right, W);
}

// ---------- layout ----------

function dashFrame(now, W, H) {
  const natural = H === null;
  // The stacked layout uses more height, so it needs a taller terminal before padding is turned on.
  PADY = natural || H >= (W >= 118 ? 36 : 52) ? 1 : 0;
  const header = headerPanel(W, now, natural || H >= 36);
  const footer = footerLine(W, now);
  // One blank line after the header, between stacked panels and before the footer.
  const bodyH = natural ? null : H - header.length - 3;
  const stack = (...panels) => panels.filter(p => p.length).flatMap((p, i) => (i ? ['', ...p] : p));
  let body;
  if (W >= 118) {
    const GAP = 2;
    const LW = Math.floor((W - GAP) * 0.45);
    const RW = W - GAP - LW;
    const q = quotaPanel(LW, now);
    const aBody = agentsBody(LW - 4, now);
    const pBody = planBody(RW - 4);
    const rBody = reposBody(RW - 4, now);
    let a, l, p, r;
    if (natural) {
      a = panel('02 // AGENTS', aBody, LW, { tag: agentsTag() });
      l = panel('05 // EVENT LOG', logBody(now, 20), LW, { tag: logTag(now) });
      p = panel('03 // PLAN · REVIEW', pBody, RW, { tag: planTag() });
      r = panel('04 // REPOSITORIES', rBody, RW, { tag: reposTag() });
    } else {
      const rest = bodyH - q.length - 1;
      // Leave the log at least 3 content lines; AGENTS has only a few sessions, so the rest goes to the log.
      a = panel('02 // AGENTS', aBody, LW, { tag: agentsTag(), max: Math.max(1, Math.min(aBody.length, rest - frame() - 1 - (frame() + 3))) });
      const lMax = rest - a.length - 1 - frame();
      l = lMax >= 1 ? panel('05 // EVENT LOG', logBody(now, lMax), LW, { tag: logTag(now), max: lMax, fill: true }) : [];
      // PLAN sits above REPOSITORIES in the right column and shows only when REPOSITORIES keeps at least 8 content lines.
      const pMax = Math.min(pBody.length, 6);
      const showPlan = bodyH - (pMax + frame()) - 1 - frame() >= 8;
      p = showPlan ? panel('03 // PLAN · REVIEW', pBody, RW, { tag: planTag(), max: pMax }) : [];
      r = panel('04 // REPOSITORIES', rBody, RW, { tag: reposTag(), max: Math.max(1, bodyH - (p.length ? p.length + 1 : 0) - frame()), fill: true });
    }
    const left = stack(q, a, l);
    const right = stack(p, r);
    const h = natural ? Math.max(left.length, right.length) : bodyH;
    body = [];
    for (let i = 0; i < h; i++) body.push(pad(left[i] || '', LW) + ' '.repeat(GAP) + (right[i] || ''));
  } else {
    const q = quotaPanel(W, now);
    const aBody = agentsBody(W - 4, now);
    const pBody = planBody(W - 4);
    const rBody = reposBody(W - 4, now);
    if (natural) {
      body = stack(q, panel('02 // AGENTS', aBody, W, { tag: agentsTag() }),
        panel('03 // PLAN · REVIEW', pBody, W, { tag: planTag() }),
        panel('04 // REPOSITORIES', rBody, W, { tag: reposTag() }),
        panel('05 // EVENT LOG', logBody(now, 12), W, { tag: logTag(now) }));
    } else {
      const a = panel('02 // AGENTS', aBody, W, { tag: agentsTag(), max: Math.min(aBody.length, 8) });
      const avail = bodyH - q.length - 1 - a.length - 1;
      // PLAN shows only when the terminal is tall enough for REPOSITORIES and the log to keep their room.
      const p = avail >= 24 ? panel('03 // PLAN · REVIEW', pBody, W, { tag: planTag(), max: Math.min(pBody.length, 5) }) : [];
      const rest = avail - (p.length ? p.length + 1 : 0);
      // The log always gets up to 6 lines (the file list keeps at least 3), then takes any spare room, up to 12.
      const lMax = Math.min(12, Math.max(Math.min(6, rest - 1 - 2 * frame() - 3), rest - (rBody.length + frame()) - 1 - frame()));
      const l = lMax >= 1 ? panel('05 // EVENT LOG', logBody(now, lMax), W, { tag: logTag(now), max: lMax, fill: true }) : [];
      const r = panel('04 // REPOSITORIES', rBody, W, { tag: reposTag(), max: Math.max(1, rest - (l.length ? l.length + 1 : 0) - frame()), fill: true });
      body = stack(q, a, p, r, l).slice(0, bodyH);
    }
  }
  return [...header, '', ...body, '', footer];
}

// ---------- boot screen ----------

const RAIN_CHARS = '0123456789ABCDEF<>/\\|=+*';
let rain = null;

function rainRows(W, H, now) {
  if (!rain || rain.W !== W || rain.H !== H) {
    rain = {
      W, H, last: now,
      drops: Array.from({ length: W }, () => Math.random() * H * 1.3 - H * 0.3),
      speed: Array.from({ length: W }, () => 0.6 + Math.random() * 1.1),
    };
  }
  const dt = Math.min(5, (now - rain.last) / FRAME_MS);
  rain.last = now;
  const rows = [];
  for (let y = 0; y < H; y++) {
    const cells = [];
    for (let x = 0; x < W; x++) {
      const d = rain.drops[x] - y;
      if (x % 2 || d < 0 || d >= 12) { cells.push(' '); continue; }
      const ch = RAIN_CHARS[Math.floor(Math.random() * RAIN_CHARS.length)];
      cells.push(fg(d < 1 ? P.white : mix(P.neon, P.night, d / 12)) + ch + RESET);
    }
    rows.push(cells);
  }
  for (let x = 0; x < W; x++) {
    rain.drops[x] += rain.speed[x] * dt;
    if (rain.drops[x] - 12 > H) rain.drops[x] = -Math.random() * H * 0.5;
  }
  return rows;
}

function introFrame(now, W, H) {
  const t = now - START;
  const grid = rainRows(W, H, now);
  const bw = Math.min(W - 2, 68);
  const iw = bw - 4;
  PADY = 1;
  const body = [];
  if (iw >= vlen(BANNER[0]) + 2) BANNER.forEach(r => body.push(center(shimmer(r, now), iw)));
  else body.push(center(shimmer(SMALL_TITLE, now), iw));
  body.push(center(paint(P.muted, 'MISSION CONTROL · LOCAL TELEMETRY'), iw), '');
  const dirtyFiles = repoState.reduce((n, r) => n + r.files.length, 0);
  const steps = [
    ['establishing uplink', 'OK'],
    ['mounting repositories', String(listRepos().length)],
    ['reading plan and review ledgers', planLoaded ? String(planState.length) : '…'],
    ['attaching agent telemetry', String(sessions.length)],
    ['calibrating quota sensors', sessions.some(s => s.data.rate_limits) ? 'OK' : 'N/A'],
    ['scanning working trees', repoState.length ? `${dirtyFiles} Δ` : '…'],
  ];
  steps.forEach(([label, value], i) => {
    const at = 300 + i * 260;
    if (t < at) { body.push(''); return; }
    const typed = paint(P.neon, '> ') + paint(P.text, label.slice(0, Math.floor((t - at) / 14)));
    if (t < at + 200) { body.push(typed + paint(P.neon, now % 300 < 150 ? '█' : '')); return; }
    const val = paint(P.neon, BOLD + value);
    const dots = Math.max(1, iw - vlen(typed) - vlen(val) - 2);
    body.push(`${typed} ${paint(P.faint, '.'.repeat(dots))} ${val}`);
  });
  body.push('');
  const prog = Math.max(0, Math.min(1, (t - 300) / (steps.length * 260 + 300)));
  const pw = iw - 7;
  const fill = Math.round(prog * pw);
  body.push(`${paint(P.border, '[')}${paint(P.neon, '█'.repeat(fill))}${paint(P.faint, '░'.repeat(pw - fill))}${paint(P.border, ']')} ` +
    paint(P.white, `${String(Math.round(prog * 100)).padStart(3)}%`));
  body.push(prog >= 1 ? center(badge(now % 300 < 150 ? P.neon : P.teal, 'ACCESS GRANTED'), iw) : '');
  const box = panel('BOOT SEQUENCE', body, bw, { tag: paint(P.muted, hms(t)) });
  const top = Math.max(0, Math.floor((H - box.length) / 2));
  const left = Math.max(0, Math.floor((W - bw) / 2));
  return grid.map((cells, y) => {
    const b = box[y - top];
    if (b === undefined) return cells.join('');
    return cells.slice(0, left).join('') + b + cells.slice(left + bw).join('');
  });
}

// ---------- main loop ----------

function tick() {
  const now = Date.now();
  const W = Math.max(40, (process.stdout.columns || Number(process.env.COLUMNS) || 120) - 1); // leave the last column free to avoid automatic line wrapping
  const rows = process.stdout.rows || Number(process.env.LINES) || 40;
  const H = Math.max(12, rows);
  const lines = (now < introUntil ? introFrame(now, W, H) : dashFrame(now, W, H)).slice(0, rows);
  let s = '\x1b[?2026h';
  lines.forEach((l, i) => { s += `\x1b[${i + 1};1H${l}${RESET}\x1b[K`; });
  // Clear below only when the frame is shorter than the screen: if the frame fits exactly, the cursor is clamped
  // to the last line and the clear would also erase the footer just drawn, causing flicker.
  if (lines.length < rows) s += `\x1b[${lines.length + 1};1H\x1b[J`;
  s += '\x1b[?2026l';
  process.stdout.write(s);
}

function exit() {
  process.stdout.write(`${RESET}\x1b[?25h\x1b[?1049l`);
  process.stdout.write(paint(P.muted, '■ mission control offline') + '\n');
  process.exit(0);
}

async function main() {
  if (ONCE) {
    refreshSessions();
    await scan();
    const W = Math.max(40, (process.stdout.columns || Number(process.env.COLUMNS) || 120) - 1);
    process.stdout.write(dashFrame(Date.now(), W, ONCE_ROWS).join('\n') + RESET + '\n');
    return;
  }
  if (!args['no-intro'] && process.stdout.isTTY) introUntil = START + INTRO_MS;
  process.stdout.write('\x1b[?1049h\x1b[?25l\x1b[2J');
  process.on('SIGINT', exit);
  process.on('SIGTERM', exit);
  process.stdout.on('resize', () => process.stdout.write('\x1b[2J'));
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on('data', key => {
      const k = key.toString();
      if (k === 'q' || k === 'Q' || k === '\x03') exit();
      if (Date.now() < introUntil) { introUntil = 0; process.stdout.write('\x1b[2J'); return; }
      if (k === 'r' || k === 'R') scan();
    });
  }
  refreshSessions();
  refreshPlans();
  scan();
  startWatcher();
  setInterval(scan, INTERVAL_MS);
  setInterval(pollGitState, GIT_POLL_MS);
  setInterval(refreshSessions, 1000);
  setInterval(tick, FRAME_MS);
  tick();
}

main();
