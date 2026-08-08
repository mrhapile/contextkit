import figlet from "figlet";
import gradient from "gradient-string";
import { cancel, confirm, isCancel, log, multiselect, outro, select } from "@clack/prompts";
import { getSkillDefinition, supportedSkillNames } from "./manifest.js";
import { skillInventoryEndMarker, skillInventoryStartMarker } from "./template-loader.js";

const IDE_OPTIONS = [
  { value: "codex", label: "Codex", hint: "OpenAI Codex" },
  { value: "claude", label: "Claude", hint: "Anthropic Claude" },
  { value: "cursor", label: "Cursor", hint: "Cursor editor" },
  { value: "generic", label: "Generic", hint: "Use shared context files" },
  { value: "other", label: "Other", hint: "Fallback to generic" },
];

const SCOPE_OPTIONS = [
  { value: "core", label: "Core setup", hint: "Core context and core skills" },
  { value: "full", label: "Full base context", hint: "All base context docs" },
  { value: "custom", label: "Custom skills", hint: "Pick exact skills" },
  { value: "all", label: "All of the above", hint: "Full base context and all skills" },
];

export const palette = createPalette();

export function printBrandBanner() {
  console.log(renderBrandBanner(terminalWidth()));
}

export async function promptForInstallSelection() {
  const ide = await select({
    message: "Which IDE are you using?",
    options: IDE_OPTIONS,
  });

  if (isCancel(ide)) {
    handleCancel();
  }

  const scope = await select({
    message: "What should we install?",
    options: SCOPE_OPTIONS,
  });

  if (isCancel(scope)) {
    handleCancel();
  }

  let skills;
  if (scope === "custom") {
    skills = await multiselect({
      message: "Select skills to install",
      options: supportedSkillNames.map((skill) => {
        const definition = getSkillDefinition(skill);
        return {
          value: skill,
          label: definition.name,
          hint: definition.phase,
        };
      }),
      required: true,
    });

    if (isCancel(skills)) {
      handleCancel();
    }
  }

  return { ide, scope, skills };
}

export function createConflictResolver() {
  let applyChoiceToRemaining = null;

  return async function resolveConflict(conflict) {
    const mergeable = canMergeSkillInventorySection(conflict.file.path, conflict.existingContent, conflict.nextContent);

    if (applyChoiceToRemaining && (applyChoiceToRemaining !== "merge" || mergeable)) {
      return {
        action: applyChoiceToRemaining,
        content:
          applyChoiceToRemaining === "merge"
            ? mergeSkillInventorySection(conflict.existingContent, conflict.nextContent)
            : conflict.nextContent,
        applyChoiceToRemaining,
      };
    }

    while (true) {
      log.warn(`${palette.path(conflict.filePath)} has local changes`);
      log.message("Choose what to do next.", { symbol: palette.warning("! ") });

      const choice = await select({
        message: "Resolve this conflict",
        options: buildConflictOptions(mergeable),
      });

      if (isCancel(choice)) {
        handleCancel();
      }

      if (choice === "view-diff") {
        showDiffPreview(conflict);
        continue;
      }

      let finalContent = conflict.nextContent;
      if (choice === "merge") {
        finalContent = mergeSkillInventorySection(conflict.existingContent, conflict.nextContent);
      }

      const shouldApplyToRemaining = await confirm({
        message: "Apply this choice to all remaining conflicts?",
        initialValue: false,
      });

      if (isCancel(shouldApplyToRemaining)) {
        handleCancel();
      }

      if (shouldApplyToRemaining) {
        applyChoiceToRemaining = choice;
      }

      return {
        action: choice,
        content: finalContent,
        applyChoiceToRemaining,
      };
    }
  };
}

export function showInstallSummary(result, metadata = {}) {
  outro(palette.success("Install complete"));
  log.success(`Installed context into ${palette.path(result.cwd)}`);
  log.info(`Agents: ${result.agents.join(", ")}`);
  log.info(`Skills: ${result.skills.join(", ")}`);
  log.info(`Scope: ${metadata.scope ?? "core"}`);
  log.info(`IDE: ${metadata.ide ?? "detected"}`);
  log.step(`Created ${result.created}, updated ${result.updated}, skipped ${result.skipped}`);
  if (result.conflicts.length > 0) {
    log.warn(`Conflicts remaining: ${result.conflicts.length}`);
  }
}

