# Quick Start

`contextkit` installs shared AI-workflow context files and skill guides into a project.

## Install

```bash
npx @akashanand/contextkit init
```

If you run it in a terminal without flags, it will prompt for the IDE and the install scope.

The interactive flow uses a branded Clack terminal UI, and conflicts can be handled with overwrite, skip, diff preview, or merge for the `AGENTS.md` skill inventory section.

## Writes

By default, `init` writes:

- `AGENTS.md` at the project root
- base context docs such as `agent-context.md`, `ai-workflow-rules.md`, `architecture.md`, `code-standards.md`, `progress-tracker.md`, `project-overview.md`, and `ui-context.md`
- `.contextkit/manifest.json`
- skill guides in `.contextkit/skills/`
- selected agent entrypoints such as `.codex/AGENTS.md`, `CLAUDE.md`, or `.cursor/rules/contextkit.mdc`
- the installed skill inventory in `AGENTS.md`

## Flags

- `--core` installs the core skill bundle
- `--scope full` installs the full base context pack
- `--scope custom --skills scope,debug` installs a custom skill selection
- `--scope all` installs the full base context pack and every supported skill
- `--skills scope,debug` installs a custom skill selection
- `--agents codex,claude,cursor` writes selected agent entrypoints
- `--ide codex` selects the IDE or agent profile to write
- `--all` installs every supported skill and agent target
- `--force` overwrites conflicting files
- `--dry-run` shows what would change without writing anything

## Next

Open `AGENTS.md`, read the installed skill guides, and start with the `scope` skill when the request is broad or unclear.
