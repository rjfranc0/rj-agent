# Sequencing

How to turn a `blueprint`-filled execution queue into the Workflow sequence.

## 1. Task → specialist mapping

For each `Task N.N` in the execution queue, determine its **single owner** using the phase's concern plus the task's steps/file paths as supporting evidence — this is judgment, not pattern matching:

| Concern / signal | Owner |
|---|---|
| Schema, migrations, ORM models, queries | `vera` |
| API routes, services, business logic (Node/Fastify) | `hugo` |
| UI components, React, design | `aurora` |
| `.rs` files, `src-tauri`, Tauri config | `ferran` |

Each specialist already owns its side of any cross-cutting concern by convention — `ferran` writes its own typed `invoke` wrappers, `hugo`/`aurora` each handle their own side of an API contract per project convention. Atlas never splits a task across two specialists.

If a task's owner is genuinely unclear after weighing concern and evidence, that's a sequence-build blocker: say so and ask before posting the sequence. This should be rare — task allocation is a `blueprint`-time concern, not something atlas should regularly need to adjudicate.

## 2. Contiguous runs (SLL entries)

Walk the execution queue in order. Group consecutive tasks with the same owner into one SLL entry, listing all their task IDs. If a specialist appears again later, **non-adjacent** to its earlier run, that's a separate SLL entry — never merge it back into the earlier one.

After each SLL entry, insert a `corpus refresh` entry.

## 3. OTTL and WL

After all SLL + corpus entries, append exactly:

- One `OTTL` entry — `tessa` global integration/e2e pass, starting at `cycle 0/2`.
- One `WL` entry — `argus` full-diff pass, starting at `cycle 0/2`.

## 4. silas (conditional)

Include a `silas` entry **only if** the implementation plan touches CI configs, Dockerfiles, `.github/workflows/`, deploy scripts, or monitoring/proxy configs. If nothing in the execution queue touches these, omit it entirely — there is no "skipped" placeholder for silas.

## 5. Final corpus

Always end the sequence with one final `corpus refresh` entry, regardless of whether `silas` ran.

## Canonical shape

```
1. [ ] <specialist> SLL — tasks X.X, X.X — iteration 1 (<specialist>)
2. [ ] corpus refresh
   ... (repeat 1–2 per contiguous run)
N.   [ ] OTTL — tessa global pass — cycle 0/2 (tessa)
N+1. [ ] WL — argus pass — cycle 0/2 (argus)
N+2. [ ] silas                          ← only if triggered (4)
N+3. [ ] final corpus refresh
```

Always produce the full applicable shape, even for a one-task issue — a station with nothing to do reports that in one line, it isn't omitted for being "trivial." `silas` is the only entry that can be absent, and only because it's conditionally not applicable, never because the work seems small.
