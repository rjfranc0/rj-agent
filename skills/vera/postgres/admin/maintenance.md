# Maintenance (Postgres level)

Keeping an instance healthy: vacuum/bloat, statistics, physical index upkeep, partition rotation, and per-table tuning. You author the policy, the SQL, and the runbooks; scheduling them (cron, systemd timers, job runners) is ops — design the maintenance, flag the scheduling.

This file owns *physical* index upkeep (REINDEX, bloat). Index *selection* (which index to create, composite ordering) stays in the data-layer indexing reference — no bleed.

## VACUUM & bloat

Postgres MVCC leaves dead tuples on every UPDATE/DELETE; VACUUM reclaims them. Autovacuum handles this by default and should stay on (global knobs in configuration). What belongs here:

- **Bloat detection** — tables/indexes where dead space has grown faster than autovacuum reclaims it:

```sql
SELECT relname,
       n_dead_tup,
       n_live_tup,
       round(n_dead_tup * 100.0 / nullif(n_live_tup + n_dead_tup, 0), 1) AS dead_pct,
       last_autovacuum
FROM pg_stat_user_tables
WHERE n_dead_tup > 10000
ORDER BY dead_pct DESC NULLS LAST;
```

- **`VACUUM` vs `VACUUM FULL`**: plain `VACUUM` reclaims space for reuse within the table, online, no exclusive lock — the normal tool. `VACUUM FULL` rewrites the whole table to shrink it on disk but takes `ACCESS EXCLUSIVE` (full lock, blocks everything) and needs free space equal to the table — treat it as a destructive-class operation, confirm, and prefer `pg_repack` (online, ops-installed) for live tables. Recommend `VACUUM FULL` only for tables that bloated badly and are now low-traffic.
- **Wraparound**: the genuine emergency. Monitor transaction-ID age; an instance approaching `autovacuum_freeze_max_age` will eventually force-vacuum or, ignored long enough, refuse writes.

```sql
SELECT datname, age(datfrozenxid) AS xid_age
FROM pg_database ORDER BY xid_age DESC;
```

## Per-table autovacuum tuning

The high-value lever the global config can't express: tables with very different churn want different thresholds. A hot append+update table benefits from aggressive autovacuum; a huge cold table doesn't need the default scale factor scanning it constantly.

```sql
-- hot table: vacuum after fewer dead rows instead of 20% of the table
ALTER TABLE sessions SET (
  autovacuum_vacuum_scale_factor = 0.02,
  autovacuum_vacuum_cost_delay = 2
);
```

Author per-table storage parameters as part of the schema when the access pattern is known; revisit from `pg_stat_user_tables` when behavior is observed.

## Statistics

The planner relies on `ANALYZE` statistics; stale stats cause bad plans (the row-estimate mismatches diagnosed in the queries reference). Autovacuum runs ANALYZE, but:

- Run `ANALYZE` manually after a large bulk load or migration before the next query workload hits.
- Raise `default_statistics_target` per-column (not globally) for columns with skewed data and bad estimates: `ALTER TABLE t ALTER COLUMN c SET STATISTICS 500;`
- Use extended statistics for correlated columns the planner assumes independent: `CREATE STATISTICS ON (a, b) FROM t;` then `ANALYZE t;`

## Reindexing

Indexes bloat and fragment over time, especially under heavy update churn. Rebuild online to avoid the lock:

```sql
REINDEX INDEX CONCURRENTLY users_email_idx;   -- no ACCESS EXCLUSIVE, can run on a live table
```

Plain `REINDEX` (without `CONCURRENTLY`) locks the table — destructive-class on a live instance, confirm. A failed `CONCURRENTLY` build leaves an INVALID index that must be dropped (detection query in the data-layer indexing reference).

## Partition rotation

Designing the partition scheme is data-layer design; operating the lifecycle is here:

- **Adding** future partitions ahead of need (next month's range partition before rows arrive) — author as a recurring step, flag scheduling for ops (`pg_partman` automates this; installing/running it is ops).
- **Dropping** old partitions is the payoff over `DELETE`: `DROP TABLE events_2025_01;` reclaims space instantly with no vacuum churn. It is destructive — confirm, and verify retention policy first.
- **Detaching** instead of dropping (`ALTER TABLE ... DETACH PARTITION CONCURRENTLY`) when old data should be archived rather than destroyed.

## Maintenance runbook output

When asked for a maintenance plan, produce a runbook: each task, its SQL, its lock/impact class (online vs blocking), its trigger condition (e.g. "when dead_pct > 30%" / "monthly"), and which steps are vera's (the SQL) vs ops' (the scheduling). Don't bury a blocking operation in a list as though it were routine.
