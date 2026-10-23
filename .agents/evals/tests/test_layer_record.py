"""Check the record writer's public contract: accepted records, actionable rejections and stored lines."""
from __future__ import annotations

import copy
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

EVALS = Path(__file__).resolve().parents[1]
TOOL = EVALS / "layer_record.py"

AGENTS = """# AI Agent roles

| ID | Expertise | Used in |
| --- | --- | --- |
| `business-analyst` | Business logic | plan, review |
| `code-analyst` | Flow tracing | plan, verify, review |
| `backend-developer` | Non-UI code | implement |
| `code-reviewer` | Challenges the diff | verify, review |
| `process-auditor` | Self-evaluation | audit |

# Other section
"""
# Records are stored as UTF-8 without escaping; this sample checks that non-ASCII text survives.
NON_ASCII = "Không quét tài liệu ngoài đường dẫn Plan"
REF = {"commit": "none", "files": {"AGENTS.md": "0123456789ab"}}
IMPLEMENT = {
    "layer": "implement",
    "framework_ref": REF,
    "task": {"plan_set": "sign-in_20261014-090000", "task_ids": ["T01"]},
    "target_repo": ".",
    "outcome": {"status": "implemented", "summary": "Added a check for expired OTP codes"},
    "roles": [
        {"role": "backend-developer", "mode": "agent", "assignment": "Fix OTP verification", "result": "PASS"},
        {"role": "code-reviewer", "mode": "agent", "assignment": "Conclude QG-01", "result": "PASS"},
    ],
    "audit": {"role": "process-auditor", "mode": "agent", "result": "issues"},
    "issues": [{
        "id": "ISSUE-01", "issue_key": "skip-consistency-sweep", "role": "backend-developer", "record": None,
        "cause": "instruction", "decision": "Did not sweep documentation outside the Plan paths",
        "rule": ".agents/instructions/implement.instructions.md#implementing-and-repairing-per-review",
        "evidence": "The API index still describes the old behavior", "prior_fix": None,
    }],
    "fixes": [{
        "id": "FIX-01", "issues": ["ISSUE-01"], "status": "applied",
        "files": [{"path": ".agents/instructions/implement.instructions.md", "section": "Implementing and repairing per Review"}],
        "summary": "State that indexes and status tables must be swept", "checks": ["python -B -m unittest discover"],
    }],
    "evaluates": None,
    "supersedes": None,
}


class LayerRecordTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        (self.root / "AGENTS.md").write_text(AGENTS, encoding="utf-8")
        # Reports live wherever the user puts them; by default under the Hub root.
        self.report = self.root / "sign-in_20261014-090000/t01-otp/round-01.md"
        self.report.parent.mkdir(parents=True)
        self.report.write_text("---\n---\n", encoding="utf-8")

    def run_tool(self, *args, payload=None, raw=None):
        stdin = raw if raw is not None else (json.dumps(payload, ensure_ascii=False).encode("utf-8") if payload is not None else b"")
        result = subprocess.run([sys.executable, "-B", str(TOOL), "--root", str(self.root), *args], input=stdin, capture_output=True)
        return result.returncode, json.loads(result.stdout.decode("utf-8"))

    def append(self, payload):
        return self.run_tool("append", payload=payload)

    def stored(self):
        return [json.loads(line) for path in sorted((self.root / ".agents/evals/records").glob("*/*.jsonl"))
                for line in path.read_text(encoding="utf-8").splitlines()]

    def test_append_stores_one_utf8_line_with_tool_fields(self):
        payload = copy.deepcopy(IMPLEMENT)
        payload["outcome"]["summary"] = NON_ASCII
        code, result = self.append(payload)
        self.assertEqual(code, 0, result)
        self.assertTrue(result["record_id"].startswith("implement-") and result["record_id"].endswith("-T01"))
        self.assertTrue(result["path"].startswith(".agents/evals/records/implement/"))
        [record] = self.stored()
        self.assertEqual(record["schema"], "pirl-record/v1")
        self.assertEqual(record["outcome"]["summary"], NON_ASCII)
        self.assertTrue(record["recorded_at"].endswith("+07:00"))
        code, again = self.append(IMPLEMENT)
        self.assertEqual(code, 0, again)
        self.assertNotEqual(again["record_id"], result["record_id"])

    def test_input_file_with_bom_keeps_non_ascii_text(self):
        payload = copy.deepcopy(IMPLEMENT)
        payload["issues"][0]["decision"] = NON_ASCII
        source = self.root / "record.json"
        source.write_bytes(b"\xef\xbb\xbf" + json.dumps(payload, ensure_ascii=False).encode("utf-8"))
        code, result = self.run_tool("append", "--input", str(source))
        self.assertEqual(code, 0, result)
        self.assertEqual(self.stored()[0]["issues"][0]["decision"], NON_ASCII)
        code, result = self.run_tool("append", raw="not JSON".encode("utf-8"))
        self.assertNotEqual(code, 0)

    def test_rejections_name_the_broken_rule(self):
        def variant(change):
            data = copy.deepcopy(IMPLEMENT)
            change(data)
            return data

        cases = {
            "self-evaluation cannot apply": variant(lambda d: d["audit"].update(mode="self")),
            "has no fix": variant(lambda d: d.update(fixes=[])),
            "ineffective_fix must name an earlier fix": variant(lambda d: d["issues"][0].update(cause="ineffective_fix")),
            "unknown role": variant(lambda d: d["roles"][0].update(role="implementer")),
            "not registered for this layer": variant(lambda d: d["roles"][0].update(role="business-analyst")),
            "did not take part": variant(lambda d: d["issues"][0].update(role="code-analyst")),
            "set by the tool": variant(lambda d: d.update(record_id="x")),
            "mode_self is only valid": variant(lambda d: d["fixes"][0].update(status="pending_user", reason="mode_self")),
            "audit.result": variant(lambda d: d["audit"].update(result="clean")),
        }
        for message, payload in cases.items():
            with self.subTest(message=message):
                code, result = self.append(payload)
                self.assertNotEqual(code, 0)
                self.assertIn(message, " ".join(result["errors"]))
        self.assertEqual(self.stored(), [])

    def test_pending_fixes_follow_mode_and_safety(self):
        self_run = copy.deepcopy(IMPLEMENT)
        self_run["audit"]["mode"] = "self"
        self_run["fixes"][0].update(status="pending_user", reason="mode_self")
        self.assertEqual(self.append(self_run)[0], 0)
        safety = copy.deepcopy(IMPLEMENT)
        safety["fixes"][0].update(status="pending_user", reason="safety")
        self.assertEqual(self.append(safety)[0], 0)
        repository = copy.deepcopy(IMPLEMENT)
        repository["issues"][0]["cause"] = "input"
        repository["fixes"][0].update(status="pending_user", reason="repository",
                                      files=[{"path": "sign-in_20261014-090000", "section": "Target repository context documentation"}])
        self.assertEqual(self.append(repository)[0], 0)
        unknown = copy.deepcopy(IMPLEMENT)
        unknown["fixes"][0].update(status="pending_user", reason="later")
        self.assertNotEqual(self.append(unknown)[0], 0)

    def test_ineffective_fix_and_review_link_earlier_records(self):
        _, first = self.append(IMPLEMENT)
        repeat = copy.deepcopy(IMPLEMENT)
        repeat["issues"][0].update(cause="ineffective_fix", prior_fix=f"{first['record_id']}#FIX-01")
        code, second = self.append(repeat)
        self.assertEqual(code, 0, second)
        review = {
            **copy.deepcopy(IMPLEMENT),
            "layer": "review",
            "task": {"plan_set": "sign-in_20261014-090000", "task_ids": ["T01"],
                     "report_file": self.report.relative_to(self.root).as_posix()},
            "outcome": {"status": "completed", "verdict": "FAIL", "summary": "FIND-01 expired OTP"},
            "roles": [{"role": "code-reviewer", "mode": "agent", "assignment": "Challenge the diff", "result": "PASS"}],
            "evaluates": second["record_id"],
        }
        review["issues"][0].update(role="code-reviewer", record=second["record_id"], cause="execution",
                                   decision="Missed the expired OTP branch")
        code, result = self.append(review)
        self.assertEqual(code, 0, result)
        absolute = copy.deepcopy(review)
        absolute["task"]["report_file"] = str(self.report)
        self.assertEqual(self.append(absolute)[0], 0)
        missing = copy.deepcopy(review)
        missing["evaluates"] = "implement-20000101-000000-T01"
        self.assertNotEqual(self.append(missing)[0], 0)
        found = self.run_tool("query", "--issue-key", "skip-consistency-sweep")[1]
        self.assertEqual([r["layer"] for r in found], ["implement", "implement", "review", "review"])
        self.assertEqual(found[0]["fixes"][0]["id"], "FIX-01")
        self.assertEqual(len(self.run_tool("query", "--layer", "review", "--task", "T01")[1]), 2)

    def test_check_resolves_references_by_time_not_by_layer_folder(self):
        _, first = self.append(IMPLEMENT)
        review = {
            **copy.deepcopy(IMPLEMENT),
            "layer": "review",
            "task": {"plan_set": "sign-in_20261014-090000", "task_ids": ["T01"],
                     "report_file": self.report.relative_to(self.root).as_posix()},
            "outcome": {"status": "completed", "verdict": "FAIL", "summary": "FIND-01 expired OTP"},
            "roles": [{"role": "code-reviewer", "mode": "agent", "assignment": "Challenge the diff", "result": "PASS"}],
            "evaluates": first["record_id"],
        }
        review["issues"][0].update(role="code-reviewer", record=first["record_id"], cause="execution")
        _, judged = self.append(review)
        # The review folder sorts after the implement folder, yet this later implement record names the review's fix.
        repeat = copy.deepcopy(IMPLEMENT)
        repeat["issues"][0].update(cause="ineffective_fix", prior_fix=f"{judged['record_id']}#FIX-01")
        code, second = self.append(repeat)
        self.assertEqual(code, 0, second)
        self.assertEqual(self.run_tool("check")[0], 0)
        # A reference to a record written later than the referrer is still an error.
        path = self.root / judged["path"]
        text = path.read_text(encoding="utf-8")
        later = text.replace('"recorded_at":"20', '"recorded_at":"29', 1)
        self.assertNotEqual(later, text)
        path.write_text(later, encoding="utf-8")
        code, result = self.run_tool("check")
        self.assertNotEqual(code, 0)
        self.assertTrue(any("prior_fix" in error for error in result["errors"]), result)

    def test_check_reads_stored_v1_lines_and_reports_corruption(self):
        self.assertEqual(self.append(IMPLEMENT)[0], 0)
        self.assertEqual(self.run_tool("check")[0], 0)
        [path] = (self.root / ".agents/evals/records").glob("*/*.jsonl")
        with path.open("a", encoding="utf-8") as handle:
            handle.write("{broken\n")
        code, result = self.run_tool("check")
        self.assertNotEqual(code, 0)
        self.assertTrue(any("invalid JSON" in error for error in result["errors"]))
        self.assertNotEqual(self.append(IMPLEMENT)[0], 0)

    @unittest.skipUnless(shutil.which("git"), "git is required")
    def test_start_pins_commit_and_changed_framework_files(self):
        self.assertEqual(self.append(IMPLEMENT)[0], 0)
        skill = self.root / ".skills/pirl-plan/SKILL.md"
        skill.parent.mkdir(parents=True)
        skill.write_text("---\nname: plan\n---\n", encoding="utf-8")
        ref = self.run_tool("start")[1]["framework_ref"]
        self.assertEqual(ref["commit"], "none")
        # Skills are framework files; records are local output, not framework content.
        self.assertEqual(sorted(ref["files"]), [".skills/pirl-plan/SKILL.md", "AGENTS.md"])
        git = ["git", "-C", str(self.root), "-c", "user.email=t@t", "-c", "user.name=t"]
        subprocess.run([*git, "init", "-q"], check=True)
        subprocess.run([*git, "add", "-A"], check=True)
        subprocess.run([*git, "commit", "-qm", "init"], check=True)
        (self.root / "AGENTS.md").write_text(AGENTS + "\nchanged\n", encoding="utf-8")
        ref = self.run_tool("start")[1]["framework_ref"]
        self.assertRegex(ref["commit"], r"^[0-9a-f]{40}$")
        self.assertEqual(list(ref["files"]), ["AGENTS.md"])


if __name__ == "__main__":
    unittest.main()
