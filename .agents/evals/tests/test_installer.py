"""Run the installer (bin/pirl.mjs) against temporary workspaces: install, adapters, removal and update with merges."""
from __future__ import annotations

import json
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

REPO = Path(__file__).resolve().parents[3]
# An installed copy has no package.json: the installer is tested in the source repository only.
PACKAGE = json.loads((REPO / "package.json").read_text(encoding="utf-8")) if (REPO / "package.json").is_file() else None
HOST_FILES = {
    "claude": (".claude/rules/pirl.md", ".claude/skills"),
    "copilot": (".github/instructions/pirl.instructions.md", ".github/skills"),
    "codex": ("AGENTS.md", ".agents/skills"),
    "cursor": (".cursor/rules/pirl.mdc", ".cursor/skills"),
    "gemini": ("GEMINI.md", ".gemini/skills"),
}


def make_package(destination: Path, version: str | None = None) -> Path:
    """A copy of what npm would publish: package.json, LICENSE, README.md and the `files` list, without local outputs."""

    destination.mkdir(parents=True)
    for rel in ("LICENSE", "README.md"):
        shutil.copy(REPO / rel, destination / rel)
    for entry in PACKAGE["files"]:
        if entry.endswith("/"):
            shutil.copytree(REPO / entry, destination / entry, ignore=shutil.ignore_patterns("__pycache__", "records"))
        elif "*" in entry:
            for source in REPO.glob(entry):
                (destination / entry).parent.mkdir(parents=True, exist_ok=True)
                shutil.copy(source, destination / source.relative_to(REPO))
        else:
            (destination / entry).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy(REPO / entry, destination / entry)
    (destination / "package.json").write_text(json.dumps(dict(PACKAGE, version=version or PACKAGE["version"])), encoding="utf-8")
    return destination


