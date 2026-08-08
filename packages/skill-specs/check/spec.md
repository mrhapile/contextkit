---
id: check
name: Check
phase: verification
triggers:
  - sanity check
  - output review
  - before shipping
reads:
  - output
  - files
writes:
  - consistency notes
---
# Check

Validate that the work is consistent and complete enough to ship.

## Use when

- Validate assumptions, edge cases, and output quality.

## Do

- Confirm the output matches the requested shape.
- Look for missing files, stale references, and formatting drift.
- Verify the surrounding workflow still makes sense.

## Avoid

- Treating a visual pass as proof that behavior is correct.
- Leaving obvious inconsistencies unexplained.
