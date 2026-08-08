---
id: debug
name: Debug
phase: investigation
triggers:
  - failure
  - broken behavior
  - reproducible bug
reads:
  - logs
  - code
  - reproduction steps
writes:
  - root cause
  - fix
---
# Debug

Trace a failure back to the smallest reproducible cause.

## Use when

- Trace failures to the smallest reproducible cause.

## Do

- Reduce the problem until the failure becomes obvious.
- Compare the expected path with the actual path step by step.
- Fix the cause, not just the symptom.

## Avoid

- Applying several speculative fixes at once.
- Assuming the first plausible explanation is correct.
