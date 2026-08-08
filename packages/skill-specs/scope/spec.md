---
id: scope
name: Scope
phase: planning
triggers:
  - vague request
  - broad change
  - unclear task
reads:
  - request
  - repository context
writes:
  - scope note
  - implementation plan
---
# Scope

Clarify what should change before the change starts.

## Use when

- Clarify the task before making broad changes.

## Do

- Restate the goal in concrete terms.
- Identify constraints, non-goals, and likely files.
- Choose the smallest safe slice if the request is broad.

## Avoid

- Jumping into a rewrite when the request is still ambiguous.
- Hiding tradeoffs that change the implementation path.
