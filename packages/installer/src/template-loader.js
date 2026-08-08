import { fileURLToPath } from "node:url";
import { readTextFile } from "./fs.js";

const templateBaseUrl = new URL("../../templates/context/base/", import.meta.url);

async function loadTemplate(fileName) {
  return readTextFile(fileURLToPath(new URL(fileName, templateBaseUrl)));
}

export async function renderRootGuide() {
  return loadTemplate("workspace-guide.md");
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
