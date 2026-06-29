# Configuration (Postgres level)

Selecting and sizing `postgresql.conf` parameters and authoring the config artifact. You produce config files and reasoning — you never apply them, restart, or reload a live instance unless explicitly asked (and even then, see the impact rule below).

## Precondition — don't size blind

Memory and connection parameters are a function of the machine and the workload. Do **not** emit numbers for `shared_buffers`, `work_mem`, `effective_cache_size`, `maintenance_work_mem`, or `max_connections` until you know:

- total RAM (and whether Postgres shares the box with the app)
- Postgres major version (parameter contexts and defaults shift between versions)
- whether the instance is **dedicated or shared across apps** — the single biggest factor for `work_mem` and connection limits
- current `max_connections` and, if tuning an existing instance, the present values and the symptom being solved

If any are missing, ask for them in the clarification batch before sizing. The starting-point tables below are anchors to reason *from* once you have the inputs — never a config to hand over unconditionally. Workload-shaped, machine-independent advice (checkpoint spreading, planner cost on SSD, logging) can proceed without the full picture; memory sizing cannot.

## The impact rule — always state it

Every parameter is one of two kinds. State which for any change you recommend:

- **Reload** (`SIGHUP` / `pg_reload_conf()` / `SELECT pg_reload_conf();`) — takes effect without downtime.
- **Restart** — requires stopping the server. On a shared single instance, **a restart is downtime for every application on it.** Never present a restart-class change as safe without naming that blast radius.

Restart-class parameters include: `shared_buffers`, `max_connections`, `max_wal_size` (reload in modern versions — verify per target), `wal_level`, `max_worker_processes`, `shared_preload_libraries`, `listen_addresses`, `port`. Check `pg_settings.context` (`postmaster` = restart, `sighup` = reload, `user`/`superuser` = per-session) rather than relying on memory for the target version.

When a change set mixes both kinds, **split it**: group the reload-class changes to apply immediately and isolate the restart-class ones into a scheduled maintenance window. Don't force the whole set behind a restart when most of it could land with no downtime.

```sql
SELECT name, setting, unit, context, pending_restart
FROM pg_settings WHERE name = ANY(ARRAY['shared_buffers','work_mem','max_connections']);
```

## Memory

Sizing is a function of total RAM, `max_connections`, and workload. Starting points for a dedicated instance, to be adjusted from measurement:

| Parameter | Starting point | Notes |
|---|---|---|
| `shared_buffers` | 25% of RAM | The big one. More isn't always better — the OS page cache also caches. Restart. |
| `effective_cache_size` | 50–75% of RAM | A *hint* to the planner, allocates nothing. Too low → planner avoids index scans. Reload. |
| `work_mem` | conservative; per-sort, per-node | **Multiplied by sorts × connections** — the classic OOM trap. Size for typical queries, raise per-session for heavy analytical ones (`SET LOCAL work_mem`). Reload. |
| `maintenance_work_mem` | 256MB–1GB | Used by VACUUM, CREATE INDEX, ALTER TABLE. Higher = faster maintenance. Reload. |

On a **shared multi-app instance**, `work_mem` is the dangerous one: a generous global value times many app connections can exhaust RAM. Keep the global low; let heavy consumers opt up per-transaction. Per-app `work_mem` belongs on the role (`ALTER ROLE app_x SET work_mem = ...`), not the global config — see security.

## WAL & checkpoints

| Parameter | Guidance |
|---|---|
| `wal_level` | `replica` default; `logical` only if logical replication/CDC is needed (restart) |
| `max_wal_size` / `min_wal_size` | Raise `max_wal_size` (e.g. 2–4GB+) to space out checkpoints on write-heavy loads — trades disk for fewer I/O spikes |
| `checkpoint_completion_target` | `0.9` — spreads checkpoint I/O instead of bursting |
| `checkpoint_timeout` | Longer (15–30min) reduces checkpoint frequency; costs longer crash recovery |
| `wal_compression` | `on` is usually a good trade on modern CPUs |

Frequent checkpoint warnings in the log = `max_wal_size` too small. Backup/archiving WAL parameters (`archive_mode`, `archive_command`) live in backup.

## Planner

| Parameter | Guidance |
|---|---|
| `random_page_cost` | `1.1` for SSD/NVMe (default `4.0` assumes spinning disk and over-discourages index scans). High-impact, reload. |
| `effective_io_concurrency` | `200`+ for SSD, enables bitmap-heap prefetch |
| `default_statistics_target` | Raise (e.g. `250`) for columns with skewed distributions and bad estimates; per-column override preferred over global |

`random_page_cost` on SSD is one of the highest-value single changes on a default config.

## Connections

- `max_connections`: each connection is a process with overhead; Postgres is not built for thousands. Restart-class. The real answer to "many clients" is a **pooler** (PgBouncer) — that's ops territory; flag the need rather than inflating `max_connections`.
- For a shared instance, cap consumption **per role** (`ALTER ROLE app_x CONNECTION LIMIT n`) so no single app can starve the others — see security.

## Autovacuum (global knobs)

Keep autovacuum **on** — disabling it is almost always a mistake that ends in wraparound emergencies. Global tuning lives here; per-table tuning lives in maintenance.

| Parameter | Guidance |
|---|---|
| `autovacuum_max_workers` | 3 default; raise on instances with many active tables |
| `autovacuum_vacuum_cost_limit` | Raise to let autovacuum work faster when it's falling behind |
| `autovacuum_naptime` | Lower for high-churn instances |

## Logging (for diagnosis)

Settings that make the instance debuggable — authoring these is in scope; consuming the logs (monitoring/alerting pipelines) is ops.

```
log_min_duration_statement = 1000   # log statements slower than 1s
log_checkpoints = on
log_lock_waits = on
log_temp_files = 0                   # log all temp file use → work_mem too low signal
log_autovacuum_min_duration = 0
```

`pg_stat_statements` (via `shared_preload_libraries`, restart) is the single best diagnostic add — recommend it for any non-trivial instance.

## Artifact form

Emit changes as a `.conf` fragment with a comment per parameter stating value, reason, and reload/restart class — not bare assignments. For IaC-managed configs, match the repo's existing structure and grouping conventions (provided in task context); don't impose a layout.
