# Current Repository Structure

This document reflects the repository as it exists right now.

## Live Layout

```text
contextkit/
├── README.md
├── CHANGELOG.md
├── LICENSE
├── package.json
├── bin/
│   └── contextkit.js
├── context/
│   ├── CURRENT_STRUCTURE.md
│   └── RECOMMENDED_STRUCTURE.md
├── docs/
│   └── quick-start.md
├── scripts/
│   └── verify-public-install.mjs
├── packages/
│   ├── installer/
│   │   └── src/
│   │       ├── cli.js
│   │       ├── detect.js
│   │       ├── fs.js
│   │       ├── index.js
│   │       ├── install.js
│   │       ├── manifest.js
│   │       └── template-loader.js
│   ├── skill-specs/
│   │   ├── audit/
│   │   │   └── spec.md
│   │   ├── architect/
│   │   │   └── spec.md
│   │   ├── check/
│   │   │   └── spec.md
│   │   ├── debug/
│   │   │   └── spec.md
│   │   ├── develop/
│   │   │   └── spec.md
│   │   ├── document/
│   │   │   └── spec.md
│   │   ├── schema/
│   │   │   ├── README.md
│   │   │   └── skill-spec.schema.json
│   │   ├── scope/
│   │   │   └── spec.md
│   │   ├── sync/
│   │   │   └── spec.md
│   │   └── test/
│   │       └── spec.md
│   └── templates/
│       └── context/
│           └── base/
│               ├── claude-guide.md
│               ├── agent-context.md
│               ├── ai-workflow-rules.md
│               ├── architecture.md
│               ├── code-standards.md
│               ├── codex-guide.md
│               ├── cursor-guide.mdc
│               ├── progress-tracker.md
│               ├── project-overview.md
│               └── ui-context.md
│               └── workspace-guide.md
└── test/
    ├── conflict.test.js
    └── install.test.js
```

## What Each Area Does

- `bin/` contains the executable CLI entrypoint.
- `docs/` contains the short quick-start guide.
- `scripts/` contains standalone verification helpers such as the public install smoke test.
- `packages/installer/src/` contains the installer, manifest logic, file helpers, and template loaders.
- `packages/skill-specs/` contains the extracted skill specs and schema notes.
- `packages/templates/` contains the actual template files used for installed guides, workflow context, and Cursor rules.
- `test/` contains the Node test suite for install behavior.
- `context/` contains repository documentation about the intended and current structure.

## Current State

- The package now exposes a working `init` command.
- The installer writes shared workflow context files and agent-specific guides.
- The repository includes a public-install smoke test script.
- The template content and skill specs now live in `packages/` files instead of `src/`.
- Repeated installs are safe when files are unchanged.
- Conflicts are reported instead of silently overwriting user edits.

## Notes

- This structure is intentionally much smaller than the recommended long-term layout.
- The `RECOMMENDED_STRUCTURE.md` file remains as a roadmap for a fuller public release.
