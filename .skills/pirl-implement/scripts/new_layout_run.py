#!/usr/bin/env python3
"""Create the directory of one layout capture run for a Plan task: .tmp/layout-snapshots/<plan-set>/<task-id>/<timestamp>/.

When to capture and what to record belong to .agents/instructions/layout-verification.instructions.md; this script only
creates a new, empty run directory under the Hub root and never reuses an earlier one.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

SKILL = Path(__file__).resolve().parents[1]
HUB = SKILL.parents[1]
sys.path.insert(0, str(HUB / ".agents" / "evals"))
from validate_layer_artifact import PLAN_SCHEMA, LayerArtifactError, read_frontmatter, resolve_path  # noqa: E402

TZ = timezone(timedelta(hours=7))


def create(root: Path, plan: str) -> dict[str, object]:
    path = resolve_path(plan, root)
    if not path.is_file():
        raise LayerArtifactError(f"{plan} is not an existing Plan file (relative to the Hub root or absolute)")
    metadata, _ = read_frontmatter(path)
    if metadata.get("schema") != PLAN_SCHEMA or not metadata.get("plan_set") or not metadata.get("task_id"):
        raise LayerArtifactError(f"{plan} is not a {PLAN_SCHEMA} Plan with plan_set and task_id")
    run = root / ".tmp" / "layout-snapshots" / str(metadata["plan_set"]) / str(metadata["task_id"]) / f"{datetime.now(TZ):%Y%m%d-%H%M%S}"
    run.mkdir(parents=True)
    return {"path": run.relative_to(root).as_posix()}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--plan", required=True, help="the Plan file, relative to the Hub root or absolute")
    parser.add_argument("--root", type=Path, default=HUB, help="Hub root (default: the Hub containing this script)")
    args = parser.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    try:
        result = {"passed": True, **create(args.root.resolve(), args.plan)}
    except (LayerArtifactError, OSError) as exc:
        result = {"passed": False, "errors": [str(exc)]}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
