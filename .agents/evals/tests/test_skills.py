"""Check the layer skills as packages (frontmatter, resources, helper scripts) and the links between framework files."""
from __future__ import annotations

import json
import re
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

EVALS = Path(__file__).resolve().parents[1]
REPO = EVALS.parents[1]
SKILLS = REPO / ".skills"
sys.path.insert(0, str(EVALS))
from layer_record import FRAMEWORK_PATHS, LAYERS, NOT_FRAMEWORK, NOT_FRAMEWORK_TRACKED, RECORDS  # noqa: E402
from validate_layer_artifact import CATALOG, parse_yaml_subset  # noqa: E402

# Skills for the kinds of work outside a layer, as listed in AGENTS.md under "Choosing a layer".
WORK_SKILLS = ("pirl-standalone", "pirl-maintain")
LINK = re.compile(r"\[[^\]]*\]\(([^)\s]+)\)")
FENCE = re.compile(r"(?ms)^(`{3,})[^\n]*\n.*?^\1\s*$")


def git(*args: str) -> subprocess.CompletedProcess:
    return subprocess.run(["git", "-C", str(REPO), "-c", "core.quotepath=off", *args], capture_output=True, text=True)


def repository_files(pattern: str = "*") -> list[str]:
    """Every file Git tracks or would track (ignored outputs excluded), so no hand-kept list decides what is checked."""

    return sorted(set(git("ls-files", "--cached", "--others", "--exclude-standard", "--", pattern).stdout.splitlines()))


HAS_GIT = shutil.which("git") is not None and git("rev-parse", "--git-dir").returncode == 0


def anchors(path: Path) -> set[str]:
    """GitHub heading anchors: lowercase, punctuation dropped, spaces turned into hyphens."""

    text = FENCE.sub("", path.read_text(encoding="utf-8"))
    return {re.sub(r"[^\w\- ]", "", heading.strip().lower()).replace(" ", "-")
            for heading in re.findall(r"(?m)^#{1,6} (.+)$", text)}


class SkillPackageTests(unittest.TestCase):
    def test_each_layer_has_a_complete_skill(self):
        for layer in LAYERS:
            skill = SKILLS / f"pirl-{layer}"
            with self.subTest(skill=layer):
                text = (skill / "SKILL.md").read_text(encoding="utf-8")
                header = text.split("---")[1]
                meta = parse_yaml_subset(header, f"{skill.name}/SKILL.md")
                self.assertEqual(meta.get("name"), skill.name)
                self.assertTrue(isinstance(meta.get("description"), str) and 0 < len(meta["description"]) <= 1024)
                self.assertEqual(meta.get("metadata", {}).get("layer"), layer)
                self.assertRegex(str(meta.get("metadata", {}).get("version")), r"^\d+\.\d+\.\d+$")
                self.assertTrue((REPO / f".agents/instructions/{layer}.instructions.md").is_file())
                for folder in ("assets", "references", "scripts"):
                    self.assertTrue([p for p in (skill / folder).glob("*") if p.is_file()], f"{skill.name}/{folder} is empty")
        self.assertEqual(set(SKILLS.iterdir()), {SKILLS / f"pirl-{name}" for name in LAYERS} | {SKILLS / name for name in WORK_SKILLS})

    def test_each_work_skill_opens_no_layer(self):
        for name in WORK_SKILLS:
            with self.subTest(skill=name):
                text = (SKILLS / name / "SKILL.md").read_text(encoding="utf-8")
                meta = parse_yaml_subset(text.split("---")[1], f"{name}/SKILL.md")
                self.assertEqual(meta.get("name"), name)
                self.assertTrue(isinstance(meta.get("description"), str) and 0 < len(meta["description"]) <= 1024)
                self.assertEqual(meta.get("metadata", {}).get("kind"), "skill")
                self.assertNotIn("layer", meta.get("metadata", {}))
                self.assertRegex(str(meta.get("metadata", {}).get("version")), r"^\d+\.\d+\.\d+$")


