#!/usr/bin/env python3
"""Create the report of the next Review round for a Plan task from the review skill's template.

The layout, naming and location rules are owned by ../references/review-format.md; this script fills only
what a tool can compute (plan_file, task ID, round, prior_review, timestamp, title) and leaves every <...>
placeholder to the coordinator. Work that belongs to the current round edits that round's report instead.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime
from pathlib import Path

SKILL = Path(__file__).resolve().parents[1]
HUB = SKILL.parents[1]
sys.path.insert(0, str(HUB / ".agents" / "evals"))
from validate_layer_artifact import PLAN_SCHEMA, LayerArtifactError, read_frontmatter, resolve_path  # noqa: E402

TEMPLATE = SKILL / "assets" / "review-template.md"
SLUG = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*")
ROUND = re.compile(r"round-(\d{2,})-review-.+\.md")


def shown(path: Path, root: Path) -> str:
    """A path as Plans and reports write it: relative to the Hub root when inside it, otherwise absolute."""

    return path.relative_to(root).as_posix() if path.is_relative_to(root) else path.as_posix()


def create(root: Path, plan: str, todo_slug: str, out_dir: str | None) -> dict[str, object]:
    if not SLUG.fullmatch(todo_slug):
        raise LayerArtifactError("--todo-slug must be ASCII kebab-case")
    plan_path = resolve_path(plan, root)
    if not plan_path.is_file():
        raise LayerArtifactError(f"{plan} is not an existing Plan file (relative to the Hub root or absolute)")
    metadata, _ = read_frontmatter(plan_path)
    if metadata.get("schema") != PLAN_SCHEMA or not metadata.get("plan_set") or not metadata.get("task_id"):
        raise LayerArtifactError(f"{plan} is not a {PLAN_SCHEMA} Plan with plan_set and task_id")
    task_id = str(metadata["task_id"])
    folder = (resolve_path(out_dir, root) if out_dir else root) / str(metadata["plan_set"]) / f"{task_id.lower()}-{todo_slug}"
    rounds = sorted((int(m.group(1)), p) for p in (folder.glob("*.md") if folder.is_dir() else []) if (m := ROUND.fullmatch(p.name)))
    number = rounds[-1][0] + 1 if rounds else 1
    prior = json.dumps(shown(rounds[-1][1], root), ensure_ascii=False) if rounds else "null"
    now = datetime.now().astimezone()
    target = folder / f"round-{number:02d}-review-{todo_slug}-{now:%Y%m%d-%H%M%S}.md"
    if target.exists():
        raise LayerArtifactError(f"{shown(target, root)} already exists")
    text = (TEMPLATE.read_text(encoding="utf-8")
            .replace("{{plan_file}}", shown(plan_path, root))
            .replace("{{task_id}}", task_id)
            .replace("{{review_round_padded}}", f"{number:02d}")
            .replace("{{review_round}}", str(number))
            .replace("{{prior_review}}", prior)
            .replace("{{reviewed_at}}", now.isoformat(timespec="seconds"))
            .replace("{{title}}", str(metadata.get("title") or "<Task name>")))
    folder.mkdir(parents=True, exist_ok=True)
    target.write_text(text, encoding="utf-8", newline="\n")
    return {"path": shown(target, root), "review_round": number, "prior_review": json.loads(prior)}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--plan", required=True, help="the reviewed Plan file, relative to the Hub root or absolute")
    parser.add_argument("--todo-slug", required=True, help="ASCII kebab-case slug of the reviewed task")
    parser.add_argument("--out-dir", help="directory holding the report's package folder, relative to the Hub root or absolute; default: the Hub root")
    parser.add_argument("--root", type=Path, default=HUB, help="Hub root (default: the Hub containing this script)")
    args = parser.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    try:
        result = {"passed": True, **create(args.root.resolve(), args.plan, args.todo_slug, args.out_dir)}
    except (LayerArtifactError, OSError) as exc:
        result = {"passed": False, "errors": [str(exc)]}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
