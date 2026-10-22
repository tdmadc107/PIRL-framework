#!/usr/bin/env python3
"""Check Plan/Review handoff inputs and references, without grading their prose."""

from __future__ import annotations

import argparse
import ast
import json
import re
from collections import deque
from datetime import datetime, timedelta
from pathlib import Path, PureWindowsPath
from typing import Any

PLAN_SCHEMA = "pirl-plan/v1"
REVIEW_SCHEMA = "pirl-review/v1"
PLAN_HEADINGS = ("What to do", "How to do it", "Participating roles", "Required quality gates")
REVIEW_HEADINGS = ("Business", "Evaluations")
PLAN_STATUSES = ("planned", "awaiting_confirmation", "implemented", "blocked", "failed")
TASK_PATTERN = re.compile(r"T\d{2,}")
ROLE_USAGES = ("plan", "implement", "verify", "review", "audit")
ROLE_SECTION = re.compile(r"(?ms)^# AI Agent roles\s*$(.*?)(?=^# |\Z)")
ROLE_ROW = re.compile(r"^\|\s*`([a-z0-9]+(?:-[a-z0-9]+)*)`\s*\|(.*)\|\s*$")


class LayerArtifactError(ValueError):
    pass


# ---------- constrained YAML subset (frontmatter) ----------


def _scalar(raw: str, source: str, number: int) -> Any:
    value = raw.strip()
    if not value:
        raise LayerArtifactError(f"{source}:{number}: expected a scalar value")
    lowered = value.lower()
    if lowered in ("true", "false"):
        return lowered == "true"
    if lowered in ("null", "~"):
        return None
    if value.startswith(("[", "{", "'", '"')):
        try:
            return ast.literal_eval(value)
        except (SyntaxError, ValueError) as exc:
            if value.startswith("[") and value.endswith("]"):
                inner = value[1:-1].strip()
                parts = [part.strip() for part in inner.split(",")] if inner else []
                if all(parts):
                    return [_scalar(part, source, number) for part in parts]
            raise LayerArtifactError(f"{source}:{number}: invalid quoted or inline value: {value}") from exc
    try:
        return int(value)
    except ValueError:
        return value


def parse_yaml_subset(text: str, source: str) -> dict[str, Any]:
    """Parse mappings, scalar lists and inline scalar collections; reject anything else."""

    tokens: list[tuple[int, str, int]] = []
    for number, raw_line in enumerate(text.splitlines(), 1):
        if not raw_line.strip() or raw_line.lstrip().startswith("#"):
            continue
        lead = raw_line[: len(raw_line) - len(raw_line.lstrip())]
        if "\t" in lead:
            raise LayerArtifactError(f"{source}:{number}: tabs are not valid indentation")
        indent = len(raw_line) - len(raw_line.lstrip(" "))
        if indent % 2:
            raise LayerArtifactError(f"{source}:{number}: indentation must use two spaces")
        tokens.append((indent, raw_line.strip(), number))
    if not tokens:
        return {}
    if tokens[0][0] != 0:
        raise LayerArtifactError(f"{source}:{tokens[0][2]}: top-level key must be unindented")

    def block(index: int, indent: int) -> tuple[Any, int]:
        if index >= len(tokens) or tokens[index][0] != indent:
            line = tokens[index][2] if index < len(tokens) else len(text.splitlines())
            raise LayerArtifactError(f"{source}:{line}: malformed indentation")
        is_list = tokens[index][1].startswith("- ")
        container: Any = [] if is_list else {}
        while index < len(tokens):
            current, content, number = tokens[index]
            if current < indent:
                break
            if current > indent:
                raise LayerArtifactError(f"{source}:{number}: unexpected indentation")
            if is_list:
                if not content.startswith("- "):
                    raise LayerArtifactError(f"{source}:{number}: mixed list and mapping block")
                item = content[2:].strip()
                if not item or (":" in item and not item.startswith(("'", '"'))):
                    raise LayerArtifactError(f"{source}:{number}: only scalar list items are supported")
                container.append(_scalar(item, source, number))
                index += 1
                continue
            if content.startswith("- ") or ":" not in content:
                raise LayerArtifactError(f"{source}:{number}: expected a mapping entry")
            key, raw_value = content.split(":", 1)
            key = key.strip()
            if not key:
                raise LayerArtifactError(f"{source}:{number}: mapping key is empty")
            if key in container:
                raise LayerArtifactError(f"{source}:{number}: duplicate key {key!r}")
            raw_value = raw_value.strip()
            index += 1
            if raw_value:
                container[key] = _scalar(raw_value, source, number)
            elif index < len(tokens) and tokens[index][0] > indent:
                if tokens[index][0] != indent + 2:
                    raise LayerArtifactError(f"{source}:{tokens[index][2]}: nested blocks must indent two spaces")
                container[key], index = block(index, indent + 2)
            else:
                container[key] = {}
        return container, index

    parsed, end = block(0, 0)
    if end != len(tokens) or not isinstance(parsed, dict):
        raise LayerArtifactError(f"{source}: root must be a mapping")
    return parsed


