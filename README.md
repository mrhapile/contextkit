# contextkit

`contextkit` installs shared AI-workflow context files and skill guides into a project.

For a short install guide, see [docs/quick-start.md](docs/quick-start.md).

## Quick Start

```bash
npx @akashanand/contextkit init
```

When run in an interactive terminal with no selection flags, `init` asks which IDE you use and which install scope you want.

The terminal flow uses a branded Clack UI, and conflicts can be resolved one by one with overwrite, skip, diff preview, or merge for the `AGENTS.md` skill inventory section.

By default, `init` writes:

- `AGENTS.md` at the project root
- base context docs such as `agent-context.md`, `ai-workflow-rules.md`, and `code-standards.md`
- `.contextkit/manifest.json`
- shared skill guides in `.contextkit/skills/`
- agent-specific guidance for any selected agent targets
- the installed skill inventory inside `AGENTS.md`

## Common Options

- `--core` installs the core skill bundle: `scope`, `architect`, `develop`, `test`
- `--scope full` installs the full base context pack
- `--scope custom --skills scope,debug` installs a custom selection
- `--scope all` installs the full base context pack and every supported skill
- `--skills scope,debug` installs a custom selection
- `--agents codex,claude,cursor` writes agent-specific entrypoints
- `--ide codex` selects the IDE/agent path to write
- `--all` installs every supported skill and agent target
- `--force` overwrites conflicting files
- `--dry-run` shows what would change without writing anything

## Examples

```bash
contextkit init
contextkit init --agents codex --skills core
contextkit init --skills scope,architect,develop --force
contextkit init --all
```

## What It Writes

The installer is designed to be safe to rerun:

- matching files are skipped
- changed user files are reported as conflicts unless `--force` is used
- installation metadata is stored in `.contextkit/manifest.json`

## Development

```bash
npm install
npm test
node bin/contextkit.js init --dry-run
```
