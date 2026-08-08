import { fileURLToPath } from "node:url";
import process from "node:process";
import { installContext } from "./install.js";
import { detectAgents } from "./detect.js";
import {
  packageName,
  packageVersion,
  resolveAgents,
  resolveInstallScope,
  resolveSkills,
} from "./manifest.js";
import {
  createConflictResolver,
  printBrandBanner,
  promptForInstallSelection,
  showConflictSummary,
  showInstallSummary,
} from "./terminal-ui.js";

export function printHelp() {
  const lines = [
    `${packageName} ${packageVersion}`,
    "",
    "Usage:",
    "  contextkit init [options]",
    "",
    "Options:",
    "  --dir <path>        Target project directory (default: current working directory)",
    "  --agents <list>     Comma-separated agent targets: generic, codex, claude, cursor, all",
    "  --ide <name>        IDE choice: codex, claude, cursor, generic, other",
    "  --scope <name>      Install scope: core, full, custom, all",
    "  --skills <list>     Comma-separated skills or bundles: core, all, scope, architect, develop, test, audit, check, debug, document, sync",
    "  --all               Install all skills and all agents",
    "  --core              Install only the core skill bundle",
    "  --force             Overwrite conflicting files",
    "  --dry-run           Show what would be written without changing files",
    "  --help              Show this help",
    "  --version           Print the package version",
    "",
    "Examples:",
    "  contextkit init",
    "  contextkit init --agents codex --skills core",
    "  contextkit init --all",
  ];

  console.log(lines.join("\n"));
}

export async function runCli(argv = []) {
  const args = [...argv];
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  if (args.includes("--version") || args.includes("-v")) {
    console.log(packageVersion);
    return;
  }

  const command = args[0];
  if (command !== "init") {
    throw new Error(`Unknown command: ${command}`);
  }

  const options = parseInitOptions(args.slice(1));
  const detectedAgents = detectAgents();
  const hasInteractiveTerminal = isInteractiveTerminal();
  if (hasInteractiveTerminal) {
    printBrandBanner();
  }
  const selection = shouldPromptForSelection(options, hasInteractiveTerminal) ? await promptForInstallSelection() : {};
  const mergedOptions = { ...options, ...selection };
  const scope = resolveInstallScope(mergedOptions);
  const agents = resolveAgents(mergedOptions, detectedAgents);
  const skills = resolveSkills(mergedOptions);

  const conflictResolver = options.force || !hasInteractiveTerminal ? undefined : createConflictResolver();
  const result = await installContext({
    cwd: options.dir,
    agents,
    skills,
    scope,
    force: options.force,
    dryRun: options.dryRun,
    conflictResolver,
  });

  showInstallSummary(result, { scope, ide: mergedOptions.ide ?? "detected" });

  if (result.conflicts.length > 0) {
    showConflictSummary(result.conflicts);
    process.exitCode = 1;
  }
}

function parseInitOptions(argv) {
  const options = {
    dir: process.cwd(),
    agents: undefined,
    ide: undefined,
    scope: undefined,
    skills: undefined,
    all: false,
    core: false,
    force: false,
    dryRun: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--dir") {
      options.dir = argv[++index];
      continue;
    }
    if (token === "--agents" || token === "--agent") {
      options.agents = argv[++index];
      continue;
    }
    if (token === "--ide") {
      options.ide = argv[++index];
      continue;
    }
    if (token === "--scope") {
      options.scope = argv[++index];
      continue;
    }
    if (token === "--skills") {
      options.skills = argv[++index];
      continue;
    }
    if (token === "--all") {
      options.all = true;
      continue;
    }
    if (token === "--core") {
      options.core = true;
      continue;
    }
    if (token === "--force") {
      options.force = true;
      continue;
    }
    if (token === "--dry-run") {
      options.dryRun = true;
      continue;
    }
    if (token === "--help" || token === "-h" || token === "--version" || token === "-v") {
      continue;
    }
    throw new Error(`Unknown option: ${token}`);
  }

  return options;
}

export function parseAgentList(value) {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function parseSkillList(value) {
  return value
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function resolveCliContext(argv = []) {
  const options = parseInitOptions(argv);
  return {
    options,
    agents: resolveAgents(options, detectAgents()),
    skills: resolveSkills(options),
  };
}

export function mainModulePath() {
  return fileURLToPath(new URL("../../../bin/contextkit.js", import.meta.url));
}

function shouldPromptForSelection(options, hasInteractiveTerminal) {
  const explicitSelection =
    Boolean(options.agents) ||
    Boolean(options.ide) ||
    Boolean(options.skills) ||
    Boolean(options.scope) ||
    options.all ||
    options.core;
  return hasInteractiveTerminal && !explicitSelection;
}

function isInteractiveTerminal() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}
