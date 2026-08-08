import assert from "node:assert/strict";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { installContext } from "../packages/installer/src/install.js";
import { supportedSkillNames } from "../packages/installer/src/manifest.js";
import { mergeSkillInventorySection } from "../packages/installer/src/terminal-ui.js";

test("installs context files into a clean project", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "contextkit-install-"));
  const result = await installContext({
    cwd,
    agents: ["codex"],
    skills: ["scope", "test"],
  });

  assert.equal(result.conflicts.length, 0);
  assert.ok(result.created >= 4);

  const rootGuide = await readFile(path.join(cwd, "AGENTS.md"), "utf8");
  assert.match(rootGuide, /Workspace Guide/);

  const manifest = JSON.parse(await readFile(path.join(cwd, ".contextkit/manifest.json"), "utf8"));
  assert.equal(manifest.package, "@akashanand/contextkit");
  assert.deepEqual(manifest.agents, ["codex"]);
  assert.deepEqual(manifest.skills, ["scope", "test"]);

  const skillGuide = await readFile(path.join(cwd, ".contextkit/skills/scope.md"), "utf8");
  assert.match(skillGuide, /Scope/);

  const agentGuide = await readFile(path.join(cwd, ".codex/AGENTS.md"), "utf8");
  assert.match(agentGuide, /Codex Workspace Guide/);
});

test("dry-run does not write files", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "contextkit-dry-run-"));
  const result = await installContext({
    cwd,
    agents: ["claude"],
    skills: ["core"],
    dryRun: true,
  });

  assert.equal(result.dryRun, true);
  await assert.rejects(stat(path.join(cwd, "AGENTS.md")));
  await assert.rejects(stat(path.join(cwd, ".contextkit/manifest.json")));
});

test("rerunning the installer on an unchanged project is safe", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "contextkit-rerun-"));

  await installContext({
    cwd,
    agents: ["cursor"],
    skills: ["scope", "test"],
  });

  const rerun = await installContext({
    cwd,
    agents: ["cursor"],
    skills: ["scope", "test"],
  });

  assert.equal(rerun.conflicts.length, 0);
  assert.ok(rerun.skipped >= 4);
});

test("installs the full base context and lists installed skills in AGENTS.md", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "contextkit-full-base-"));

  const result = await installContext({
    cwd,
    agents: ["cursor"],
    skills: ["all"],
    scope: "all",
  });

  assert.equal(result.conflicts.length, 0);

  const manifest = JSON.parse(await readFile(path.join(cwd, ".contextkit/manifest.json"), "utf8"));
  assert.deepEqual(manifest.skills, supportedSkillNames);

  const rootGuide = await readFile(path.join(cwd, "AGENTS.md"), "utf8");
  assert.match(rootGuide, /Installed Skills/);
  assert.match(rootGuide, /`scope`/);
  assert.match(rootGuide, /\.contextkit\/skills\/sync\.md/);

  for (const fileName of [
    "agent-context.md",
    "ai-workflow-rules.md",
    "code-standards.md",
    "architecture.md",
    "progress-tracker.md",
    "project-overview.md",
    "ui-context.md",
  ]) {
    const content = await readFile(path.join(cwd, fileName), "utf8");
    assert.ok(content.length > 0);
  }

  const allSkills = [
    "scope",
    "architect",
    "develop",
    "test",
    "audit",
    "check",
    "debug",
    "document",
    "sync",
  ];
  for (const skill of allSkills) {
    const skillGuide = await readFile(path.join(cwd, ".contextkit/skills", `${skill}.md`), "utf8");
    assert.ok(skillGuide.length > 0);
  }
});

test("merges only the AGENTS.md skill inventory section when requested", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "contextkit-merge-"));

  await installContext({
    cwd,
    agents: ["generic"],
    skills: ["scope", "test"],
    scope: "core",
  });

  const targetFile = path.join(cwd, "AGENTS.md");
  const original = await readFile(targetFile, "utf8");
  const edited = original.replace(
    "This project was initialized with `contextkit`.",
    "This project was initialized with `contextkit`.\n\nUser note: keep this line.",
  );
  await import("node:fs/promises").then(({ writeFile }) => writeFile(targetFile, edited));

  const rerun = await installContext({
    cwd,
    agents: ["generic"],
    skills: ["scope", "test", "debug"],
    scope: "core",
    conflictResolver: async ({ file, existingContent, nextContent }) => {
      if (file.path === "AGENTS.md") {
        return {
          action: "merge",
          content: mergeSkillInventorySection(existingContent, nextContent),
        };
      }
      return { action: "overwrite", content: nextContent };
    },
  });

  assert.equal(rerun.conflicts.length, 0);
  const merged = await readFile(targetFile, "utf8");
  assert.match(merged, /User note: keep this line\./);
  assert.match(merged, /contextkit:skill-inventory:start/);
  assert.match(merged, /`debug`/);
});