@unittest.skipUnless(HAS_GIT, "a git checkout is required")
class FrameworkLinkTests(unittest.TestCase):
    def test_relative_links_and_anchors_resolve(self):
        for source in (REPO / name for name in repository_files("*.md")):
            text = FENCE.sub("", source.read_text(encoding="utf-8"))
            for target in LINK.findall(text):
                if re.match(r"[a-z]+:", target):
                    continue
                file_part, _, anchor = target.partition("#")
                resolved = (source.parent / file_part).resolve() if file_part else source
                with self.subTest(source=source.relative_to(REPO).as_posix(), target=target):
                    self.assertTrue(resolved.exists(), "link target does not exist")
                    if anchor and resolved.suffix == ".md":
                        self.assertIn(anchor, anchors(resolved))


@unittest.skipUnless(HAS_GIT, "a git checkout is required")
class PrivateOutputTests(unittest.TestCase):
    """Plan packages, their reports and records describe the user's projects and must stay out of Git.

    The paths come from the scripts and constants that produce them, so a change in how outputs are named is
    checked against .gitignore instead of a hand-written sample that would keep passing.
    """

    def ignored(self, path):
        return git("check-ignore", "--no-index", "-q", path).returncode == 0

    def test_produced_outputs_are_ignored(self):
        new_plan = SKILLS / "pirl-plan/scripts/new_plan.py"
        new_review = SKILLS / "pirl-review/scripts/new_review.py"
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            produced = []
            for extra in ([], ["--out-dir", "plans"]):
                result = subprocess.run([sys.executable, "-X", "utf8", "-B", str(new_plan), "--root", str(root),
                                         "--request-slug", "order-email", "--todo-slug", "send-email", *extra],
                                        capture_output=True, text=True, encoding="utf-8")
                plan = json.loads(result.stdout)
                self.assertEqual(result.returncode, 0, plan)
                result = subprocess.run([sys.executable, "-X", "utf8", "-B", str(new_review), "--root", str(root),
                                         "--plan", plan["path"], "--todo-slug", "send-email", *extra],
                                        capture_output=True, text=True, encoding="utf-8")
                review = json.loads(result.stdout)
                self.assertEqual(result.returncode, 0, review)
                produced += [plan["path"], review["path"]]
        produced.append(f"{RECORDS}/plan/2026-10-23.jsonl")
        for path in produced:
            with self.subTest(path=path):
                self.assertTrue(self.ignored(path))

    def test_no_tracked_file_is_ignored(self):
        self.assertEqual(git("ls-files", "--cached", "--ignored", "--exclude-standard").stdout.splitlines(), [])

    def test_every_tracked_file_is_classified(self):
        def framework(path):
            return any(path == base or path.startswith(base + "/") for base in FRAMEWORK_PATHS)

        for path in repository_files():
            if any(prefix in path for prefix in NOT_FRAMEWORK):
                continue
            with self.subTest(path=path):
                self.assertTrue(framework(path) or path in NOT_FRAMEWORK_TRACKED,
                                "add the path to FRAMEWORK_PATHS or NOT_FRAMEWORK_TRACKED in layer_record.py")


