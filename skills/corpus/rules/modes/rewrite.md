# Mode: Rewrite

**Load also**: `gather.md`, `writing.md`, `structure.md`, `output.md`

Incremental elevation of doc quality. Consumes Audit output naturally. The mechanism that drives the doc lifecycle loop.

## Entry Points

### With Audit Report (preferred)

Audit report present → targeted rewrite. Work the gap list systematically, breaking gaps first.

### Without Audit Report

Soft gate:
> "No Audit report detected. Recommended to run Audit first for a targeted Rewrite — continue anyway?"

- User confirms → proceed: run a lightweight internal scan (structural check + obvious content gaps), build a working gap list, rewrite against it
- User declines → switch to Audit mode

## Pass Awareness

Rewrite is **incremental by design**. Each pass should:
- Address the highest-priority gaps from the current gap list
- Not attempt to perfect everything at once
- Leave a clear record of what was improved and what remains

Infer pass context from available information:
- First pass on Bootstrap output → broad improvements, fill obvious gaps, reduce inference flags
- Later passes with Audit report → surgical, specific gaps only

Do not try to reach Audit-clean in a single pass unless scope is very small.

## Workflow

1. **Assess gap list** — from Audit report or internal scan
2. **Prioritize** — breaking gaps first, quality gaps second, structural last
3. **Scope this pass** — decide what will be addressed, do not overcommit
4. **Confirm scope** — state what will be rewritten and why, wait for confirmation
5. **Rewrite** — apply full `writing.md` standard to targeted sections
6. **Pass summary** — document what improved and what remains

Scope determines output strategy per `output.md`. Structural rewrites (moving files, splitting domains) → write directly to repo. Section-level improvements → propose in chat.

## Pass Summary Format

```markdown
## Rewrite Pass [N] Complete

### Addressed
- [gap]: [what was done and why it now meets standard]

### Remaining
- [gap]: [why deferred — complexity, needs more context, lower priority]

### Recommendation
[Next pass focus, or "suggest Audit to verify improvements"]
```
