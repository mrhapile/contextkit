---
id: audit
name: Audit
phase: review
triggers:
  - diff ready
  - review request
  - risk check
reads:
  - changes
  - tests
writes:
  - findings
  - risk notes
---
# Audit

Review the result for regressions, missing cases, and quality gaps.

## Use when

- Review the work for regressions and gaps.

## Do

- Read the diff as if you were the next maintainer.
- Call out behavior changes, edge cases, and hidden risks.
- Suggest the smallest fix that addresses each issue.

## Avoid

- Only summarizing the change without checking for problems.
- Ignoring assumptions that might not hold in production.
