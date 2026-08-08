import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { pathExists, readTextFile } from "./fs.js";

const supportedAgents = ["generic", "codex", "claude", "cursor"];
const supportedIdeTargets = ["codex", "claude", "cursor", "generic", "other"];
const supportedSkillNames = [
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
const bundleDefinitions = {
  core: ["scope", "architect", "develop", "test"],
  extended: ["audit", "check", "debug", "document", "sync"],
  all: [...supportedSkillNames],
};

const packageJsonPath = new URL("../../../package.json", import.meta.url);
const packageJson = JSON.parse(await readTextFile(fileURLToPath(packageJsonPath)));

export const packageName = packageJson.name;
export const packageVersion = packageJson.version;
export { supportedAgents, supportedIdeTargets, supportedSkillNames };

export function resolveAgents(options = {}, detectedAgents = ["generic"]) {
  const explicit = parseCommaList(options.agents);

  if (explicit.length > 0) {
    if (explicit.includes("all")) {
      return supportedAgents;
    }
    const unknown = explicit.filter((item) => !supportedAgents.includes(item));
    if (unknown.length > 0) {
      throw new Error(`Unknown agent target: ${unknown.join(", ")}`);
    }
    return normalizeAgents(explicit);
  }

  if (options.all) {
    return supportedAgents;
  }

  if (options.ide) {
    const selectedIde = String(options.ide).trim().toLowerCase();
    if (selectedIde === "other" || selectedIde === "generic") {
      return ["generic"];
    }
    if (!supportedAgents.includes(selectedIde)) {
      throw new Error(`Unknown IDE target: ${options.ide}`);
    }
    return [selectedIde];
  }

  if (detectedAgents.length > 0) {
    return normalizeAgents(detectedAgents);
  }

  return ["generic"];
}

export function resolveSkills(options = {}) {
  const explicit = parseCommaList(options.skills);

  if (explicit.length > 0) {
    const resolved = [];
    for (const item of explicit) {
      if (item === "all") {
        return [...supportedSkillNames];
      }
      if (bundleDefinitions[item]) {
        resolved.push(...bundleDefinitions[item]);
      } else if (supportedSkillNames.includes(item)) {
        resolved.push(item);
      } else {
        throw new Error(`Unknown skill or bundle: ${item}`);
      }
    }
    return [...new Set(resolved)];
  }

  if (options.all) {
    return [...supportedSkillNames];
  }

  if (options.core) {
    return [...bundleDefinitions.core];
  }

  if (options.scope === "all") {
    return [...supportedSkillNames];
  }

  if (options.scope === "core") {
    return [...bundleDefinitions.core];
  }

  if (options.scope === "full") {
    return [...bundleDefinitions.core];
  }

  return [...bundleDefinitions.core];
}

export function resolveInstallScope(options = {}) {
  if (options.all || options.scope === "all") {
    return "all";
  }

  if (options.core || options.scope === "core") {
    return "core";
  }

  if (options.scope === "full") {
    return "full";
  }

  if (options.scope === "custom") {
    return "custom";
  }

  if (parseCommaList(options.skills).length > 0) {
    return "custom";
  }

  return "core";
}

export function getSkillDefinition(name) {
  return readSkillSpec(name).frontmatter;
}

export function readSkillMarkdown(name) {
  return readSkillSpec(name).body;
}

export function getAgentGuidePath(agent) {
  switch (agent) {
    case "codex":
      return ".codex/AGENTS.md";
    case "claude":
      return "CLAUDE.md";
    case "cursor":
      return ".cursor/rules/contextkit.mdc";
    default:
      return "AGENTS.md";
  }
}

export function getSkillPath(skill) {
  return `.contextkit/skills/${skill}.md`;
}

export function manifestPath() {
  return ".contextkit/manifest.json";
}

export function buildSignature(plan) {
  const hash = createHash("sha256");
  hash.update(JSON.stringify(plan));
  return hash.digest("hex");
}

export async function readExistingManifest(cwd) {
  const filePath = path.join(cwd, manifestPath());
  if (!(await pathExists(filePath))) {
    return null;
  }

  const raw = await readTextFile(filePath);
  return JSON.parse(raw);
}

export function parseCommaList(value) {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => parseCommaList(item));
  }

  return String(value)
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function normalizeAgents(values) {
  return [...new Set(values.map((value) => value.trim().toLowerCase()).filter((value) => supportedAgents.includes(value)))];
}

function readSkillSpec(name) {
  const filePath = fileURLToPath(new URL(`../../skill-specs/${name}/spec.md`, import.meta.url));
  const raw = readFileSync(filePath, "utf8");
  const { frontmatter, body } = parseMarkdownSpec(raw);

  if (frontmatter.id !== name) {
    throw new Error(`Skill spec id mismatch for ${name}`);
  }

  return { frontmatter, body };
}

function parseMarkdownSpec(markdown) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    throw new Error("Skill spec is missing frontmatter");
  }

  return {
    frontmatter: parseFrontmatter(match[1]),
    body: match[2],
  };
}

function parseFrontmatter(source) {
  const lines = source.split(/\r?\n/);
  const result = {};
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim()) {
      continue;
    }

    const scalarMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (scalarMatch) {
      currentKey = scalarMatch[1];
      const value = scalarMatch[2];
      if (value === "") {
        result[currentKey] = [];
      } else {
        result[currentKey] = parseScalar(value);
        currentKey = null;
      }
      continue;
    }

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentKey) {
      if (!Array.isArray(result[currentKey])) {
        result[currentKey] = [];
      }
      result[currentKey].push(parseScalar(listMatch[1]));
      continue;
    }

    throw new Error(`Unsupported frontmatter line: ${line}`);
  }

  return result;
}

function parseScalar(value) {
  const trimmed = value.trim();
  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}