export function showConflictSummary(conflicts) {
  log.warn(`Conflicts encountered: ${conflicts.length}`);
  for (const conflict of conflicts) {
    log.message(palette.path(conflict), { symbol: palette.warning("! ") });
  }
}

export function mergeSkillInventorySection(existingContent, generatedContent) {
  const existingBlock = findMarkerBlock(existingContent);
  const generatedBlock = findMarkerBlock(generatedContent);

  if (!existingBlock || !generatedBlock) {
    return null;
  }

  const replacement = generatedContent.slice(generatedBlock.start, generatedBlock.end);
  return `${existingContent.slice(0, existingBlock.start)}${replacement}${existingContent.slice(existingBlock.end)}`;
}

export function canMergeSkillInventorySection(filePath, existingContent, generatedContent) {
  return filePath.endsWith("AGENTS.md") && Boolean(findMarkerBlock(existingContent)) && Boolean(findMarkerBlock(generatedContent));
}

function showDiffPreview(conflict) {
  log.info(`Diff preview for ${palette.path(conflict.filePath)}`);
  console.log(formatUnifiedDiff(conflict.existingContent, conflict.nextContent));
}

function buildConflictOptions(mergeable) {
  const options = [
    { value: "overwrite", label: "Overwrite", hint: "Replace the file" },
    { value: "skip", label: "Skip", hint: "Keep the current file" },
  ];

  if (mergeable) {
    options.push({ value: "merge", label: "Merge", hint: "Update the skill inventory only" });
  }

  options.push({ value: "view-diff", label: "View diff", hint: "Inspect changes first" });

  return options;
}

function formatUnifiedDiff(existingContent, nextContent) {
  const left = existingContent.split(/\r?\n/);
  const right = nextContent.split(/\r?\n/);
  const sharedPrefix = sharedPrefixLength(left, right);
  const sharedSuffix = sharedSuffixLength(left, right, sharedPrefix);

  const oldChunk = left.slice(sharedPrefix, left.length - sharedSuffix);
  const newChunk = right.slice(sharedPrefix, right.length - sharedSuffix);

  const lines = [];
  lines.push(palette.muted("--- existing"));
  lines.push(palette.muted("+++ generated"));
  if (sharedPrefix > 0) {
    lines.push(palette.muted(`@@ ${sharedPrefix} lines unchanged @@`));
  }
  for (const line of oldChunk) {
    lines.push(`${palette.error("- ")}${line}`);
  }
  for (const line of newChunk) {
    lines.push(`${palette.success("+ ")}${line}`);
  }
  if (oldChunk.length === 0 && newChunk.length === 0) {
    lines.push(palette.muted("No text differences."));
  }
  return lines.join("\n");
}

function sharedPrefixLength(left, right) {
  let index = 0;
  while (index < left.length && index < right.length && left[index] === right[index]) {
    index += 1;
  }
  return index;
}

function sharedSuffixLength(left, right, sharedPrefix) {
  let suffix = 0;
  while (
    left.length - suffix - 1 >= sharedPrefix &&
    right.length - suffix - 1 >= sharedPrefix &&
    left[left.length - suffix - 1] === right[right.length - suffix - 1]
  ) {
    suffix += 1;
  }
  return suffix;
}

function findMarkerBlock(content) {
  const startIndex = content.indexOf(skillInventoryStartMarker);
  const endIndex = content.indexOf(skillInventoryEndMarker);

  if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
    return null;
  }

  return {
    start: lineStart(content, startIndex),
    end: lineEnd(content, endIndex),
  };
}

function lineStart(content, index) {
  const lineBreak = content.lastIndexOf("\n", index - 1);
  return lineBreak === -1 ? 0 : lineBreak + 1;
}

function lineEnd(content, index) {
  const lineBreak = content.indexOf("\n", index);
  return lineBreak === -1 ? content.length : lineBreak + 1;
}

function handleCancel() {
  cancel("Operation cancelled.");
  process.exit(0);
}

