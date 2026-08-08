---
id: develop
name: Develop
phase: implementation
triggers:
  - approved plan
  - implementation task
  - code change
reads:
  - spec
  - codebase
  - tests
writes:
  - code changes
---
# Develop

Build the smallest useful implementation cleanly.

## Use when

- Implement the smallest useful slice cleanly.

## Do

- Make one coherent change at a time.
- Keep the code readable before chasing cleverness.
- Update adjacent code only when it is needed for correctness.

## Avoid

- Mixing unrelated cleanup into the same patch.
- Leaving the implementation half-finished without a note.
