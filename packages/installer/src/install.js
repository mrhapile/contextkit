import path from "node:path";
import { writeFile } from "node:fs/promises";
import { ensureDir, pathExists, readTextFile, writeJsonFileSafe } from "./fs.js";
import {
  buildSignature,
  getAgentGuidePath,
  getSkillDefinition,
  getSkillPath,
  manifestPath,
  packageName,
  packageVersion,
  readExistingManifest,
  readSkillMarkdown,
  resolveSkills,
} from "./manifest.js";
import { renderAgentGuide, renderBaseContextFile, renderCursorRule, renderRootGuide } from "./template-loader.js";

const coreBaseContextFiles = [
  { path: "agent-context.md", template: "agent-context.md" },
  { path: "ai-workflow-rules.md", template: "ai-workflow-rules.md" },
  { path: "code-standards.md", template: "code-standards.md" },
];

const fullBaseContextFiles = [
  ...coreBaseContextFiles,
  { path: "architecture.md", template: "architecture.md" },
  { path: "progress-tracker.md", template: "progress-tracker.md" },
  { path: "project-overview.md", template: "project-overview.md" },
  { path: "ui-context.md", template: "ui-context.md" },
];

function getBaseContextFiles(scope) {
  if (scope === "core") {
    return coreBaseContextFiles;
  }

  return fullBaseContextFiles;
}

function buildSkillEntries(skills) {
  return skills.map((name) => {
    const definition = getSkillDefinition(name);
    return {
      name,
      path: getSkillPath(name),
      description: [definition.name, definition.phase].filter(Boolean).join(", "),
    };
  });
}

export async function buildInstallationPlan({ agents, skills, scope = "core" }) {
  const baseContextFiles = getBaseContextFiles(scope);
  const skillEntries = buildSkillEntries(skills);
  const files = [
    {
      path: "AGENTS.md",
      type: "guide",
      content: await renderRootGuide(skillEntries),
    },
  ];

  for (const baseFile of baseContextFiles) {
    files.push({
      path: baseFile.path,
      type: "base",
      content: await renderBaseContextFile(baseFile.template),
    });
  }

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
  scope = "core",
  force = false,
  dryRun = false,
  conflictResolver,
} = {}) {
  const absoluteCwd = path.resolve(cwd);
  const normalizedSkills = resolveSkills({ skills, scope });
  const plan = await buildInstallationPlan({ agents, skills: normalizedSkills, scope });
  const manifest = {
    package: packageName,
    version: packageVersion,
    cwd: absoluteCwd,
    agents: [...agents],
    skills: [...normalizedSkills],
    signature: buildSignature({
      version: packageVersion,
      agents,
      skills: normalizedSkills,
      files: plan.map((file) => ({ path: file.path, hash: hashContent(file.content) })),
    }),
    files: plan.map((file) => ({ path: file.path, type: file.type })),
  };

  const results = [];
  const conflicts = [];

  for (const file of plan) {
    const filePath = path.join(absoluteCwd, file.path);
    const result = await writePlannedFile({
      filePath,
      content: file.content,
      force,
      dryRun,
      conflictResolver,
      file,
    });
    results.push({ status: result.status, filePath });
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

async function writePlannedFile({ filePath, content, force, dryRun, conflictResolver, file }) {
  const existed = await pathExists(filePath);
  if (!existed) {
    if (!dryRun) {
      await ensureDir(path.dirname(filePath));
      await writeFile(filePath, content);
    }
    return { status: "created" };
  }

  const existing = await readTextFile(filePath);
  if (existing === content) {
    return { status: "skipped" };
  }

  if (force) {
    if (!dryRun) {
      await ensureDir(path.dirname(filePath));
      await writeFile(filePath, content);
    }
    return { status: "updated" };
  }

  if (typeof conflictResolver !== "function") {
    return { status: "conflict" };
  }

  const decision = await conflictResolver({
    file,
    filePath,
    existingContent: existing,
    nextContent: content,
  });

  if (!decision || decision.action === "skip") {
    return { status: "skipped" };
  }

  const finalContent = decision.content ?? content;
  if (!dryRun) {
    await ensureDir(path.dirname(filePath));
    await writeFile(filePath, finalContent);
  }

  return { status: "updated" };
}