class SkillScriptTests(unittest.TestCase):
    """Run the helper scripts against a temporary Hub and check their output with the real validator."""

    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.root = Path(temporary.name)
        (self.root / CATALOG).parent.mkdir(parents=True)
        shutil.copy(REPO / CATALOG, self.root / CATALOG)

    def run_script(self, script, *args):
        result = subprocess.run([sys.executable, "-X", "utf8", "-B", str(script), "--root", str(self.root), *args],
                                capture_output=True, text=True, encoding="utf-8")
        return result.returncode, json.loads(result.stdout)

    def validate(self, kind, path):
        result = subprocess.run([sys.executable, "-X", "utf8", "-B", str(EVALS / "validate_layer_artifact.py"),
                                 "--root", str(self.root), "--kind", kind, "--path", str(path)],
                                capture_output=True, text=True, encoding="utf-8")
        return result.returncode, json.loads(result.stdout)

    def new_plan(self, *args):
        return self.run_script(SKILLS / "pirl-plan/scripts/new_plan.py", *args)

    def fill_plan(self, path):
        text = path.read_text(encoding="utf-8")
        for placeholder, value in (("[<planning-role>]", "[code-analyst]"), ("[<implementation-role>]", "[backend-developer]"),
                                   ("[<verification-role>]", "[code-reviewer]")):
            text = text.replace(placeholder, value)
        text = re.sub(r'(?m)^target_repo: ".*"$', 'target_repo: "."', text)
        path.write_text(text, encoding="utf-8")

    def test_plan_package_review_rounds_and_record_pass_the_validator(self):
        code, first = self.new_plan("--request-slug", "order-email", "--todo-slug", "send-email")
        self.assertEqual(code, 0, first)
        self.assertEqual(first["task_id"], "T01")
        self.assertRegex(first["path"], r"^order-email_\d{8}-\d{6}/01-plan-send-email-\d{8}-\d{6}\.md$")
        code, second = self.new_plan("--plan-set", first["plan_set"], "--todo-slug", "log-email")
        self.assertEqual(code, 0, second)
        self.assertEqual(second["task_id"], "T02")
        self.assertTrue(second["path"].endswith(first["plan_set"].split("_")[1] + ".md"))
        self.assertNotEqual(self.new_plan("--request-slug", "Bad Slug", "--todo-slug", "x")[0], 0)
        plan = self.root / first["path"]
        for path in (plan, self.root / second["path"]):
            self.fill_plan(path)
        code, result = self.validate("plan", plan.parent)
        self.assertEqual(code, 0, result)

        review = SKILLS / "pirl-review/scripts/new_review.py"
        code, round_one = self.run_script(review, "--plan", first["path"], "--todo-slug", "send-email")
        self.assertEqual(code, 0, round_one)
        self.assertEqual((round_one["review_round"], round_one["prior_review"]), (1, None))
        self.assertTrue(round_one["path"].startswith(f"{first['plan_set']}/t01-send-email/round-01-review-send-email-"))
        self.assertEqual(self.validate("review", self.root / round_one["path"])[0], 0)
        code, round_two = self.run_script(review, "--plan", first["path"], "--todo-slug", "send-email")
        self.assertEqual(code, 0, round_two)
        self.assertEqual((round_two["review_round"], round_two["prior_review"]), (2, round_one["path"]))
        code, result = self.validate("review", self.root / round_two["path"])
        self.assertEqual(code, 0, result)

        record = SKILLS / "pirl-implement/scripts/add_implementation_record.py"
        self.assertEqual(self.run_script(record, "--plan", first["path"])[0], 0)
        self.assertNotEqual(self.run_script(record, "--plan", first["path"])[0], 0)
        text = plan.read_text(encoding="utf-8").replace("status: planned", "status: implemented", 1)
        text = text.replace("- status: awaiting_confirmation | implemented | blocked | failed", "- status: implemented")
        plan.write_text(text, encoding="utf-8")
        code, result = self.validate("plan", plan)
        self.assertEqual(code, 0, result)

    def test_plan_and_layout_run_outside_the_default_location(self):
        outside = tempfile.TemporaryDirectory()
        self.addCleanup(outside.cleanup)
        code, plan = self.new_plan("--request-slug", "cart", "--todo-slug", "badge", "--out-dir", outside.name)
        self.assertEqual(code, 0, plan)
        self.assertTrue(Path(plan["path"]).is_absolute() and Path(plan["path"]).is_file())
        code, run = self.run_script(SKILLS / "pirl-implement/scripts/new_layout_run.py", "--plan", plan["path"])
        self.assertEqual(code, 0, run)
        self.assertRegex(run["path"], rf"^\.tmp/layout-snapshots/{plan['plan_set']}/T01/\d{{8}}-\d{{6}}$")
        self.assertTrue((self.root / run["path"]).is_dir())


if __name__ == "__main__":
    unittest.main()
