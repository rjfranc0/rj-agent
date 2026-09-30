# Mode: Update

**Load also**: `gather.md`, `writing.md`, `output.md`

Any change that affects something docs reference → sync affected files surgically.

## Scope

Triggers on any change to the codebase that alters documented behavior: new feature, bugfix, refactor, config change, schema change, dependency update, or anything else that makes an existing doc claim stale or incomplete.

## Workflow

### Phase 1 — Change Analysis

Identify what changed. Accept from:
- Git diff or list of changed files
- Feature or issue description
- Direct user description of what changed and why

### Phase 2 — Harvest

If the input carries **decisions** (choices made, with their reasons) or **contracts** (interfaces agreed between parts of the system), they are doc content in their own right — often the only record of *why*. Persist them:

| Input | Lands in |
|---|---|
| Architectural or technical decision | `implementation/` — the domain file's Architectural Decisions (chosen, rejected, driving constraint) |
| HTTP / API / event contract | `implementation/` — the owning module's public interface |
| Schema or data contract | `data/` — the entity's models, constraints, or data contracts |
| Assumption flagged as unconfirmed | Same place as a decision, marked `⚠️ Inferred` |

Check each against the code first: a decision or contract the code doesn't honor is a conflict (`output.md`), not something to document as fact.

### Phase 3 — Impact Traversal

Trace the reference graph outward from the change and the harvested items:
1. Which doc files directly document the changed code or behavior?
2. Which other doc files reference those files?
3. Build the **impact set** — the minimal set of files that need updating

Do not touch files outside the impact set. Surgical accuracy only — scope creep here silently corrupts unrelated docs.

### Phase 4 — Conflict Check

Compare new code behavior against current doc claims across the impact set. Apply conflict rules from `output.md`. Most updates are small — batch question for 1–3 conflicts is the common case.

### Phase 5 — Write

Update only impact set files. Preserve all existing structure and references. Change only what is now wrong or missing.

Scope is usually small → propose changes in chat before writing (see `output.md`). Unattended → write directly, then return the changed files, what was harvested, and any conflicts or blockers.
