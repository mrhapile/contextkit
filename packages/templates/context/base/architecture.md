# Architecture Context

This file captures the project’s system shape, main components, and deployment path.

## Instructions for the agent

Before asking the developer anything, inspect the codebase first: `package.json` or the equivalent manifest, existing config files, CI files, folder structure, README, and the other context files.

Use `agent-context.md` first for the shared basics: stack, project type, and primary purpose. Do not re-ask those in this file unless the developer explicitly asks for a review or update.

If the file is already filled in, treat it as current documentation and only re-ask questions if the user explicitly requests a review or update.

Only ask about what cannot be determined from the code. If you infer an answer, note that it was inferred and let the developer correct it rather than asking them to confirm.

If a question does not apply yet, write `Not yet defined` rather than guessing or leaving it blank.

When you replace a placeholder, replace the whole heading with a short descriptive title such as `## Components`, not just the bracketed text. Do not leave any literal `[PLACEHOLDER: ...]` headings after the file has been filled in.

## Components

Question:

- What are the major modules or subsystems, and what does each one own?

## Data Flow

Question:

- What is the most important path data follows through the system?

## Deployment

Optional, if the project is deployed or run somewhere specific.

- Where does this project run or deploy, and what config or environment values matter most?

## Boundaries

Question:

- What should future contributors avoid changing casually because it would be risky or break a stable boundary?