def read_frontmatter(path: Path) -> tuple[dict[str, Any], str]:
    """Return the parsed frontmatter and the body of a Plan/Review Markdown file."""

    return _frontmatter_and_body(path)


def _frontmatter_and_body(path: Path) -> tuple[dict[str, Any], str]:
    try:
        lines = path.read_text(encoding="utf-8").splitlines()
        if not lines or lines[0].strip() != "---":
            raise LayerArtifactError("missing frontmatter")
        end = next(i for i in range(1, len(lines)) if lines[i].strip() == "---")
        return parse_yaml_subset("\n".join(lines[1:end]), path.as_posix()), "\n".join(lines[end + 1:])
    except (OSError, UnicodeError, StopIteration, RecursionError) as exc:
        raise LayerArtifactError(f"{path}: cannot read metadata: {exc}") from exc


# ---------- registry read from AGENTS.md ----------


def load_roles(root: Path) -> dict[str, set[str]]:
    """Return role ID -> usages from the role table in AGENTS.md."""

    try:
        text = (root / "AGENTS.md").read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        raise LayerArtifactError(f"AGENTS.md: cannot read role catalog: {exc}") from exc
    section = ROLE_SECTION.search(text)
    if section is None:
        raise LayerArtifactError("AGENTS.md: missing '# AI Agent roles' section")
    roles: dict[str, set[str]] = {}
    for line in section.group(1).splitlines():
        row = ROLE_ROW.match(line.strip())
        if row is None:
            continue
        usages = {item.strip() for item in row.group(2).rsplit("|", 1)[-1].split(",") if item.strip()}
        if not usages or not usages <= set(ROLE_USAGES):
            raise LayerArtifactError(f"AGENTS.md: role {row.group(1)} has invalid usage {sorted(usages)}")
        roles[row.group(1)] = usages
    if not roles:
        raise LayerArtifactError("AGENTS.md: role catalog has no roles")
    return roles


def resolve_path(value: Any, root: Path) -> Path:
    """Resolve a path written in a Plan, report or record: relative to the Hub root, or absolute."""

    if not isinstance(value, str) or not value.strip():
        raise LayerArtifactError("expected a path relative to the Hub root or an absolute path")
    path = Path(value.strip())
    return (path if path.is_absolute() or PureWindowsPath(value.strip()).drive else root / path).resolve()


# ---------- field helpers ----------


def _timestamp(value: Any, label: str, errors: list[str]) -> None:
    try:
        parsed = datetime.fromisoformat(value) if isinstance(value, str) else None
        if parsed is None or parsed.utcoffset() != timedelta(hours=7):
            raise ValueError("expected ISO-8601 with +07:00")
    except ValueError as exc:
        errors.append(f"{label}: invalid timestamp ({exc})")


def _strings(value: Any, label: str, errors: list[str], required: bool = False) -> list[str]:
    if not isinstance(value, list) or not all(isinstance(x, str) and x.strip() for x in value):
        errors.append(f"{label}: expected an array of non-empty strings")
        return []
    if required and not value:
        errors.append(f"{label}: at least one entry is required")
    if len(set(value)) != len(value):
        errors.append(f"{label}: duplicate entries")
    return value


def _roles(
    value: Any,
    label: str,
    usage: str,
    catalog: dict[str, set[str]],
    errors: list[str],
    required: bool,
) -> list[str]:
    names = _strings(value, label, errors, required)
    for name in names:
        if name not in catalog:
            errors.append(f"{label}: unknown role {name}")
        elif usage not in catalog[name]:
            errors.append(f"{label}: role {name} is not registered for {usage}")
    return names


