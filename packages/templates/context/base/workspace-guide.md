# Workspace Guide

This project was initialized with `contextkit`.

## Where things live

- Shared workflow skills live in `.contextkit/skills/`
- Installation metadata lives in `.contextkit/manifest.json`
- Agent-specific entrypoints are written only for the agents you selected

## Working style

- Prefer the smallest safe change that proves the idea.
- Keep planning, implementation, verification, and documentation separate.
- If a task is broad or risky, scope it before writing code.
- If you rerun the installer, it will skip matching files and only report true conflicts.
