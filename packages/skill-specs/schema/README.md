# Skill Spec Schema

This folder defines the markdown contract used by `packages/skill-specs/*/spec.md`.

Each skill spec should include:

- frontmatter with `id`, `name`, `phase`, `triggers`, `reads`, and `writes`
- a `# Title` heading
- a `## Use when` section
- a `## Do` section
- a `## Avoid` section

The current spec files are checked against this shape and should stay aligned with it when new skills are added.
