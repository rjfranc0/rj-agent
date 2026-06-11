# Schema Design & Data Modeling (Postgres level)

For requests that arrive as an idea, a feature description, or an entities-and-relations sketch. Produce a proposed schema with rationale before implementing. Implementation details (exact types, syntax) live in the schema reference.

## Design process

1. **Capture the domain**: entities, their relationships, cardinalities, lifecycle (created/updated/deleted how?).
2. **Capture access patterns**: the queries the application will actually run, read/write ratio, expected volumes. Design follows queries, not the other way around.
3. **Model**: normalize by default, denormalize with justification (below).
4. **Derive indexes from the access patterns** (indexing reference) — at design time, every index has a named query it serves.
5. **Present**: tables, relationships, constraints, and the reasoning. Get agreement before generating code when the design was yours.

## Normalization decision

Normalize (separate tables) when data repeats across rows, updates would touch many places, or the relationship is queried independently. Denormalize (embed/duplicate) only with a named justification: a proven hot read path, data that never changes after write, values always fetched together.

Default: 3NF. Postgres-flavored middle grounds before duplicating columns:

- **Generated columns** — `GENERATED ALWAYS AS (...) STORED` for cheap deterministic derivations
- **Materialized views** — precomputed aggregates with explicit refresh, instead of denormalized counters
- **JSONB** — for genuinely schema-less attribute bags, not as an excuse to skip modeling (anything filtered, joined, or constrained becomes a real column)

## Primary key strategy

| Choice | When |
|---|---|
| `BIGINT GENERATED ALWAYS AS IDENTITY` | Default. Single-database apps, internal IDs |
| UUIDv7 | IDs generated outside the DB, merged datasets, or exposed publicly where sortable-but-unguessable matters |
| UUIDv4 | Only when unpredictability is a hard requirement and write volume tolerates btree fragmentation |
| Natural key | Almost never as PK — business meaning changes. Enforce with UNIQUE instead, keep a surrogate PK |

Exposing internal IDs is an API-layer concern, but if the spec implies public IDs, design a separate public identifier (UUID/slug, UNIQUE) rather than exposing the BIGINT sequence.

## Relationships

| Cardinality | Implementation |
|---|---|
| One-to-one | Separate table, FK + UNIQUE — for optional/heavy extension data; otherwise just columns on the same table |
| One-to-many | FK on the many side, indexed |
| Many-to-many | Junction table, composite PK, reverse-lookup index |

`ON DELETE` is a domain decision made at design time, per FK:

- `CASCADE` — child is meaningless without parent (order items)
- `RESTRICT` — deletion must be a deliberate, handled operation (customer with orders)
- `SET NULL` — child outlives parent, relationship was optional (posts keep existing when category dies)

Never leave the default (`NO ACTION`) silently — choose and state it.

## Standard lifecycle columns

`created_at` / `updated_at TIMESTAMPTZ NOT NULL` on every table. Soft delete (`deleted_at TIMESTAMPTZ`) only when the domain needs undelete or referential history — it taxes every query and unique constraint (partial unique indexes required). For compliance-grade history, prefer an audit table over soft-delete-everything.

## Hierarchical data

| Pattern | When |
|---|---|
| Adjacency list (`parent_id` FK) | Default. Shallow trees, mutable structure. Query subtrees with `WITH RECURSIVE` |
| Materialized path (`path TEXT` / `ltree`) | Deep trees, frequent subtree reads, rare moves |
| Closure table | Heavy ancestor/descendant queries in both directions, worth the write cost |

Start with adjacency list unless access patterns prove otherwise.

## Temporal & audit

- **Audit trail**: append-only `{table}_audit` (or single `audit_log` with JSONB diff) written by trigger or application — choose per project convention. Append-only means no UPDATE/DELETE grants.
- **Event sourcing / time-travel** as the primary model: significant architectural commitment — flag it for an explicit decision rather than defaulting into it.
- **Versioned rows** (e.g. document revisions): separate `{table}_versions` table, current pointer on the main row. Don't version in place.

## Multi-tenancy

| Pattern | When |
|---|---|
| Shared schema, `tenant_id` column + RLS | Default. Scales to many tenants, one migration path, RLS enforces isolation (features reference) |
| Schema per tenant | Few, heavyweight tenants needing schema divergence — migration fan-out is the cost |
| Database per tenant | Hard isolation/compliance requirements — operational cost is ops territory, flag it |

With shared schema: `tenant_id` leads composite indexes on tenant-scoped tables, and every unique constraint is per-tenant (`UNIQUE (tenant_id, slug)`).

## Partitioning (declarative)

Design-time consideration when a table is expected to grow unbounded with a natural slicing key — time-series, logs, events:

```sql
CREATE TABLE events (
  id BIGINT GENERATED ALWAYS AS IDENTITY,
  occurred_at TIMESTAMPTZ NOT NULL,
  payload JSONB,
  PRIMARY KEY (id, occurred_at)
) PARTITION BY RANGE (occurred_at);
```

- Partition key must be in the PK and every unique constraint
- Queries must filter on the partition key to get pruning — confirm access patterns do
- Biggest payoff: dropping old partitions instead of `DELETE`-ing millions of rows
- Don't partition speculatively; tables under tens of millions of rows rarely need it. Partition *creation automation* (cron, pg_partman) is ops territory — design the scheme, flag the automation need

## Schema evolution thinking

Design choices that keep future migrations cheap:

- `TEXT + CHECK` over native enums (alterable in one statement)
- Nullable-first for new concepts, tighten to NOT NULL once backfilled
- Junction tables over array-of-FK columns — relationships will want attributes eventually
- Name things for the domain, not the current feature — renames are expand-and-contract migrations