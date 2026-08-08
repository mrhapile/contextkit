# Code Standards

This file records the project’s coding conventions. Use `agent-context.md` for stack, project type, and primary purpose instead of re-asking them here.

## Instructions for the agent

Before asking the developer anything, inspect the codebase first: `package.json` or the equivalent manifest, existing config files, CI files, folder structure, README, and the other context files.

If the file is already filled in, treat it as current documentation and only re-ask questions if the user explicitly requests a review or update.

Only ask about what cannot be determined from the code. If you infer an answer, note that it was inferred and let the developer correct it rather than asking them to confirm.

If a question does not apply yet, write `Not yet defined` rather than guessing or leaving it blank.

When you replace a placeholder, replace the whole heading with a short descriptive title. Do not leave any literal `[PLACEHOLDER: ...]` headings after the file has been filled in.

## Formatting

Question:

- Which formatter, linter, or style tool should be treated as the source of truth?

## Naming

Question:

- What naming patterns should be followed for files, functions, components, or variables?

## Testing

Question:

- What testing command or minimum test expectation should future changes satisfy?

