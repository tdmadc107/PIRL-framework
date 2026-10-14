"""Check the public Plan/Review handoff and the role catalog, not per-line editorial rules."""
from __future__ import annotations

import json
import re
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

EVALS = Path(__file__).resolve().parents[1]
REPO = EVALS.parents[2]
sys.path.insert(0, str(EVALS))
from validate_layer_artifact import load_roles  # noqa: E402

AGENTS = """# Vai trò AI Agent

| ID | Chuyên môn | Dùng ở |
| --- | --- | --- |
| `business-analyst` | Logic nghiệp vụ | plan, review |
| `code-analyst` | Lần luồng | plan, verify, review |
| `backend-developer` | Viết source | implement |
| `code-reviewer` | Phản biện diff | verify, review |
| `process-auditor` | Tự đánh giá | audit |

# Mục khác
"""
MANIFEST = """schema: "pirl-repos/v1"
repos:
  demo:
    path: ".repos/demo"
    product: "Demo"
"""
PLAN = """---
schema: pirl-plan/v1
content_language: vi
plan_set: request_20260909-090000
task_id: T01
title: Short API task
layer: implement
status: planned
depends_on: []
created_at: "2026-09-09T09:00:00+07:00"
target_repo: .
source_request: Review API DTO ownership
planning_roles: [code-analyst]
implementation_roles: [backend-developer]
verification_roles: [code-reviewer]
---
# API task
## Cần làm gì
API DTO HTTP response contract.
## Làm như thế nào
Read the input and return the requested result.
## Vai trò tham gia
Use the roles assigned above.
## Tiêu chí chất lượng bắt buộc
The caller receives the requested data.
"""
REVIEW = """---
schema: pirl-review/v1
content_language: vi
plan_file: ".agents/plan/request_20260909-090000/task.md"
task_id: T01
review_round: 1
prior_review: null
review_roles: [code-analyst, code-reviewer, business-analyst]
repair_roles: []
business_verdict: PASS
verdict: PASS
status: completed
reviewed_at: "2026-09-09T10:00:00+07:00"
---
## Business
The selected result satisfies the request.
## Evaluations
Roles and supporting sources were reviewed.
"""


class HandoffIOTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        (self.root / "AGENTS.md").write_text(AGENTS, encoding="utf-8")
        (self.root / ".repos").mkdir()
        (self.root / ".repos/manifest.yaml").write_text(MANIFEST, encoding="utf-8")
        self.plan = self.root / ".agents/plan/request_20260909-090000/task.md"
        self.plan.parent.mkdir(parents=True)
        self.plan.write_text(PLAN, encoding="utf-8")

    def check(self, kind, path):
        result = subprocess.run(
            [sys.executable, "-X", "utf8", "-B", str(EVALS / "validate_layer_artifact.py"),
             "--root", str(self.root), "--kind", kind, "--path", str(path)],
            capture_output=True, text=True, encoding="utf-8",
        )
        return result.returncode, json.loads(result.stdout)

    def write_plan(self, text):
        self.plan.write_text(text, encoding="utf-8")
        return self.check("plan", self.plan)

    def test_plan_and_review_accept_complete_handoffs_without_scoring_prose(self):
        code, result = self.check("plan", self.plan)
        self.assertEqual(code, 0, result)
        report = self.root / ".agents/review/request_20260909-090000/t01-api/round-01.md"
        report.parent.mkdir(parents=True)
        report.write_text(REVIEW, encoding="utf-8")
        code, result = self.check("review", report)
        self.assertEqual(code, 0, result)
        for invalid in (
            REVIEW.replace("task.md", "missing.md"),
            REVIEW.replace("review_round: 1", "review_round: 2"),
            REVIEW.replace("verdict: PASS\nstatus", "verdict: FAIL\nstatus"),
            REVIEW.replace("review_roles: [code-analyst, code-reviewer, business-analyst]", "review_roles: [backend-developer]"),
            REVIEW.replace("repair_roles: []", "repair_roles: [business-analyst]"),
        ):
            with self.subTest(invalid=invalid):
                report.write_text(invalid, encoding="utf-8")
                code, result = self.check("review", report)
                self.assertNotEqual(code, 0)
                self.assertFalse(result["passed"])

    def test_plan_roles_come_from_the_catalog_and_verifier_differs_from_implementation_role(self):
        for invalid, field in (
            (PLAN.replace("verification_roles: [code-reviewer]", "verification_roles: []"), "verification_roles"),
            (PLAN.replace("verification_roles: [code-reviewer]", "verification_roles: [unknown-role]"), "verification_roles"),
            (PLAN.replace("verification_roles: [code-reviewer]", "verification_roles: [business-analyst]"), "verification_roles"),
            (PLAN.replace("implementation_roles: [backend-developer]", "implementation_roles: [code-reviewer]"), "implementation_roles"),
            (PLAN.replace("verification_roles: [code-reviewer]", "verification_roles: [process-auditor]"), "verification_roles"),
            (PLAN.replace("planning_roles: [code-analyst]", "planning_roles: [backend-developer]"), "planning_roles"),
        ):
            with self.subTest(field=field, invalid=invalid):
                code, result = self.write_plan(invalid)
                self.assertNotEqual(code, 0)
                self.assertTrue(any(field in error for error in result["errors"]), result)

    def test_target_repo_must_be_hub_or_registered_path(self):
        target = PLAN.replace("target_repo: .", 'target_repo: ".repos/demo"')
        (self.root / ".gitmodules").write_text('[submodule ".repos/demo"]\n\tpath = .repos/demo\n', encoding="utf-8")
        self.assertEqual(self.write_plan(target)[0], 0)
        code, result = self.write_plan(PLAN.replace("target_repo: .", 'target_repo: ".repos/other"'))
        self.assertNotEqual(code, 0)
        self.assertTrue(any("target_repo" in error for error in result["errors"]), result)
        (self.root / ".gitmodules").unlink()
        code, result = self.write_plan(target)
        self.assertNotEqual(code, 0)
        self.assertTrue(any("not a submodule" in error for error in result["errors"]), result)

    def test_status_beyond_planned_requires_a_matching_implementation_record(self):
        implemented = PLAN.replace("status: planned", "status: implemented")
        self.assertNotEqual(self.write_plan(implemented)[0], 0)
        record = '\n## Implementation Record\n- status: implemented\n- updated_at: "2026-09-09T11:00:00+07:00"\n'
        self.assertEqual(self.write_plan(implemented + record)[0], 0)
        self.assertNotEqual(self.write_plan(implemented + record.replace("status: implemented", "status: failed"))[0], 0)

    def test_invalid_dependencies_and_metadata_return_errors_for_file_and_package(self):
        for invalid in ("depends_on: [[]]", "depends_on: [T99]", "depends_on: [T01]"):
            self.plan.write_text(PLAN.replace("depends_on: []", invalid), encoding="utf-8")
            for path in (self.plan, self.plan.parent):
                with self.subTest(invalid=invalid, path=path):
                    code, result = self.check("plan", path)
                    self.assertNotEqual(code, 0)
                    self.assertTrue(result["errors"])
        self.assertNotEqual(self.write_plan(PLAN.replace("2026-09-09T09", "2026-99-99T09"))[0], 0)


class RoleCatalogTests(unittest.TestCase):
    """Layer role tables must use IDs that AGENTS.md registers for that layer."""

    LAYER_USAGES = {
        "plan": {"plan", "audit"},
        "implement": {"implement", "verify", "audit"},
        "review": {"review", "audit"},
    }
    # A table row starts with the role ID, plain or linked to its role file.
    ROW = re.compile(r"(?m)^\| (?:\[`([a-z0-9-]+)`\]\(([^)]+)\)|`([a-z0-9-]+)`) \|")

    def test_layer_role_tables_match_the_agents_catalog(self):
        catalog = load_roles(REPO)
        for layer, usages in self.LAYER_USAGES.items():
            path = REPO / f".agents/instructions/{layer}.instructions.md"
            section = re.search(rf"(?ms)^## Vai trò AI Agent tại layer {layer.capitalize()}\s*$(.*?)(?=^## )", path.read_text(encoding="utf-8"))
            self.assertIsNotNone(section, layer)
            rows = self.ROW.findall(section.group(1))
            self.assertTrue(rows, layer)
            for linked, target, plain in rows:
                role = linked or plain
                with self.subTest(layer=layer, role=role):
                    self.assertIn(role, catalog)
                    self.assertTrue(catalog[role] & usages, f"{role} is not registered for {layer}")
                    if target:
                        self.assertEqual((path.parent / target).resolve(), (REPO / f".agents/roles/{role}.role.md").resolve())

    def test_every_catalog_role_has_exactly_one_role_file(self):
        catalog = load_roles(REPO)
        files = {p.name.removesuffix(".role.md"): p for p in (REPO / ".agents/roles").glob("*.role.md")}
        self.assertEqual(set(files), set(catalog))
        for role, path in files.items():
            with self.subTest(role=role):
                header = path.read_text(encoding="utf-8").split("---")[1]
                self.assertIn(f"id: .agents/roles/{role}\n", header)
                self.assertRegex(header, r"(?m)^version: \d+\.\d+\.\d+$")


if __name__ == "__main__":
    unittest.main()
