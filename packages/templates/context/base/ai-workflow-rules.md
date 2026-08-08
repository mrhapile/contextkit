# AI Workflow Rules

This file records how AI agents should behave in this repository. Use `agent-context.md` for the shared basics instead of repeating them here.

## Instructions for the agent

Before asking the developer anything, inspect the codebase first: `package.json` or the equivalent manifest, existing config files, CI files, folder structure, README, and the other context files.

If the file is already filled in, treat it as current documentation and only re-ask questions if the user explicitly requests a review or update.

Only ask about what cannot be determined from the code. If you infer an answer, note that it was inferred and let the developer correct it rather than asking them to confirm.

If a question does not apply yet, write `Not yet defined` rather than guessing or leaving it blank.

When you replace a placeholder, replace the whole heading with a short descriptive title. Do not leave any literal `[PLACEHOLDER: ...]` headings after the file has been filled in.

## Ask First

Question:

- What kinds of changes should the agent ask about before making them?

## Verify

Question:

- What check should the agent run or report before treating work as complete?

## Handoff

Question:

- What should the agent preserve so the next person can continue quickly?

