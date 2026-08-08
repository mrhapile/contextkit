# Quick Start

`contextkit` installs shared AI-workflow context files and skill guides into a project.

## Install

```bash
npx @akashanand/contextkit init
```

## Writes

By default, `init` writes:

- `AGENTS.md` at the project root
- `.contextkit/manifest.json`
- skill guides in `.contextkit/skills/`
- selected agent entrypoints such as `.codex/AGENTS.md`, `CLAUDE.md`, or `.cursor/rules/contextkit.mdc`

## Flags

- `--core` installs the core skill bundle
- `--skills scope,debug` installs a custom skill selection
- `--agents codex,claude,cursor` writes selected agent entrypoints
- `--all` installs every supported skill and agent target
- `--force` overwrites conflicting files
- `--dry-run` shows what would change without writing anything

## Next

Open `AGENTS.md`, read the installed skill guides, and start with the `scope` skill when the request is broad or unclear.
