# Atlas State

The `# Atlas State` comment (exact h1, no emoji) is the only persisted state for an issue. There is exactly one per issue — find it by scanning comments for that exact header, and always edit it **in place** (never re-post or duplicate it).

## Template

```markdown
# Atlas State

## Workflow sequence
1. [ ] <specialist> SLL — tasks X.X, X.X — iteration 1 (<specialist>)
2. [ ] corpus refresh
...
N.   [ ] OTTL — tessa global pass — cycle 0/2 (tessa)
N+1. [ ] WL — argus pass — cycle 0/2 (argus)
N+2. [ ] silas
N+3. [ ] final corpus refresh

## Dispatch map
- `path/to/file.ext`, `path/to/other.ext` → step 1 (`<specialist>`)

## Definition of Done
- [ ] <copied verbatim from the issue>

## Notes
-
```

## Finding the current step

The current step is the **first `[ ]`** in the Workflow sequence. Its trailing annotation tells you the sub-status — whose turn it is and what to do this invocation.

## Sub-status conventions

**SLL entries** — `iteration N (<who>)`:

- `(<specialist>)` → the specialist implements (iteration 1) or fixes (iteration ≥2) this invocation. On completion, same iteration, flip to `(tessa)`.
- `(tessa)` → `tessa` runs its scoped check for what's testable so far.
  - Pass → tick the box, move to the next entry.
  - Fail → increment the iteration number, flip to `(<specialist>)`, and record the failure in Notes so the next invocation's context-pack includes it.

**OTTL / WL entries** — `cycle N/2 (<who>)`:

- `(tessa)` / `(argus)` → run the pass.
  - Pass → tick the box, move to the next entry.
  - Fail → write the findings to Notes, set sub-status to `(fix: <specialist>)` based on root-cause routing.
- `(fix: <specialist>)` → that specialist addresses the named finding(s) this invocation. On completion, increment the cycle counter and flip back to `(tessa)` / `(argus)`.
- At `cycle 2/2`, if the check still fails: don't tick, don't advance the cycle further. Leave the findings in Notes — this invocation's output **is** the cap-out report (see `SKILL.md` Fix-loop caps).

**`corpus` / `silas` entries**: no sub-status — single-shot, tick on completion. A `corpus` entry with nothing to update still gets ticked, with a one-line "nothing to update" note if useful.

## Dispatch map

On completion of each SLL entry, append the files it touched: `path(s) → step N (specialist)`. This is supporting evidence for root-cause routing during OTTL/WL fix cycles — atlas reasons about *why* a finding belongs to a given specialist, and cites the dispatch map as one input to that reasoning, never as the routing rule itself.

## Definition of Done

Copied verbatim from the issue at sequence-build time. Tick items as stations confirm them — e.g. a clean `tessa` pass can tick "All automated tests pass"; a clean `silas`/build step can tick "Build passes". The human reconciles the actual issue body separately; atlas never edits it.

## Notes

Free-form: blockers, decisions, fix-loop context the next invocation needs, anything that doesn't fit the structured sections above. Prune entries once they're resolved and no longer needed for context — Notes is working memory, not a permanent log.
