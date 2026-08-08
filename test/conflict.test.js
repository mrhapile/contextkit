import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { installContext } from "../packages/installer/src/install.js";

test("reports conflicts without overwriting user edits", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "contextkit-conflict-"));
  await installContext({
    cwd,
    agents: ["generic"],
    skills: ["scope"],
  });

  const targetFile = path.join(cwd, "AGENTS.md");
  await writeFile(targetFile, "user changes\n");

  const rerun = await installContext({
    cwd,
    agents: ["generic"],
    skills: ["scope"],
  });

  assert.equal(rerun.conflicts.length, 1);
  assert.match(rerun.conflicts[0], /AGENTS\.md/);
  const content = await readFile(targetFile, "utf8");
  assert.equal(content, "user changes\n");
});

test("force overwrites all conflicting files", async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), "contextkit-force-"));
  await installContext({
    cwd,
    agents: ["generic"],
    skills: ["scope"],
  });

  const targetFile = path.join(cwd, "AGENTS.md");
  await writeFile(targetFile, "user changes\n");

  const rerun = await installContext({
    cwd,
    agents: ["generic"],
    skills: ["scope"],
    force: true,
  });

  assert.equal(rerun.conflicts.length, 0);
  const content = await readFile(targetFile, "utf8");
  assert.match(content, /Workspace Guide/);
  assert.notEqual(content, "user changes\n");
});
