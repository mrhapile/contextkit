#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempRoot = await mkdtemp(path.join(os.tmpdir(), "contextkit-public-install-"));
const tarballName = packRepository(repoRoot);
const tarballPath = path.join(repoRoot, tarballName);
const projectDir = path.join(tempRoot, "first-run");

try {
  execFileSync("npm", ["init", "-y"], {
    cwd: tempRoot,
    stdio: "ignore",
  });

  execFileSync("npm", ["install", "--no-save", tarballPath], {
    cwd: tempRoot,
    stdio: "ignore",
  });

  const cliPath = path.join(tempRoot, "node_modules", ".bin", "contextkit");
  const output = execFileSync(
    cliPath,
    ["init", "--dir", projectDir, "--agents", "codex", "--skills", "core"],
    {
      cwd: tempRoot,
      encoding: "utf8",
    },
  ).trim();

  assertOutput(output);
  await verifyExpectedFiles(projectDir);

  console.log("Public install smoke test passed.");
} finally {
  await rm(path.join(repoRoot, tarballName), { force: true });
}

function packRepository(cwd) {
  const packed = execFileSync("npm", ["pack", "--silent"], {
    cwd,
    encoding: "utf8",
  })
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .at(-1);

  if (!packed) {
    throw new Error("npm pack did not produce a tarball name");
  }

  return packed;
}

function assertOutput(output) {
  if (!output.includes("Installed context into")) {
    throw new Error(`Smoke test did not see the expected install output.\n${output}`);
  }
}

async function verifyExpectedFiles(projectDirPath) {
  const files = [
    "AGENTS.md",
    ".contextkit/manifest.json",
    ".contextkit/skills/scope.md",
    ".contextkit/skills/architect.md",
    ".contextkit/skills/develop.md",
    ".contextkit/skills/test.md",
    ".codex/AGENTS.md",
  ];

  for (const relativePath of files) {
    await stat(path.join(projectDirPath, relativePath));
  }

  const manifest = JSON.parse(await readFile(path.join(projectDirPath, ".contextkit/manifest.json"), "utf8"));
  if (manifest.package !== "@akashanand/contextkit") {
    throw new Error(`Unexpected manifest package: ${manifest.package}`);
  }
  if (manifest.agents?.[0] !== "codex") {
    throw new Error(`Unexpected manifest agents: ${JSON.stringify(manifest.agents)}`);
  }
  if (!Array.isArray(manifest.skills) || manifest.skills.join(",") !== "scope,architect,develop,test") {
    throw new Error(`Unexpected manifest skills: ${JSON.stringify(manifest.skills)}`);
  }
}