function createPalette() {
  const enabled = Boolean(process.stdout.isTTY && !process.env.NO_COLOR && process.env.TERM !== "dumb");
  const wrap = (open, close = 39) => (value) => (enabled ? `${open}${value}\u001b[${close}m` : String(value));
  return {
    title: wrap("\u001b[1;36m"),
    brand: wrap("\u001b[1;36m"),
    accent: wrap("\u001b[1;35m"),
    success: wrap("\u001b[1;32m"),
    warning: wrap("\u001b[1;33m"),
    error: wrap("\u001b[1;31m"),
    path: wrap("\u001b[1;34m"),
    muted: wrap("\u001b[2;90m"),
    agentCodex: wrap("\u001b[1;36m"),
    agentClaude: wrap("\u001b[1;35m"),
    agentCursor: wrap("\u001b[1;33m"),
    agentGeneric: wrap("\u001b[1;32m"),
  };
}

export function renderBrandBanner(columns = terminalWidth()) {
  if (columns < 80) {
    return renderNarrowBanner(columns);
  }

  return renderWideBanner(columns);
}

function renderWideBanner(columns) {
  const wordmark = colorizeWordmark(figlet.textSync("CONTEXTKIT", { font: "ANSI Shadow" }));
  const tagline = centerText("shared context for every AI coding agent", columns);
  const diagram = [
    `┌──────────────┐      ┌──────────────────────────┐`,
    `│  your repo   │ ───► │  AGENTS.md               │`,
    `└──────────────┘      │  .contextkit/skills/     │`,
    `                      └──────────┬───────────────┘`,
    `                                 │`,
    `                                 ├──► ${palette.agentCodex("codex")}`,
    `                                 ├──► ${palette.agentClaude("claude")}`,
    `                                 ├──► ${palette.agentCursor("cursor")}`,
    `                                 └──► ${palette.agentGeneric("generic")}`,
  ];

  return [centerBlock(wordmark, columns), palette.muted(centerText(tagline, columns)), ...centerDiagram(diagram, columns)].join("\n");
}

function renderNarrowBanner(columns) {
  const title = gradient(["#22d3ee", "#8b5cf6", "#d946ef"])("CONTEXTKIT");
  const tagline = centerText("shared context for every AI coding agent", columns);
  const diagram = [
    `┌──────────────┐`,
    `│   your repo  │`,
    `└──────┬───────┘`,
    `       ▼`,
    `┌──────────────────────────┐`,
    `│ AGENTS.md                │`,
    `│ .contextkit/skills/      │`,
    `└──────┬───────────────────┘`,
    `       ├── ${palette.agentCodex("codex")}`,
    `       ├── ${palette.agentClaude("claude")}`,
    `       ├── ${palette.agentCursor("cursor")}`,
    `       └── ${palette.agentGeneric("generic")}`,
  ];

  return [centerText(title, columns), palette.muted(tagline), ...diagram.map((line) => centerText(line, columns))].join("\n");
}

function colorizeWordmark(text) {
  return gradient(["#22d3ee", "#8b5cf6", "#d946ef"])(text);
}

function centerBlock(text, columns) {
  return text
    .split("\n")
    .map((line) => centerText(line, columns))
    .join("\n");
}

function centerDiagram(lines, columns) {
  return lines.map((line) => centerText(colorizeDiagramLine(line), columns));
}

function colorizeDiagramLine(line) {
  return line
    .replace("├──► codex", `├──► ${palette.agentCodex("codex")}`)
    .replace("├──► claude", `├──► ${palette.agentClaude("claude")}`)
    .replace("├──► cursor", `├──► ${palette.agentCursor("cursor")}`)
    .replace("└──► generic", `└──► ${palette.agentGeneric("generic")}`);
}

function centerText(value, columns) {
  const plain = stripAnsi(String(value));
  if (plain.length >= columns) {
    return String(value);
  }

  const padding = Math.floor((columns - plain.length) / 2);
  return `${" ".repeat(padding)}${value}`;
}

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

function terminalWidth() {
  return process.stdout?.columns && Number.isFinite(process.stdout.columns) ? process.stdout.columns : 80;
}
