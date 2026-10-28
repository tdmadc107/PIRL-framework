#!/usr/bin/env python3
"""Start, append, check and query layer self-evaluation records.

Records live in .agents/evals/records/<layer>/<YYYY-MM-DD>.jsonl, one JSON object per line, append-only.
That directory is ignored by Git: records stay on the local machine and are still read by `query` and `check`.
The record contract (when to write, field meanings, causes, fix rules) is owned by the router,
section "Self-evaluation and improvement"; this tool only enforces the structure of that contract.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path, PureWindowsPath
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent))
from validate_layer_artifact import (  # noqa: E402
    IMPLEMENT_STATUSES, REVIEW_STATUSES, VERDICTS, LayerArtifactError, load_roles, resolve_path,
)

# Every schema ever written stays readable; bump CURRENT when the record shape changes.
CURRENT_SCHEMA = "pirl-record/v1"
READABLE_SCHEMAS = ("pirl-record/v1",)
RECORDS = ".agents/evals/records"
LAYERS = ("plan", "implement", "review")
LAYER_USAGES = {"plan": {"plan", "audit"}, "implement": {"implement", "verify", "audit"}, "review": {"review", "audit"}}
OUTCOMES = {
    "plan": ("ready", "draft", "blocked"),
    "implement": IMPLEMENT_STATUSES,
    "review": REVIEW_STATUSES,
}
MODES = ("agent", "self")
RESULTS = ("PASS", "FAIL", "BLOCKED")
CAUSES = ("instruction", "ineffective_fix", "input", "execution")
PENDING_REASONS = ("mode_self", "safety", "repository")
FRAMEWORK_PATHS = ("AGENTS.md", "CONTEXT.md", ".agents/instructions", ".agents/roles", ".agents/evals", ".skills", "bin")
# Tracked paths that are deliberately not framework content. Every tracked file sits under one of the two lists;
# a test fails when a new path appears in neither, so adding one is a decision, not an accident.
# Written by the installer into a copy of the framework inside a workspace: the installed version and file hashes.
MANIFEST = "manifest.json"
NOT_FRAMEWORK_TRACKED = (".gitignore", "LICENSE", "README.md", "package.json", MANIFEST)
# Inside FRAMEWORK_PATHS but not framework content: the records themselves and Python caches.
NOT_FRAMEWORK = (RECORDS + "/", "__pycache__/")
KEBAB = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")
TASK = re.compile(r"T\d{2,}")
ISSUE_ID = re.compile(r"ISSUE-\d{2,}")
FIX_ID = re.compile(r"FIX-\d{2,}")
COMMIT = re.compile(r"[0-9a-f]{7,40}|none")


class RecordError(ValueError):
    pass


# ---------- reading ----------


def _record_files(root: Path) -> list[Path]:
    return sorted((root / RECORDS).glob("*/*.jsonl"))


def read_records(root: Path) -> tuple[list[dict[str, Any]], list[str]]:
    """Return every stored record in file order, plus errors for lines that cannot be parsed."""

    records: list[dict[str, Any]] = []
    errors: list[str] = []
    for path in _record_files(root):
        rel = path.relative_to(root).as_posix()
        for number, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if not line.strip():
                errors.append(f"{rel}:{number}: empty line")
                continue
            try:
                data = json.loads(line)
            except json.JSONDecodeError as exc:
                errors.append(f"{rel}:{number}: invalid JSON ({exc.msg})")
                continue
            if not isinstance(data, dict):
                errors.append(f"{rel}:{number}: a record must be a JSON object")
                continue
            data["_location"] = f"{rel}:{number}"
            records.append(data)
    return records, errors


# ---------- validation ----------


def _text(value: Any, label: str, errors: list[str]) -> str:
    if not isinstance(value, str) or not value.strip():
        errors.append(f"{label}: non-empty text is required")
        return ""
    return value


def _list(value: Any, label: str, errors: list[str], required: bool = True) -> list[Any]:
    if not isinstance(value, list):
        errors.append(f"{label}: expected an array")
        return []
    if required and not value:
        errors.append(f"{label}: at least one entry is required")
    return value


def _relative(value: Any, label: str, errors: list[str]) -> str:
    text = _text(value, label, errors)
    if text and (PureWindowsPath(text).drive or text.startswith(("/", "\\")) or ".." in Path(text).parts):
        errors.append(f"{label}: must be a path relative to the Hub root")
    return text


def validate_record(record: dict[str, Any], others: list[dict[str, Any]], root: Path, catalog: dict[str, set[str]]) -> list[str]:
    """Check one record against the v1 contract; `others` are the records written at or before it."""

    errors: list[str] = []
    if record.get("schema") not in READABLE_SCHEMAS:
        return [f"schema must be one of {', '.join(READABLE_SCHEMAS)}"]
    by_id = {item.get("record_id"): item for item in others}
    layer = record.get("layer")
    if layer not in LAYERS:
        errors.append(f"layer must be one of {', '.join(LAYERS)}")
        layer = None

    ref = record.get("framework_ref")
    if not isinstance(ref, dict) or not isinstance(ref.get("commit"), str) or not COMMIT.fullmatch(ref["commit"]):
        errors.append("framework_ref.commit: expected a git commit hash or 'none' (from `start`)")
    elif not isinstance(ref.get("files"), dict) or not all(isinstance(v, str) for v in ref["files"].values()):
        errors.append("framework_ref.files: expected an object of path -> content hash (from `start`)")

    outcome = record.get("outcome")
    if not isinstance(outcome, dict):
        errors.append("outcome: expected an object")
        outcome = {}
    task = record.get("task")
    if not isinstance(task, dict):
        errors.append("task: expected an object")
        task = {}
    # A Plan run that stops before writing any task file ends `blocked` and has neither package nor task.
    unwritten = (layer == "plan" and outcome.get("status") == "blocked"
                 and task.get("plan_set") is None and task.get("task_ids") == [])
    if not unwritten:
        _text(task.get("plan_set"), "task.plan_set", errors)
        ids = _list(task.get("task_ids"), "task.task_ids", errors)
        if any(not isinstance(t, str) or not TASK.fullmatch(t) for t in ids):
            errors.append("task.task_ids: each entry must be a task ID such as T01")
    if layer == "review":
        report = _text(task.get("report_file"), "task.report_file", errors)
        if report and not resolve_path(report, root).is_file():
            errors.append(f"task.report_file: {report} does not exist (relative to the Hub root or absolute)")
    _text(record.get("target_repo"), "target_repo", errors)

    if layer and outcome.get("status") not in OUTCOMES[layer]:
        errors.append(f"outcome.status: expected one of {', '.join(OUTCOMES[layer])} for layer {layer}")
    if layer == "review" and outcome.get("verdict") not in VERDICTS:
        errors.append("outcome.verdict: expected PASS, FAIL or BLOCKED for a Review record")
    _text(outcome.get("summary"), "outcome.summary", errors)

    def check_role(name: Any, label: str, usages: set[str] | None) -> None:
        if name == "coordinator":
            return
        if not isinstance(name, str) or name not in catalog:
            errors.append(f"{label}: unknown role {name}")
        elif usages and not catalog[name] & usages:
            errors.append(f"{label}: role {name} is not registered for this layer")

    roles: dict[str, dict[str, Any]] = {}
    for index, entry in enumerate(_list(record.get("roles"), "roles", errors)):
        label = f"roles[{index}]"
        if not isinstance(entry, dict):
            errors.append(f"{label}: expected an object")
            continue
        name = entry.get("role")
        check_role(name, f"{label}.role", LAYER_USAGES.get(layer or "", None))
        if name in roles:
            errors.append(f"{label}: duplicate role {name}")
        roles[str(name)] = entry
        if entry.get("mode") not in MODES:
            errors.append(f"{label}.mode: expected agent or self")
        if entry.get("result") not in RESULTS:
            errors.append(f"{label}.result: expected PASS, FAIL or BLOCKED")
        _text(entry.get("assignment"), f"{label}.assignment", errors)

    audit = record.get("audit")
    if not isinstance(audit, dict) or audit.get("mode") not in MODES:
        errors.append("audit.mode: expected agent or self")
        audit = {}
    if audit.get("role") != "process-auditor":
        errors.append("audit.role: must be process-auditor")

    for key in ("evaluates", "supersedes"):
        value = record.get(key)
        if value is not None and value not in by_id:
            errors.append(f"{key}: record {value} does not exist")

    issues = _list(record.get("issues"), "issues", errors, required=False)
    fixes = _list(record.get("fixes"), "fixes", errors, required=False)
    if audit and audit.get("result") != ("issues" if issues else "clean"):
        errors.append("audit.result: must be 'issues' when issues exist, otherwise 'clean'")

    issue_ids: set[str] = set()
    for index, issue in enumerate(issues):
        label = f"issues[{index}]"
        if not isinstance(issue, dict):
            errors.append(f"{label}: expected an object")
            continue
        issue_id = issue.get("id")
        if not isinstance(issue_id, str) or not ISSUE_ID.fullmatch(issue_id) or issue_id in issue_ids:
            errors.append(f"{label}.id: expected a unique ID such as ISSUE-01")
        issue_ids.add(str(issue_id))
        if not isinstance(issue.get("issue_key"), str) or not KEBAB.fullmatch(issue["issue_key"]):
            errors.append(f"{label}.issue_key: expected a stable kebab-case key")
        scope = issue.get("record")
        if scope is None:
            if issue.get("role") != "coordinator" and issue.get("role") not in roles:
                errors.append(f"{label}.role: {issue.get('role')} did not take part in this run")
        elif scope not in by_id:
            errors.append(f"{label}.record: record {scope} does not exist")
        elif scope != record.get("evaluates"):
            errors.append(f"{label}.record: only the record named in `evaluates` can be judged here")
        elif issue.get("role") != "coordinator" and issue.get("role") not in {r.get("role") for r in by_id[scope].get("roles", []) if isinstance(r, dict)}:
            errors.append(f"{label}.role: {issue.get('role')} did not take part in {scope}")
        cause = issue.get("cause")
        if cause not in CAUSES:
            errors.append(f"{label}.cause: expected one of {', '.join(CAUSES)}")
        for key in ("decision", "rule", "evidence"):
            _text(issue.get(key), f"{label}.{key}", errors)
        prior = issue.get("prior_fix")
        if cause == "ineffective_fix":
            prior_record, _, prior_fix = str(prior).partition("#")
            stored = by_id.get(prior_record)
            if prior is None or stored is None or prior_fix not in {f.get("id") for f in stored.get("fixes", []) if isinstance(f, dict)}:
                errors.append(f"{label}.prior_fix: an ineffective_fix must name an earlier fix as <record_id>#FIX-NN")
        elif prior is not None:
            errors.append(f"{label}.prior_fix: only an ineffective_fix names an earlier fix")

    covered: set[str] = set()
    fix_ids: set[str] = set()
    for index, fix in enumerate(fixes):
        label = f"fixes[{index}]"
        if not isinstance(fix, dict):
            errors.append(f"{label}: expected an object")
            continue
        fix_id = fix.get("id")
        if not isinstance(fix_id, str) or not FIX_ID.fullmatch(fix_id) or fix_id in fix_ids:
            errors.append(f"{label}.id: expected a unique ID such as FIX-01")
        fix_ids.add(str(fix_id))
        targets = _list(fix.get("issues"), f"{label}.issues", errors)
        for target in targets:
            if target not in issue_ids:
                errors.append(f"{label}.issues: unknown issue {target}")
        covered.update(t for t in targets if isinstance(t, str))
        status, reason = fix.get("status"), fix.get("reason")
        if status == "applied":
            if audit.get("mode") == "self":
                errors.append(f"{label}.status: a self-evaluation cannot apply fixes; use pending_user with reason mode_self")
        elif status == "pending_user":
            if reason not in PENDING_REASONS:
                errors.append(f"{label}.reason: pending_user needs reason {', '.join(PENDING_REASONS)}")
            elif reason == "mode_self" and audit.get("mode") != "self":
                errors.append(f"{label}.reason: mode_self is only valid when audit.mode is self")
        else:
            errors.append(f"{label}.status: expected applied or pending_user")
        for position, item in enumerate(_list(fix.get("files"), f"{label}.files", errors)):
            if not isinstance(item, dict):
                errors.append(f"{label}.files[{position}]: expected an object")
                continue
            _relative(item.get("path"), f"{label}.files[{position}].path", errors)
            _text(item.get("section"), f"{label}.files[{position}].section", errors)
        _text(fix.get("summary"), f"{label}.summary", errors)
        if status == "applied":
            _list(fix.get("checks"), f"{label}.checks", errors)
    for missing in sorted(issue_ids - covered):
        errors.append(f"issues: {missing} has no fix; every issue needs an improvement")
    return errors


# ---------- commands ----------


def _git(root: Path, *args: str) -> str | None:
    try:
        result = subprocess.run(["git", "-C", str(root), *args], capture_output=True, text=True, encoding="utf-8", check=False)
    except OSError:
        return None
    return result.stdout if result.returncode == 0 else None


def _hash(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()[:12] if path.is_file() else "deleted"


def _is_framework(rel: str) -> bool:
    return any(rel == base or rel.startswith(base + "/") for base in FRAMEWORK_PATHS) and not _excluded(rel)


def _framework_files(root: Path) -> dict[str, Path]:
    files = [p for base in FRAMEWORK_PATHS for p in ([root / base] if (root / base).is_file() else sorted((root / base).rglob("*")))]
    return {p.relative_to(root).as_posix(): p for p in files if p.is_file() and not _excluded(p.relative_to(root).as_posix())}


def framework_ref(root: Path) -> dict[str, Any]:
    """Pin the framework version in force: the Hub commit plus a hash of each framework file that differs from it.

    A copy installed inside a workspace sits in a repository that is not the framework's own, so its commit would
    name the workspace instead: the installed version from the manifest and the files that differ from it are used.
    """

    top = (_git(root, "rev-parse", "--show-toplevel") or "").strip()
    own_repository = bool(top) and Path(top).resolve() == root.resolve()
    manifest_path = root / MANIFEST
    if not own_repository and manifest_path.is_file():
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        recorded = manifest.get("files", {})
        current = _framework_files(root)
        changed = sorted({rel for rel, path in current.items() if hashlib.sha256(path.read_bytes()).hexdigest() != recorded.get(rel)}
                         | {rel for rel in recorded if rel not in current and _is_framework(rel)})
        return {"commit": "none", "version": str(manifest.get("version", "")),
                "files": {rel: _hash(root / rel) for rel in changed}}
    commit = (_git(root, "rev-parse", "HEAD") or "").strip() if own_repository else ""
    if not commit:
        return {"commit": "none", "files": {rel: _hash(path) for rel, path in _framework_files(root).items()}}
    status = _git(root, "-c", "core.quotepath=off", "status", "--porcelain", "--untracked-files=all", "--", *FRAMEWORK_PATHS) or ""
    changed = {line[3:].split(" -> ")[-1].strip('"') for line in status.splitlines() if len(line) > 3}
    return {"commit": commit, "files": {path: _hash(root / path) for path in sorted(changed) if not _excluded(path)}}


def _excluded(path: str) -> bool:
    return any(path.startswith(prefix) or f"/{prefix}" in path for prefix in NOT_FRAMEWORK)


def _read_input(path: str | None) -> dict[str, Any]:
    raw = Path(path).read_bytes() if path else sys.stdin.buffer.read()
    try:
        data = json.loads(raw.decode("utf-8-sig"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise RecordError(f"input is not UTF-8 JSON: {exc}") from exc
    if not isinstance(data, dict):
        raise RecordError("input must be a JSON object")
    return data


def append(root: Path, data: dict[str, Any]) -> dict[str, Any]:
    stored, broken = read_records(root)
    if broken:
        raise RecordError("existing records are unreadable; run `check` and repair them first: " + "; ".join(broken))
    for key in ("schema", "record_id", "recorded_at"):
        if key in data:
            raise RecordError(f"{key} is set by the tool, not by the input")
    now = datetime.now().astimezone()
    record = {"schema": CURRENT_SCHEMA, "record_id": "", "recorded_at": now.isoformat(timespec="seconds"), **data}
    tasks = data.get("task", {}).get("task_ids") if isinstance(data.get("task"), dict) else None
    base = f"{data.get('layer')}-{now:%Y%m%d-%H%M%S}-{tasks[0] if isinstance(tasks, list) and tasks else 'T00'}"
    existing = {r.get("record_id") for r in stored}
    record_id, number = base, 1
    while record_id in existing:
        number += 1
        record_id = f"{base}-{number}"
    record["record_id"] = record_id
    errors = validate_record(record, stored, root, load_roles(root))
    if errors:
        raise RecordError("; ".join(errors))
    target = root / RECORDS / str(record["layer"]) / f"{now:%Y-%m-%d}.jsonl"
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open("a", encoding="utf-8", newline="\n") as handle:
        handle.write(json.dumps(record, ensure_ascii=False, separators=(",", ":")) + "\n")
    return {"record_id": record["record_id"], "path": target.relative_to(root).as_posix()}


def _instant(value: Any) -> datetime:
    """Records may carry different UTC offsets (the machine's own), so order them by instant, not by text.
    A missing or malformed stamp sorts first, as an empty string did."""
    try:
        parsed = datetime.fromisoformat(value) if isinstance(value, str) else None
    except ValueError:
        parsed = None
    if parsed is None or parsed.utcoffset() is None:
        return datetime.min.replace(tzinfo=timezone.utc)
    return parsed


def check(root: Path) -> list[str]:
    stored, errors = read_records(root)
    catalog = load_roles(root)
    located = [(record.pop("_location"), record) for record in stored]
    ids: set[Any] = set()
    for location, record in located:
        if record.get("record_id") in ids:
            errors.append(f"{location}: duplicate record_id {record.get('record_id')}")
        # Layer folders sort by name, not by time, so "stored before" is judged by `recorded_at` (same instant allowed):
        # a record may name any record written at or before its own time, whichever layer folder holds it.
        stamp = _instant(record.get("recorded_at"))
        earlier = [other for _, other in located if other is not record and _instant(other.get("recorded_at")) <= stamp]
        errors.extend(f"{location}: {error}" for error in validate_record(record, earlier, root, catalog))
        ids.add(record.get("record_id"))
    return errors


def query(root: Path, args: argparse.Namespace) -> list[dict[str, Any]]:
    stored, _ = read_records(root)
    found = []
    for record in stored:
        record.pop("_location", None)
        task = record.get("task") or {}
        if args.layer and record.get("layer") != args.layer:
            continue
        if args.plan_set and task.get("plan_set") != args.plan_set:
            continue
        if args.task and args.task not in (task.get("task_ids") or []):
            continue
        issues = record.get("issues") or []
        if args.issue_key or args.rule:
            issues = [i for i in issues if (not args.issue_key or i.get("issue_key") == args.issue_key)
                      and (not args.rule or args.rule in str(i.get("rule", "")))]
            if not issues:
                continue
        ids = {i.get("id") for i in issues}
        fixes = [f for f in record.get("fixes") or [] if ids & set(f.get("issues") or [])]
        found.append({"record_id": record.get("record_id"), "layer": record.get("layer"), "task": task,
                      "outcome": record.get("outcome"), "issues": issues, "fixes": fixes})
    return found


def repository_root() -> Path:
    return Path(__file__).resolve().parents[2]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--root", type=Path, default=repository_root())
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("start", help="print framework_ref for the run that is starting")
    adding = commands.add_parser("append", help="validate one record (JSON from --input or stdin) and append it")
    adding.add_argument("--input", help="UTF-8 JSON file; safer than a pipe on Windows PowerShell")
    commands.add_parser("check", help="validate every stored record")
    finding = commands.add_parser("query", help="list stored records and their matching issues and fixes")
    for flag in ("--layer", "--plan-set", "--task", "--issue-key", "--rule"):
        finding.add_argument(flag)
    args = parser.parse_args()
    root = args.root.resolve()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    try:
        if args.command == "start":
            result: Any = {"framework_ref": framework_ref(root)}
        elif args.command == "append":
            result = {"passed": True, **append(root, _read_input(args.input))}
        elif args.command == "check":
            errors = check(root)
            result = {"passed": not errors, "errors": errors}
        else:
            result = query(root, args)
    except (RecordError, LayerArtifactError, OSError) as exc:
        print(json.dumps({"passed": False, "errors": [str(exc)]}, ensure_ascii=False, indent=2))
        return 1
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if not (isinstance(result, dict) and result.get("passed") is False) else 1


if __name__ == "__main__":
    raise SystemExit(main())
