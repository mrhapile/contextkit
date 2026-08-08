---
id: test
name: Test
phase: verification
triggers:
  - code change
  - bug fix
  - release check
reads:
  - behavior
  - code
  - tests
writes:
  - test cases
  - results
---
# Test

Prove the behavior with a focused, repeatable check.

## Use when

- Verify behavior with focused, repeatable checks.

## Do

- Cover the change with the most direct test available.
- Include at least one failure-oriented case when it matters.
- Keep tests stable and easy to run locally.

## Avoid

- Relying on a manual check when an automated one is practical.
- Writing broad tests that do not isolate the changed behavior.
