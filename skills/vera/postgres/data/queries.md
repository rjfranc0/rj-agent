# Queries & Performance (Postgres level)

Query patterns, anti-patterns, and diagnosis. ORM query syntax lives in the ORM layer — this file decides what the query should be.

## Baseline rules

- **Select specific columns.** `SELECT *` fetches dead weight, breaks covering indexes, and couples code to schema width.
- **Bound every result set.** Any query that can grow gets `LIMIT` or pagination — decided here, enforced in app code.
- **Parameterize always.** String-built SQL is an injection vector; no exceptions, including "internal" values.

## SARGability

Functions on indexed columns kill index usage:

```sql
-- Bad: full scan
WHERE date_trunc('day', created_at) = '2026-01-01'
-- Good: range on the raw column
WHERE created_at >= '2026-01-01' AND created_at < '2026-01-02'
```

Same trap: `WHERE id::text = $1`, `WHERE lower(email) = $1` (without expression index), leading-wildcard `LIKE '%x'`.

## N+1

Queries inside a loop = N+1. Fixes, in preference order:

1. One query with a join returning the full shape
2. Batch lookup: `WHERE id = ANY($1)` with the collected IDs
3. ORM eager loading (relational/include APIs)

Detection heuristic without live access: any per-item `await` on a DB call inside iteration.

## Pagination

`OFFSET` scans and discards every skipped row — fine for shallow pages, degrades linearly with depth. For feeds, infinite scroll, exports, or anything user-paginated past a few pages, use **keyset (cursor) pagination**:

```sql
-- requires index on (created_at DESC, id DESC)
SELECT id, title FROM articles
WHERE (created_at, id) < ($1, $2)
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

The tie-breaker column (`id`) is mandatory — timestamps collide.

## Rewrites that matter

- `IN (subquery)` → `EXISTS` when checking presence (short-circuits)
- `UNION` → `UNION ALL` when duplicates are impossible or acceptable (skips a sort)
- Correlated subquery in SELECT list → `LEFT JOIN ... GROUP BY` or `LATERAL`
- `COUNT(*)` over a big table for "has any?" → `EXISTS` / `LIMIT 1`
- Multiple round-trips for insert-then-read → `INSERT ... RETURNING`
- Read-modify-write upserts → `INSERT ... ON CONFLICT DO UPDATE`

## Locking & contention

- Keep transactions short; never hold one across network calls or user interaction.
- Lock acquisition order must be consistent across code paths to avoid deadlocks.
- `SELECT ... FOR UPDATE SKIP LOCKED` for job-queue patterns; `NOWAIT` when blocking is worse than failing.

## Isolation levels

Default `READ COMMITTED` is right for most work. Escalate per operation, not globally:

- `REPEATABLE READ` — multi-statement reads needing one consistent snapshot (reports)
- `SERIALIZABLE` — invariants spanning rows/tables that FK/UNIQUE can't express; pair with retry-on-serialization-failure in app code

## EXPLAIN (live access, on request)

`EXPLAIN (ANALYZE, BUFFERS)` and read for:

1. **Seq Scan on large tables** under a selective filter → missing/unusable index
2. **Rows estimate vs actual** off by orders of magnitude → stale stats (`ANALYZE` the table) or correlated columns (`CREATE STATISTICS`)
3. **Nested Loop** with a large outer side → join order/index problem
4. **Sort spilling to disk** (`external merge`) → missing index for the ORDER BY, or genuinely needs `work_mem` (config = ops territory, report it)
5. **Filter discarding most rows after an index scan** → index doesn't match the predicate shape

Without live access: state the expected plan risk and which index addresses it; recommend verification in the handoff.
