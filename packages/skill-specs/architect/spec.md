---
id: architect
name: Architect
phase: architecture
triggers:
  - new feature
  - structural change
  - design decision
reads:
  - constraints
  - current layout
writes:
  - architecture note
  - decision record
---
# Architect

Choose a structure that keeps the system easy to extend.

## Use when

- Choose a safe structure and write down the tradeoffs.

## Do

- Map the moving parts and the boundaries between them.
- Prefer a shape that can evolve without forcing a rewrite.
- Document the key tradeoffs when more than one path works.

## Avoid

- Optimizing for elegance at the expense of readability.
- Splitting things so much that the flow becomes hard to follow.
