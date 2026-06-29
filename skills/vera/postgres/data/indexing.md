# Indexing (Postgres level)

When to index, which type, and how to order columns. Syntax for declaring indexes in ORM schemas lives in the ORM layer.

## Core rules

1. **Index every FK column** — Postgres never auto-creates these.
2. Index columns appearing in `WHERE`, `JOIN`, and `ORDER BY` of real query patterns — the spec's expected queries, not hypothetical ones.
3. **Don't over-index.** Every index taxes every write. If the expected query load doesn't justify it, leave it out and note it in handoff as a future option.
4. Verify with `EXPLAIN (ANALYZE, BUFFERS)` when live access is granted; otherwise state which queries each index serves in the handoff.

## Composite indexes

Column order: **equality predicates first, then range/sort columns.**

```sql
-- serves: WHERE status = ? AND created_at > ?  ORDER BY created_at
CREATE INDEX orders_status_created_idx ON orders (status, created_at);
```

An index on `(a, b)` serves queries filtering on `a` alone or `a AND b` — not `b` alone. If both single-column patterns exist, that's two indexes (or accept one scan).

## Index types

| Type | When |
|---|---|
| B-tree (default) | Equality, ranges, sorting — 95% of cases |
| GIN | JSONB containment, arrays, full-text `tsvector` |
| GiST | Ranges, geometric, exclusion constraints |
| BRIN | Huge append-only tables physically ordered by the column (logs, events) — tiny index, coarse filtering |
| Hash | Equality-only; rarely worth choosing over B-tree |

## Partial indexes

Index a subset when queries always filter on the same predicate. Smaller, faster, cheaper to maintain.

```sql
CREATE INDEX orders_active_user_idx ON orders (user_id) WHERE status = 'active';
```

Two prime use cases:

- Hot subsets ("active" rows in a table that's 95% archived)
- **Unique-with-soft-delete**: `CREATE UNIQUE INDEX users_email_key ON users (email) WHERE deleted_at IS NULL;`

The query must repeat the predicate verbatim for the planner to use the index.

## Covering indexes

For hot read paths returning few columns, `INCLUDE` makes index-only scans possible:

```sql
CREATE INDEX users_email_idx ON users (email) INCLUDE (name);
```

Use sparingly — only for proven hot paths named in the spec.

## Expression indexes

Required when queries filter on a function of a column:

```sql
CREATE INDEX users_email_lower_idx ON users (lower(email));
-- serves: WHERE lower(email) = lower($1)
```

Prefer rewriting the query to be SARGable when possible (see queries reference); expression index when the transformation is inherent (case-insensitive lookups → also consider `citext`).

## Write-cost awareness

- Frequently updated columns (`status`, counters, `updated_at`) ideally stay unindexed — indexing them disables HOT updates and amplifies writes. Index only when query-critical.
- More than ~5 indexes per table → justify each; >10 → something is wrong upstream, flag it.

## Index audits (live access, on request)

Unused indexes — zero scans since stats reset:

```sql
SELECT s.relname AS table, s.indexrelname AS index,
       pg_size_pretty(pg_relation_size(s.indexrelid)) AS size
FROM pg_stat_user_indexes s
JOIN pg_index i ON s.indexrelid = i.indexrelid
WHERE s.idx_scan = 0
  AND NOT i.indisunique
  AND NOT EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conindid = s.indexrelid)
ORDER BY pg_relation_size(s.indexrelid) DESC;
```

Invalid indexes (failed `CREATE INDEX CONCURRENTLY` leftovers — maintained on writes, never used):

```sql
SELECT indexrelname FROM pg_stat_user_indexes s
JOIN pg_index i ON s.indexrelid = i.indexrelid WHERE NOT i.indisvalid;
```

Dropping any index — unused, duplicate, or invalid — is destructive: list candidates with evidence, confirm before dropping. Stats may not reflect periodic jobs (monthly reports) that depend on an "unused" index.
