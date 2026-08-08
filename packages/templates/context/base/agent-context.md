# Agent Context

This file captures the project-wide basics that every other context file can rely on.

## Instructions for the agent

Before asking the developer anything, inspect the codebase first: `package.json` or the equivalent manifest, existing config files, CI files, folder structure, README, and the other context files.

If the file is already filled in, treat it as current documentation and only re-ask questions if the user explicitly requests a review or update.

Only ask about what cannot be determined from the code. If you infer an answer, note that it was inferred and let the developer correct it rather than asking them to confirm.

If a question does not apply yet, write `Not yet defined` rather than guessing or leaving it blank.

When you replace a placeholder, replace the whole heading with a short descriptive title such as `## Stack`, not just the bracketed text. Do not leave any literal `[PLACEHOLDER: ...]` headings after the file has been filled in.

## Stack

Question:

- What language, runtime, framework, and package manager does this project use?

## Project Type

Question:

- Is this a library, application, service, workspace, or something else?

## Primary Purpose

Question:

- In one sentence, what is this project meant to do?