def _reference_path(value: Any, root: Path, label: str) -> Path:
    path = resolve_path(value, root)
    if not path.is_file():
        raise LayerArtifactError(f"{label}: {value} is not an existing file")
    return path


def _basic(path: Path, root: Path, kind: str) -> tuple[list[str], dict[str, Any], str]:
    errors: list[str] = []
    try:
        if path.suffix != ".md":
            raise LayerArtifactError("expected a Markdown file")
        metadata, body = _frontmatter_and_body(path)
    except LayerArtifactError as exc:
        return [str(exc)], {}, ""
    expected = PLAN_SCHEMA if kind == "plan" else REVIEW_SCHEMA
    if metadata.get("schema") != expected:
        errors.append(f"schema must be {expected}")
    task = metadata.get("task_id")
    if not isinstance(task, str) or not TASK_PATTERN.fullmatch(task):
        errors.append("task_id must identify a task, for example T01")
    if metadata.get("content_language") != "en":
        errors.append("content_language must be en")
    for heading in PLAN_HEADINGS if kind == "plan" else REVIEW_HEADINGS:
        if not re.search(rf"(?m)^## {re.escape(heading)}\s*$", body):
            errors.append(f"missing handoff section: {heading}")
    _timestamp(metadata.get("created_at" if kind == "plan" else "reviewed_at"), "timestamp", errors)
    return errors, metadata, body


# ---------- Plan ----------


def _plan_file(path: Path, root: Path) -> tuple[list[str], dict[str, Any]]:
    errors, metadata, body = _basic(path, root, "plan")
    if not metadata:
        return errors, metadata
    for key in ("plan_set", "title", "target_repo", "source_request"):
        if not isinstance(metadata.get(key), str) or not metadata[key].strip():
            errors.append(f"{key}: non-empty text is required")
    if metadata.get("plan_set") != path.parent.name:
        errors.append("plan_set must identify the containing package")
    if metadata.get("layer") != "implement" or metadata.get("status") not in PLAN_STATUSES:
        errors.append("invalid Plan layer/status")
    # The target repository is any existing directory the user named (AGENTS.md, Target repository).
    target = metadata.get("target_repo")
    if isinstance(target, str) and target.strip() and not resolve_path(target, root).is_dir():
        errors.append(f"target_repo: {target} is not an existing directory (relative to the Hub root or absolute)")
    try:
        catalog = load_roles(root)
    except LayerArtifactError as exc:
        errors.append(str(exc))
    else:
        _roles(metadata.get("planning_roles"), "planning_roles", "plan", catalog, errors, True)
        implementers = _roles(metadata.get("implementation_roles"), "implementation_roles", "implement", catalog, errors, True)
        verifiers = _roles(metadata.get("verification_roles"), "verification_roles", "verify", catalog, errors, True)
        if set(implementers) & set(verifiers):
            errors.append("verification_roles: a role cannot verify its own implementation")
    deps = _strings(metadata.get("depends_on"), "depends_on", errors)
    if any(not TASK_PATTERN.fullmatch(dep) for dep in deps):
        errors.append("depends_on: each entry must be a task ID")
    if metadata.get("status") != "planned":
        record = re.search(r"(?ms)^## Implementation Record\s*\n(.*)", body)
        if record is None:
            errors.append("missing Implementation Record")
        else:
            fields = dict(re.findall(r"(?m)^- ([A-Za-z_]+):\s*(.*)$", record[1]))
            if fields.get("status") != metadata.get("status"):
                errors.append("Implementation Record status differs from Plan status")
            _timestamp(fields.get("updated_at", "").strip('"'), "updated_at", errors)
    return errors, metadata


