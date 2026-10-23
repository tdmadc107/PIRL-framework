#!/usr/bin/env python3
"""Append the Implementation Record template to a Plan file that has no record yet, with updated_at filled in.

The record's layout is owned by ../references/implementation-record-format.md and its content by the
Implement contract; an existing record is edited in place, so this script refuses to add a second one.
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
from validate_layer_artifact import PLAN_SCHEMA, LayerArtifactError, read_frontmatter, resolve_path  # noqa: E402

TEMPLATE = SKILL / "assets" / "implementation-record-template.md"
TZ = timezone(timedelta(hours=7))
RECORD = re.compile(r"(?m)^## Implementation Record\s*$")


def add(root: Path, plan: str) -> dict[str, object]:
    path = resolve_path(plan, root)
    if not path.is_file():
        raise LayerArtifactError(f"{plan} is not an existing Plan file (relative to the Hub root or absolute)")
    metadata, body = read_frontmatter(path)
    if metadata.get("schema") != PLAN_SCHEMA:
        raise LayerArtifactError(f"{plan} is not a {PLAN_SCHEMA} Plan")
    if RECORD.search(body):
        raise LayerArtifactError(f"{plan} already has an Implementation Record; edit it in place")
    record = TEMPLATE.read_text(encoding="utf-8").replace("{{updated_at}}", datetime.now(TZ).isoformat(timespec="seconds"))
    text = path.read_text(encoding="utf-8")
    with path.open("a", encoding="utf-8", newline="\n") as handle:
        handle.write(("" if text.endswith("\n") else "\n") + "\n" + record)
    return {"path": plan}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--plan", required=True, help="the Plan file, relative to the Hub root or absolute")
    parser.add_argument("--root", type=Path, default=HUB, help="Hub root (default: the Hub containing this script)")
    args = parser.parse_args()
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    try:
        result = {"passed": True, **add(args.root.resolve(), args.plan)}
    except (LayerArtifactError, OSError) as exc:
        result = {"passed": False, "errors": [str(exc)]}
    print(json.dumps(result, ensure_ascii=False, indent=2))
    return 0 if result["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
