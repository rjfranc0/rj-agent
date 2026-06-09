# Core: Gather

How the skill discovers and classifies input before writing anything.

## Strategy

**Directed discovery** — start from a seed, fan out, ask only when stuck. The goal is autonomy with a human fallback, not a questionnaire.

## Entry Points (Bootstrap and Update)

Scan in priority order to build the highest-confidence picture before reading individual files:

1. `package.json` / `pyproject.toml` / `Cargo.toml` / `go.mod` — project name, deps, scripts
2. `README.md` — intent, setup, overview
3. Main entry file (`index.*`, `main.*`, `app.*`, `server.*`)
4. Route definitions — API surface
5. Schema files — data model
6. Config files — environment, feature flags
7. Test files — behavior from the consumer's perspective

## Input Classification

When receiving user-provided input, classify before extracting:

| Type | Signal | Approach |
|---|---|---|
| Structured spec / issue | Clear sections: goal, scope, technical decisions | Extract intent, scope, decisions directly |
| Loose prompt or description | Unstructured, partial, informal | Extract what's explicit, flag missing parts |
| Code only | No prose context | Infer everything from implementation |
| Existing docs + code | Both present | Diff and compare, surface conflicts |
| Mixed | Combination of above | Merge sources, resolve conflicts per `output.md` |

## Dead End Handling

**Tier C rule**: block on functional unknowns, infer on technical facts.

**Block** (halt and surface): missing business intent, ambiguous ownership, unclear domain purpose. These cannot be safely inferred — getting them wrong contaminates everything downstream.

**Infer** (proceed and flag): technical facts visible in code — return types, dependencies, error conditions, data shapes. Mark every inference with appropriate confidence marker (see `writing.md`).

Batch all blockers — never interrupt per item. Surface once:
> "Before I continue, I need clarity on [N items]: [list]. Can you answer these?"

## Discovery Scope by Mode

| Mode | Scope |
|---|---|
| Bootstrap | Full tree scan — entry points first, then expand outward |
| Update | Changed files + their doc refs + upstream/downstream deps |
| Targeted | Pointed file + direct imports + existing doc refs |
| Audit | Existing docs only — no code unless validating a specific claim |
| Rewrite | Existing docs + relevant code sections for validation |
