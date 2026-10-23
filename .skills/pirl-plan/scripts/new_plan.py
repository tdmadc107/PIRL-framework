#!/usr/bin/env python3
"""Create one Plan task file from the plan skill's template, with the computed values filled in.

The layout, naming and location rules are owned by ../references/plan-format.md; this script fills only
what a tool can compute (package name, task ID, file name, timestamp) and leaves every <...> placeholder
to the coordinator. It never overwrites a file.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

SKILL = Path(__file__).resolve().parents[1]
HUB = SKILL.parents[1]
sys.path.insert(0, str(HUB / ".agents" / "evals"))
from validate_layer_artifact import LayerArtifactError, read_frontmatter, resolve_path  # noqa: E402

TEMPLATE = SKILL / "assets" / "plan-template.md"
TZ = timezone(timedelta(hours=7))
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")
PLAN_SET = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*_(\d{8}-\d{6})")
TASK = re.compile(r"T(\d{2,})")


def shown(path: Path, root: Path) -> str:
    """A path as Plans and reports write it: relative to the Hub root when inside it, otherwise absolute."""

    return path.relative_to(root).as_posix() if path.is_relative_to(root) else path.as_posix()


def create(root: Path, todo_slug: str, request_slug: str | None, plan_set: str | None, out_dir: str | None) -> dict[str, str]:
    if not SLUG.fullmatch(todo_slug):
        raise LayerArtifactError("--todo-slug must be ASCII kebab-case")
    base = resolve_path(out_dir, root) if out_dir else root
    now = datetime.now(TZ)
    if request_slug is not None:
        if not SLUG.fullmatch(request_slug):
            raise LayerArtifactError("--request-slug must be ASCII kebab-case")
        plan_set = f"{request_slug}_{now:%Y%m%d-%H%M%S}"
        package = base / plan_set
        if package.exists():
            raise LayerArtifactError(f"{shown(package, root)} already exists; pass --plan-set to add a task to it")
    else:
        if not plan_set or not PLAN_SET.fullmatch(plan_set):
            raise LayerArtifactError("--plan-set must have the form <request-slug>_<YYYYMMDD-HHmmss>")
        package = base / plan_set
        if not package.is_dir():
            raise LayerArtifactError(f"{shown(package, root)} is not an existing Plan package")
    stamp = PLAN_SET.fullmatch(plan_set).group(1)
    numbers = [0]
    for item in sorted(package.glob("*.md")) if package.is_dir() else []:
        match = TASK.fullmatch(str(read_frontmatter(item)[0].get("task_id", "")))
        if match:
            numbers.append(int(match.group(1)))
    number = max(numbers) + 1
    task_id = f"T{number:02d}"
    target = package / f"{number:02d}-plan-{todo_slug}-{stamp}.md"
    if target.exists():
        raise LayerArtifactError(f"{shown(target, root)} already exists")
    text = (TEMPLATE.read_text(encoding="utf-8")
            .replace("{{plan_set}}", plan_set)
            .replace("{{task_id}}", task_id)
            .replace("{{created_at}}", now.isoformat(timespec="seconds")))
    package.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8", newline="\n")
    return {"path": shown(target, root), "plan_set": plan_set, "task_id": task_id}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--todo-slug", required=True, help="ASCII kebab-case slug of this task")
    start = parser.add_mutually_exclusive_group(required=True)
    start.add_argument("--request-slug", help="ASCII kebab-case slug of the request; starts a new package")
    start.add_argument("--plan-set", help="name of an existing package; adds the next task to it")
    parser.add_argument("--out-dir", help="directory holding the package, relative to the Hub root or absolute; default: the Hub root")
    parser.add_argument("--root", type=Path, default=HUB, help="Hub root (default: the Hub containing this script)")
    args = parser.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    try:
        result = {"passed": True, **create(args.root.resolve(), args.todo_slug, args.request_slug, args.plan_set, args.out_dir)}
    except (LayerArtifactError, OSError) as exc:
        result = {"passed": False, "errors": [str(exc)]}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
