# Domain: Data

Supplements `writing.md` for documenting data models, schemas, and persistence layer contracts.

## Scope

`docs/data/` covers: schemas, models, relationships, constraints, migrations, query patterns, and data contracts between services. It does not cover the application code that reads or writes data — that belongs in `implementation/`.

## What a Complete Data Doc Must Cover

**Models and Schemas**
- What the entity represents in business terms — not just field names
- Every significant field: purpose, constraints, allowed values, nullability
- Default values and what they mean

**Relationships**
- How entities relate — type (one-to-many, etc.), directionality, ownership
- Cascade behavior — what happens to related records on delete or update
- Join patterns the application actually relies on

**Constraints and Invariants**
- Business rules enforced at the data layer — unique constraints, check constraints, triggers
- Invariants the application layer is responsible for (not enforced by DB but must hold)
- What breaks if a constraint is violated

**Migrations**
- Why a migration exists — the business or technical reason, not just what it does
- Irreversible migrations flagged explicitly
- Data transformations that ran — what changed and why

**Query Patterns**
- Significant or non-obvious queries the application relies on
- Performance considerations — indexes relied upon, known expensive operations
- Patterns that must not change without understanding the impact

**Data Contracts Between Services**
- What one service expects from another's data
- Schema versioning or compatibility guarantees if any
- What breaks downstream if the schema changes

## Writing Rules (Data-Specific)

**Business meaning before structure** — document what an entity *means* before documenting its fields. A schema without business context is just a list of columns.

**Irreversible operations are flagged**:
```markdown
> ⚠️ **Irreversible:** [what cannot be undone and why it was done anyway]
```

**Constraints document their reason** — a unique constraint on `email` means something. A partial index on `status = 'pending'` means something. Document the why, not just the what.

**Silent invariants are explicit** — if the application layer is responsible for maintaining a rule the DB does not enforce, it must be documented here. These are the most dangerous gaps.

**Cross-reference implementation** — when query patterns or contracts directly affect application behavior:
> See [@/implementation/billing/invoices.md] for how this query pattern is used in invoice generation.

## Reference Directions

| Direction | Meaning |
|---|---|
| `data → functional` | This schema exists because of this business rule |
| `data → implementation` | This model is used by this application layer |
| `implementation → data` | This code depends on this data contract |
| `functional → data` | This business rule is enforced at the data layer |