def _dependencies(records: list[tuple[Path, dict[str, Any]]]) -> list[str]:
    errors: list[str] = []
    tasks: dict[str, list[str]] = {}
    for path, data in records:
        task = data.get("task_id")
        if not isinstance(task, str) or not TASK_PATTERN.fullmatch(task):
            errors.append(f"{path}: invalid task_id")
            continue
        if task in tasks:
            errors.append(f"duplicate task_id: {task}")
        deps = _strings(data.get("depends_on"), f"{path}: depends_on", errors)
        tasks[task] = [dep for dep in deps if TASK_PATTERN.fullmatch(dep)]
        if len(tasks[task]) != len(deps):
            errors.append(f"{path}: invalid dependency ID")
    indegree = {task: 0 for task in tasks}
    children: dict[str, list[str]] = {task: [] for task in tasks}
    for task, deps in tasks.items():
        for dep in deps:
            if dep not in tasks:
                errors.append(f"{task}: dependency {dep} is not in this package")
            else:
                children[dep].append(task)
                indegree[task] += 1
    ready = deque(task for task, count in indegree.items() if count == 0)
    visited = 0
    while ready:
        task = ready.popleft()
        visited += 1
        for child in children[task]:
            indegree[child] -= 1
            if indegree[child] == 0:
                ready.append(child)
    if visited != len(tasks):
        errors.append("dependency cycle in this package")
    return errors


def validate_plan_path(path: Path, root: Path) -> list[str]:
    path, root = path.resolve(), root.resolve()
    if not path.exists():
        return ["expected an existing Plan file or package directory"]
    package = path.parent if path.is_file() else path
    selected = [path] if path.is_file() else sorted(path.glob("*.md"))
    if not selected:
        return ["Plan package has no Markdown files"]
    errors: list[str] = []
    records = []
    for item in sorted(package.glob("*.md")):
        try:
            records.append((item, _frontmatter_and_body(item)[0]))
        except LayerArtifactError as exc:
            errors.append(str(exc))
    errors.extend(_dependencies(records))
    for item in selected:
        errors.extend(f"{item}: {error}" for error in _plan_file(item, root)[0])
    return errors


# ---------- Review ----------


def validate_review_file(path: Path, root: Path) -> list[str]:
    root, path = root.resolve(), path.resolve()
    errors, metadata, _ = _basic(path, root, "review")
    if not metadata:
        return errors
    if metadata.get("status") not in ("completed", "blocked"):
        errors.append("status must be completed or blocked")
    if metadata.get("business_verdict") not in ("PASS", "FAIL", "BLOCKED") or metadata.get("verdict") != metadata.get("business_verdict"):
        errors.append("verdict must match business_verdict: PASS, FAIL or BLOCKED")
    round_number = metadata.get("review_round")
    if type(round_number) is not int or round_number < 1:
        errors.append("review_round must be a positive integer")
    try:
        plan = _reference_path(metadata.get("plan_file"), root, "plan_file")
        plan_metadata, _ = _frontmatter_and_body(plan)
        if plan_metadata.get("schema") != PLAN_SCHEMA or plan_metadata.get("task_id") != metadata.get("task_id"):
            errors.append("plan_file does not identify the reviewed Plan/task")
        prior = metadata.get("prior_review")
        if prior is not None:
            previous, _ = _frontmatter_and_body(_reference_path(prior, root, "prior_review"))
            same_plan = resolve_path(previous.get("plan_file"), root) == plan if previous.get("plan_file") else False
            if not same_plan or previous.get("task_id") != metadata.get("task_id"):
                errors.append("prior_review belongs to another Plan/task")
            if type(round_number) is int and previous.get("review_round") != round_number - 1:
                errors.append("prior_review must identify the preceding round")
        elif type(round_number) is int and round_number > 1:
            errors.append("prior_review is required after round 1")
        catalog = load_roles(root)
        _roles(metadata.get("review_roles"), "review_roles", "review", catalog, errors, True)
        _roles(metadata.get("repair_roles"), "repair_roles", "implement", catalog, errors, False)
    except (OSError, UnicodeError, LayerArtifactError, RecursionError) as exc:
        errors.append(str(exc))
    return errors


def repository_root() -> Path:
    return Path(__file__).resolve().parents[2]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--kind", choices=("plan", "review"), required=True)
    parser.add_argument("--path", type=Path, required=True)
    parser.add_argument("--root", type=Path, default=repository_root())
    args = parser.parse_args()
    validator = validate_plan_path if args.kind == "plan" else validate_review_file
    errors = validator(args.path, args.root)
    print(json.dumps({"passed": not errors, "kind": args.kind, "path": args.path.as_posix(), "errors": errors}, ensure_ascii=False, indent=2))
    return 0 if not errors else 1


if __name__ == "__main__":
    raise SystemExit(main())
