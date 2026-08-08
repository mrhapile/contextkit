# UI Context

If this project has no UI yet, this file can be skipped for now. Use `agent-context.md` for the shared basics instead of repeating them here.

## Instructions for the agent

Before asking the developer anything, inspect the codebase first: `package.json` or the equivalent manifest, existing config files, CI files, folder structure, README, and the other context files.

If the file is already filled in, treat it as current documentation and only re-ask questions if the user explicitly requests a review or update.

Only ask about what cannot be determined from the code. If you infer an answer, note that it was inferred and let the developer correct it rather than asking them to confirm.

If a question does not apply yet, write `Not yet defined` rather than guessing or leaving it blank.

When you replace a placeholder, replace the whole heading with a short descriptive title. Do not leave any literal `[PLACEHOLDER: ...]` headings after the file has been filled in.

## UI Stack

Question:

- If there is a UI, what framework, component library, or rendering approach does it use?

## Design System

Question:

- What visual style, tokens, or design system should the UI follow?

## Accessibility

Question:

- What accessibility baseline or requirements should the UI meet?

## UI Notes

Optional, if there is no UI yet or the UI is still undecided.

- What UI-specific constraints or known exceptions should future work respect?

