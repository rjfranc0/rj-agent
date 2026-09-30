# Atlas State

The `# Atlas State` comment (exact h1, no emoji) is the only persisted state for an issue. Exactly one per issue — find it by that exact header, always edit it **in place**.

## Template

```markdown
# Atlas State

## Workflow sequence
1. [ ] Unit 1 SLL — <subagent> — iteration 1/3 (<subagent>)
2. [ ] corpus refresh
...
N.   [ ] OTTL — tessa global pass — cycle 0/2 (tessa)
N+1. [ ] WL — argus pass — cycle 0/2 (argus)
N+2. [ ] final corpus refresh

## Dispatch map
- `path/to/file.ext`, `path/to/other.ext` → step 1 (Unit 1, `<subagent>`)

## Definition of Done
- [ ] <copied verbatim from the issue>

## Notes
-
```

## Current step

The **first `[ ]`** in the Workflow sequence. Its trailing annotation is the sub-status — which subagent runs next.

## Sub-status conventions

### SLL entries — `iteration N/3 (<who>)`

- `(<subagent>)` → the subagent implements (iteration 1) or fixes (iteration ≥2). On completion:
  - `aurora-design` → flip to `(aurora-design: review)`.
  - any other → flip to `(tessa)`.
- `(aurora-design: review)` → a **fresh** `aurora-design` dispatch reviews the rendered UI against the unit and the design system. Never the same run that built it.
  - Pass → flip to `(tessa)`.
  - Fail → increment iteration, flip to `(aurora-design)`, record findings in Notes.
- `(tessa)` → scoped check for what's testable so far.
  - Pass → tick, next entry.
  - Fail → increment iteration, flip to `(<subagent>)`, record the failure in Notes.
- At `iteration 3/3`, if the last check still fails: don't tick. Cap-out → stop.

### OTTL / WL entries — `cycle N/2 (<who>)`

- `(tessa)` / `(argus)` → run the pass.
  - Pass → tick, next entry.
  - Fail → findings to Notes, set `(fix: <subagent>)` by root-cause routing.
- `(fix: <subagent>)` → that subagent addresses the named finding(s). On completion, increment the cycle, flip back to `(tessa)` / `(argus)`.
- At `cycle 2/2`, if the check still fails: don't tick. Cap-out → stop.

**Frontend fix routing:** a finding about visual design, layout, or design-system fidelity → `aurora-design`. Any other frontend finding → `aurora`.

### `corpus` entries

No sub-status — single-shot, tick on completion. Nothing to update still gets ticked, with a one-line note if useful.

## Dispatch map

On completion of each SLL entry, append the files it touched: `path(s) → step N (subagent)`. Supporting evidence for root-cause routing — never the routing rule itself.

## Definition of Done

Copied verbatim at sequence-build time. Tick items as stations confirm them. The human reconciles the issue body; atlas never edits it.

## Notes

Blockers, fix-loop context the next dispatch needs, anything that doesn't fit above. Prune resolved entries — Notes is working memory, not a log.