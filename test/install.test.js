import assert from "node:assert/strict";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { installContext } from "../packages/installer/src/install.js";

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