@unittest.skipUnless(PACKAGE and shutil.which("node") and shutil.which("git"), "the package source, node and git are required")
class InstallerTests(unittest.TestCase):
    def setUp(self):
        temporary = tempfile.TemporaryDirectory()
        self.addCleanup(temporary.cleanup)
        self.temp = Path(temporary.name)
        self.package = make_package(self.temp / "package-a")
        self.ws = self.temp / "workspace"
        self.ws.mkdir()
        subprocess.run(["git", "-C", str(self.ws), "init", "-q"], check=True)
        (self.ws / "AGENTS.md").write_text("# Shop\n\nRun the tests with `make test`.\n", encoding="utf-8")

    def run_cli(self, *args, package=None, cwd=None):
        script = (package or self.package) / "bin/pirl.mjs"
        result = subprocess.run(["node", str(script), *args], cwd=cwd or self.ws, stdin=subprocess.DEVNULL,
                                capture_output=True, text=True, encoding="utf-8")
        return result.returncode, result.stdout + result.stderr

    def manifest(self):
        return json.loads((self.ws / ".pirl/manifest.json").read_text(encoding="utf-8"))

    def test_install_creates_each_host_adapter_and_keeps_private_outputs_out_of_git(self):
        code, out = self.run_cli("init", "--host", ",".join(HOST_FILES))
        self.assertEqual(code, 0, out)
        skills = sorted(p.name for p in (self.ws / ".pirl/.skills").iterdir())
        agents = (self.ws / ".pirl/AGENTS.md").read_text(encoding="utf-8").strip()
        for host, (instructions, skill_dir) in HOST_FILES.items():
            with self.subTest(host=host):
                text = (self.ws / instructions).read_text(encoding="utf-8")
                self.assertIn(agents, text)
                self.assertIn((self.ws / ".pirl/CONTEXT.md").read_text(encoding="utf-8").strip(), text)
                self.assertEqual(sorted(p.name for p in (self.ws / skill_dir).iterdir()), skills)
                for skill in skills:
                    self.assertIn(f".pirl/.skills/{skill}/SKILL.md", (self.ws / skill_dir / skill / "SKILL.md").read_text(encoding="utf-8"))
        # The user's own AGENTS.md keeps its content; the PIRL part is a marked block after it.
        self.assertTrue((self.ws / "AGENTS.md").read_text(encoding="utf-8").startswith("# Shop\n\nRun the tests with `make test`.\n\n<!-- pirl:begin -->"))
        self.assertEqual(self.run_cli("check")[0], 0)
        self.assertEqual(self.run_cli("check", cwd=self.temp, package=self.ws / ".pirl")[0], 0)
        files = set(self.manifest()["files"])
        self.assertFalse([f for f in files if "records/" in f or "__pycache__" in f])
        self.assertIn(".gitignore", files)
        for private in (".pirl/order-email_20261028-101010/01-plan.md", ".pirl/.agents/evals/records/plan/2026-10-28.jsonl", ".pirl/.tmp/x"):
            with self.subTest(private=private):
                self.assertEqual(subprocess.run(["git", "-C", str(self.ws), "check-ignore", "-q", "--no-index", private]).returncode, 0)

    def test_install_restores_the_gitignore_that_npm_renames(self):
        # npm unpacks a published .gitignore as .npmignore; the Hub still needs it as .gitignore.
        (self.package / ".gitignore").rename(self.package / ".npmignore")
        code, out = self.run_cli("init", "--host", "claude")
        self.assertEqual(code, 0, out)
        self.assertTrue((self.ws / ".pirl/.gitignore").is_file())
        self.assertFalse((self.ws / ".pirl/.npmignore").exists())

    def test_install_refuses_what_it_did_not_create_and_leaves_nothing(self):
        own = self.ws / ".claude/skills/pirl-plan/SKILL.md"
        own.parent.mkdir(parents=True)
        own.write_text("my own skill\n", encoding="utf-8")
        code, out = self.run_cli("init", "--host", "claude")
        self.assertNotEqual(code, 0)
        self.assertIn("not created by", out)
        self.assertEqual(own.read_text(encoding="utf-8"), "my own skill\n")
        self.assertFalse((self.ws / ".pirl").exists())
        self.assertFalse((self.ws / ".claude/rules").exists())

    def test_without_a_terminal_hosts_must_be_named_and_the_folder_must_be_the_repository_root(self):
        code, out = self.run_cli("init")
        self.assertNotEqual(code, 0)
        self.assertIn("--host is required", out)
        (self.ws / "packages/web").mkdir(parents=True)
        code, out = self.run_cli("init", "--host", "claude", cwd=self.ws / "packages/web")
        self.assertNotEqual(code, 0)
        self.assertIn("not its root", out)
        self.assertFalse((self.ws / "packages/web/.pirl").exists())

    def test_sync_follows_framework_edits_and_protects_hand_edits(self):
        self.assertEqual(self.run_cli("init", "--host", "claude")[0], 0)
        with (self.ws / ".pirl/AGENTS.md").open("a", encoding="utf-8") as handle:
            handle.write("\nAn improvement.\n")
        self.assertNotEqual(self.run_cli("check")[0], 0)
        self.assertEqual(self.run_cli("sync")[0], 0)
        self.assertIn("An improvement.", (self.ws / ".claude/rules/pirl.md").read_text(encoding="utf-8"))
        self.assertEqual(self.run_cli("check")[0], 0)
        rule = self.ws / ".claude/rules/pirl.md"
        rule.write_text("edited by hand\n", encoding="utf-8")
        with (self.ws / ".pirl/AGENTS.md").open("a", encoding="utf-8") as handle:
            handle.write("\nAnother improvement.\n")
        code, out = self.run_cli("sync")
        self.assertNotEqual(code, 0)
        self.assertIn("edited by hand", out)
        self.assertEqual(rule.read_text(encoding="utf-8"), "edited by hand\n")
        self.assertEqual(self.run_cli("sync", "--force")[0], 0)
        self.assertIn("Another improvement.", rule.read_text(encoding="utf-8"))

    def test_remove_deletes_only_what_the_host_got(self):
        self.assertEqual(self.run_cli("init", "--host", "codex,gemini,claude")[0], 0)
        self.assertEqual(self.run_cli("remove", "--host", "codex,gemini")[0], 0)
        self.assertEqual((self.ws / "AGENTS.md").read_text(encoding="utf-8"), "# Shop\n\nRun the tests with `make test`.\n")
        self.assertFalse((self.ws / "GEMINI.md").exists())
        self.assertFalse((self.ws / ".agents").exists())
        self.assertFalse((self.ws / ".gemini").exists())
        self.assertTrue((self.ws / ".claude/rules/pirl.md").is_file())
        self.assertEqual(self.manifest()["hosts"], ["claude"])
        self.assertTrue((self.ws / ".pirl/AGENTS.md").is_file())

    def new_version(self, edit):
        package = make_package(self.temp / "package-b", version="9.9.9")
        edit(package)
        return package

    def test_update_keeps_local_improvements_and_merges_upstream_changes(self):
        self.assertEqual(self.run_cli("init", "--host", "claude")[0], 0)
        context = self.ws / ".pirl/CONTEXT.md"
        context.write_text(context.read_text(encoding="utf-8") + "\nA local improvement.\n", encoding="utf-8")

        def edit(package):
            text = (package / "CONTEXT.md").read_text(encoding="utf-8")
            (package / "CONTEXT.md").write_text("Upstream first line.\n" + text, encoding="utf-8")
            (package / ".skills/pirl-plan/new-file.md").write_text("new\n", encoding="utf-8")

        code, out = self.run_cli("update", "--base-dir", str(self.package), package=self.new_version(edit))
        self.assertEqual(code, 0, out)
        merged = context.read_text(encoding="utf-8")
        self.assertTrue(merged.startswith("Upstream first line.\n"))
        self.assertIn("A local improvement.", merged)
        self.assertTrue((self.ws / ".pirl/.skills/pirl-plan/new-file.md").is_file())
        self.assertEqual(self.manifest()["version"], "9.9.9")
        self.assertIn("Upstream first line.", (self.ws / ".claude/rules/pirl.md").read_text(encoding="utf-8"))
        self.assertFalse((self.ws / ".pirl/.tmp/update").exists())

    def test_update_stops_on_conflicts_until_they_are_resolved(self):
        self.assertEqual(self.run_cli("init", "--host", "claude")[0], 0)
        agents = self.ws / ".pirl/AGENTS.md"
        original = agents.read_text(encoding="utf-8")
        first = original.splitlines()[0]
        agents.write_text(original.replace(first, "# Local title", 1), encoding="utf-8")
        before = agents.read_text(encoding="utf-8")

        def edit(package):
            (package / "AGENTS.md").write_text(original.replace(first, "# Upstream title", 1), encoding="utf-8")

        package = self.new_version(edit)
        code, out = self.run_cli("update", "--base-dir", str(self.package), package=package)
        self.assertEqual(code, 2, out)
        self.assertEqual(agents.read_text(encoding="utf-8"), before)
        self.assertEqual(self.manifest()["version"], PACKAGE["version"])
        staged = self.ws / ".pirl/.tmp/update/files/AGENTS.md"
        self.assertIn("<<<<<<< local", staged.read_text(encoding="utf-8"))
        self.assertNotEqual(self.run_cli("update", "--continue", package=package)[0], 0)
        staged.write_text(original.replace(first, "# Merged title", 1), encoding="utf-8")
        code, out = self.run_cli("update", "--continue", package=self.ws / ".pirl")
        self.assertEqual(code, 0, out)
        self.assertTrue(agents.read_text(encoding="utf-8").startswith("# Merged title"))
        self.assertEqual(self.manifest()["version"], "9.9.9")


if __name__ == "__main__":
    unittest.main()
