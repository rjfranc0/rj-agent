# Schema Implementation (Postgres level)

Implementation-level decisions for tables, columns, constraints, and keys. Structural design (which entities exist, how they relate) arrives from the spec — this file covers doing it right.

## Primary keys

Default choice: `BIGINT GENERATED ALWAYS AS IDENTITY`. Compact (8 bytes), fast joins, no fragmentation.

When the spec or project requires UUIDs (distributed generation, non-guessable public IDs): prefer **UUIDv7** (timestamp-ordered, index-friendly; native `uuidv7()` in PG 18+, extension or app-side generation before that). Avoid UUIDv4 as a PK on write-heavy tables — random insert order fragments the btree.

```sql
id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY
```

`GENERATED ALWAYS` over `BY DEFAULT` unless manual ID insertion is genuinely needed. `SERIAL` is legacy — don't introduce it in new tables.

## Data types

| Need | Use | Avoid |
|---|---|---|
| Strings | `TEXT` (no length penalty in PG) | `VARCHAR(n)` unless a hard limit is a real constraint |
| Timestamps | `TIMESTAMPTZ` | `TIMESTAMP` without time zone — almost always a bug |
| Money / exact decimals | `NUMERIC(p, s)` | `REAL` / `DOUBLE PRECISION` for money |
| Whole numbers | `BIGINT` for IDs/FKs everywhere; `INTEGER` for bounded counts | `SMALLINT` micro-optimizations |
| Semi-structured data | `JSONB` | `JSON` (text storage, no indexing) — only when key order/whitespace must be preserved |
| Flags | `BOOLEAN NOT NULL DEFAULT ...` | nullable booleans (three-state trap) |

## Enumerated values

Prefer `TEXT` + `CHECK` constraint over native `ENUM` types. CHECK constraints can be altered in one statement; native enums require careful `ALTER TYPE ... ADD VALUE` (can't run in a transaction before PG 12, can't remove values ever).

```sql
status TEXT NOT NULL DEFAULT 'pending'
  CHECK (status IN ('pending', 'shipped', 'delivered'))
```

Use a native enum only when the spec demands it or the value set is genuinely frozen.

## Constraints

- `NOT NULL` on every column that can carry it. Nullability is an API contract — every nullable column forces handling downstream.
- FKs always explicit, with explicit `ON DELETE` behavior (`CASCADE`, `SET NULL`, or `RESTRICT` — pick deliberately, never default silently).
- **Always index FK columns.** Postgres does not do this automatically; unindexed FKs make deletes on the parent table table-scan the child.
- `UNIQUE` at the database level for anything the application assumes unique. Application-level checks alone are race-prone.
- `DEFAULT` belongs in the database when it's a data rule (e.g. `created_at TIMESTAMPTZ NOT NULL DEFAULT now()`), in the application when it's business logic.

## Standard columns

Unless the spec says otherwise, every table gets:

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()   -- maintained by app or trigger, per project convention
```

Soft-delete (`deleted_at TIMESTAMPTZ`) only when the spec asks for it — it complicates every query and unique constraint (pair with partial unique indexes, see indexing reference).

## Naming

Follow the project's existing convention first. Absent one:

- Tables: snake_case, consistent number (pick singular or plural and stick to it project-wide)
- Columns: snake_case (`created_at`, `user_id`)
- Indexes: `{table}_{columns}_idx`, unique: `{table}_{columns}_key`
- Constraints: `{table}_{column}_{type}` (`orders_status_check`, `orders_user_id_fkey`)

## Implementation-judgment zone

Decisions vera owns (not the spec):

- Exact column type within the spec's intent ("a price" → `NUMERIC(12,2)`, not float)
- Constraint strictness (add the CHECK the spec implies but didn't state — report it in handoff)
- Whether a derived value is computed or stored (`GENERATED ALWAYS AS ... STORED` for cheap deterministic derivations queried often)
- Column order in composite keys and indexes

Decisions vera does not own: adding/removing entities, splitting/merging tables, changing relationship cardinality. Spot a problem there → flag in handoff, implement as specified unless it's outright broken (then it's a blocker for the clarification batch).
