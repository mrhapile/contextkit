import path from "node:path";
import { ensureDir, pathExists, writeJsonFileSafe, writeTextFileSafe } from "./fs.js";
import {
  buildSignature,
  getAgentGuidePath,
  getSkillPath,
  manifestPath,
  packageName,
  packageVersion,
  readExistingManifest,
  readSkillMarkdown,
  resolveSkills,
} from "./manifest.js";
import { renderAgentGuide, renderCursorRule, renderRootGuide } from "./template-loader.js";

export async function buildInstallationPlan({ agents, skills }) {
  const files = [
    {
      path: "AGENTS.md",
      type: "guide",
      content: await renderRootGuide(),
    },
  ];

  for (const skill of skills) {
    files.push({
      path: getSkillPath(skill),
      type: "skill",
      content: readSkillMarkdown(skill),
    });
  }

  for (const agent of agents) {
    if (agent === "generic") {
      continue;
    }
    const relativePath = getAgentGuidePath(agent);
    files.push({
      path: relativePath,
      type: "agent",
      content: agent === "cursor" ? await renderCursorRule() : await renderAgentGuide(agent),
    });
  }

  return files;
}

export async function installContext({
  cwd = process.cwd(),
  agents = ["generic"],
  skills = ["scope", "architect", "develop", "test"],
  force = false,
  dryRun = false,
} = {}) {
  const absoluteCwd = path.resolve(cwd);
  const normalizedSkills = resolveSkills({ skills });
  const plan = await buildInstallationPlan({ agents, skills: normalizedSkills });
  const manifest = {
    package: packageName,
    version: packageVersion,
    cwd: absoluteCwd,
    agents: [...agents],
    skills: [...normalizedSkills],
    signature: buildSignature({
      version: packageVersion,
      agents,
      skills,
      files: plan.map((file) => ({ path: file.path, hash: hashContent(file.content) })),
    }),
    files: plan.map((file) => ({ path: file.path, type: file.type })),
  };

  const results = [];
  const conflicts = [];

  for (const file of plan) {
    const filePath = path.join(absoluteCwd, file.path);
    const result = await writeTextFileSafe(filePath, file.content, { force, dryRun });
    results.push(result);
    if (result.status === "conflict") {
      conflicts.push(file.path);
    }
  }

  const manifestFilePath = path.join(absoluteCwd, manifestPath());
  const existingManifest = await readExistingManifest(absoluteCwd);
  if (!dryRun) {
    await ensureDir(path.dirname(manifestFilePath));
    const shouldWriteManifest =
      !existingManifest ||
      existingManifest.signature !== manifest.signature ||
      existingManifest.package !== manifest.package ||
      existingManifest.version !== manifest.version ||
      JSON.stringify(existingManifest.agents ?? []) !== JSON.stringify(manifest.agents) ||
      JSON.stringify(existingManifest.skills ?? []) !== JSON.stringify(manifest.skills);

    if (shouldWriteManifest) {
      const payload = {
        ...manifest,
        installedAt: new Date().toISOString(),
      };
      await writeJsonFileSafe(manifestFilePath, payload, { dryRun: false });
    } else if (!(await pathExists(manifestFilePath))) {
      await writeJsonFileSafe(manifestFilePath, {
        ...manifest,
        installedAt: new Date().toISOString(),
      }, { dryRun: false });
    }
  }

  const counts = results.reduce(
    (accumulator, entry) => {
      accumulator[entry.status] += 1;
      return accumulator;
    },
    { created: 0, updated: 0, skipped: 0, conflict: 0 },
  );

  return {
    cwd: absoluteCwd,
    agents,
    skills,
    created: counts.created,
    updated: counts.updated,
    skipped: counts.skipped,
    conflicts,
    dryRun,
  };
}

function hashContent(content) {
  let hash = 0;
  for (let index = 0; index < content.length; index += 1) {
    hash = Math.imul(31, hash) + content.charCodeAt(index);
    hash |= 0;
  }
  return `${content.length}:${hash >>> 0}`;
}
