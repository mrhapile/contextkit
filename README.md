# contextkit

<div align="center">

![contextkit logo](assets/contextkit-logo.png)

</div>

<div align="center">

[![npm version](https://img.shields.io/npm/v/@akashanand/contextkit?logo=npm&label=npm)](https://www.npmjs.com/package/@akashanand/contextkit)
[![npm downloads](https://img.shields.io/npm/dm/@akashanand/contextkit?logo=npm&label=downloads)](https://www.npmjs.com/package/@akashanand/contextkit)
[![node](https://img.shields.io/badge/node-%3E%3D18.18-339933?logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![github](https://img.shields.io/badge/github-repo-181717?logo=github)](https://github.com/mrhapile/contextkit)

</div>

<div align="center">

<pre><code>npx @akashanand/contextkit init</code></pre>

</div>

`contextkit` brings shared AI context, skill guides, and agent-specific entrypoints into a project with a polished terminal-first setup flow.

It is built to feel like a product:

- a branded opening banner in the terminal
- arrow-key IDE selection and install scope prompts
- per-conflict resolution with diff preview and merge support
- a rerunnable manifest-backed install process

## Install

Run it once and let the CLI guide you:

```bash
npx @akashanand/contextkit init
```

If you are in a terminal, `contextkit init` will ask which IDE you use and what install scope you want.

## What It Sets Up

By default, `init` writes:

- `AGENTS.md` at the project root
- base context docs such as `agent-context.md`, `ai-workflow-rules.md`, `architecture.md`, `code-standards.md`, `progress-tracker.md`, `project-overview.md`, and `ui-context.md`
- `.contextkit/manifest.json`
- shared skill guides in `.contextkit/skills/`
- agent-specific guidance for the selected agent targets
- the installed skill inventory inside `AGENTS.md`

## Install Modes

- `--core` installs the core skill bundle: `scope`, `architect`, `develop`, `test`
- `--scope full` installs the full base context pack
- `--scope custom --skills scope,debug` installs a custom selection
- `--scope all` installs the full base context pack and every supported skill
- `--agents codex,claude,cursor` writes agent-specific entrypoints
- `--ide codex` selects the IDE or agent profile to write
- `--all` installs every supported skill and agent target
- `--force` overwrites conflicting files
- `--dry-run` shows what would change without writing anything

## What The Interactive Flow Feels Like

1. The banner opens with the `contextkit` wordmark and logo.
2. You choose your IDE with arrow-key selection.
3. You choose the install scope.
4. If you choose custom skills, you pick them with checkboxes.
5. Conflicts are handled file by file with overwrite, skip, diff preview, or merge.

## Examples

```bash
contextkit init
contextkit init --agents codex --skills core
contextkit init --scope full --ide cursor
contextkit init --scope all --all
contextkit init --skills scope,architect,develop --force
```

## Why It Exists

The goal is to make new projects easier to hand off to AI coding agents without losing structure.

- `AGENTS.md` gives the repo a stable entrypoint
- the base context docs keep project knowledge organized
- the skill guides provide reusable workflows
- the manifest makes reruns safe and predictable

## Development

```bash
npm install
npm test
node bin/contextkit.js init --dry-run
```
