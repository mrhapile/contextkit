# contextkit

`contextkit` installs shared AI-workflow context files and skill guides into a project.

For a short install guide, see [docs/quick-start.md](docs/quick-start.md).

## Quick Start

```bash
npx @akashanand/contextkit init
```

By default, `init` writes:

- `AGENTS.md` at the project root
- `.contextkit/manifest.json`
- shared skill guides in `.contextkit/skills/`
- agent-specific guidance for any selected agent targets

## Common Options

- `--core` installs the core skill bundle: `scope`, `architect`, `develop`, `test`
- `--skills scope,debug` installs a custom selection
- `--agents codex,claude,cursor` writes agent-specific entrypoints
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
