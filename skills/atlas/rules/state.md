# Atlas State

One comment per issue, exact h1 `# Atlas State`, always edited in place. It's the only state atlas persists and the report the human reads.

## Template

```markdown
# Atlas State

**Status:** <status line>

## Notes
<deviations from the blueprint, or empty>

## Findings
<one line per tessa/argus finding, or section omitted>
```

## Status line

| Situation | Status |
|---|---|
| Posted, nothing run yet | `not started` |
| Unit or corpus step | `step N/M — <station>` |
| tessa or argus step | `step N/M — <station>, cycle C/2` |
| Stopped | `stopped at step N/M — <reason>` |
| Finished | `done` |

`C` counts fix rounds already dispatched for that check, starting at 0. Update the status after every completed dispatch and on every stop.

## Notes

Only what differs from the blueprint, or is worth the human knowing: something added, done differently, assumed, or a unit that returned with red tests. Take it from the station's `Deviations:` line (`rules/dispatch.md`). Nothing to report → leave the section empty.

Never restate what the blueprint already says should be done. Never log dispatches.

## Findings

Every finding tessa or argus raised, one line each, written when it ends:

```markdown
- argus SEC-001: token accepted from any origin — fixed by hugo
- argus PERF-002: missing index on `budgets.user_id` — left open (cap-out)
- tessa: PATCH preflight rejected — fixed by hugo
```

Omit the section until there's a first finding.
