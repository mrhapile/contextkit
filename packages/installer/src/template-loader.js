import { fileURLToPath } from "node:url";
import { readTextFile } from "./fs.js";

const templateBaseUrl = new URL("../../templates/context/base/", import.meta.url);
export const skillInventoryStartMarker = "<!-- contextkit:skill-inventory:start -->";
export const skillInventoryEndMarker = "<!-- contextkit:skill-inventory:end -->";

async function loadTemplate(fileName) {
  return readTextFile(fileURLToPath(new URL(fileName, templateBaseUrl)));
}

export async function renderBaseContextFile(fileName) {
  return loadTemplate(fileName);
}

export async function renderRootGuide(skillEntries = []) {
  const rootGuide = await loadTemplate("workspace-guide.md");

  if (!Array.isArray(skillEntries) || skillEntries.length === 0) {
    return rootGuide;
  }

  const lines = skillEntries.map((entry) => {
    const description = entry.description ? ` - ${entry.description}` : "";
    return `- \`${entry.name}\` -> \`${entry.path}\`${description}`;
  });

  return `${rootGuide}\n\n## Installed Skills\n\n${skillInventoryStartMarker}\n${lines.join("\n")}\n${skillInventoryEndMarker}\n`;
}

export async function renderAgentGuide(agent) {
  switch (agent) {
    case "codex":
      return loadTemplate("codex-guide.md");
    case "claude":
      return loadTemplate("claude-guide.md");
    default:
      return loadTemplate("workspace-guide.md");
  }
}

export async function renderCursorRule() {
  return loadTemplate("cursor-guide.mdc");
}
