# Backup & Recovery (Postgres level)

Designing backup strategy and authoring backup/restore artifacts. You decide what to back up, the retention policy, the RPO/RTO reasoning, and you author the commands and restore runbooks. You never run a backup or restore against a live instance unless explicitly asked — and a restore is destructive-class by definition (it overwrites), so it always requires confirmation.

Scheduling backups, shipping them offsite, and monitoring that they succeed are operations — design the strategy, author the commands, flag the scheduling and storage to ops.

## Drive the design from RPO/RTO

Two numbers decide everything; ask for them if the request doesn't state them:

- **RPO** (recovery point objective) — how much data loss is tolerable? "Up to 24h" → a nightly dump may suffice. "Near zero" → continuous WAL archiving (PITR) is required.
- **RTO** (recovery time objective) — how fast must you be back? Large `pg_dump` restores are slow (single-threaded replay of SQL); physical base backups restore faster. RTO often forces the method.

State the chosen method's RPO/RTO honestly so the trade-off is visible, rather than presenting one approach as universally correct.

## Two methods

**Logical (`pg_dump` / `pg_dumprestore`)** — exports SQL or an archive. Portable across versions and architectures, restores selectively (one table, one schema), but slow to restore at size and captures only a point in time (no PITR).

```bash
# directory format — parallel dump/restore, per-table granularity
pg_dump --format=directory --jobs=4 --file=/backups/app_x_$(date +%F) app_x_db
pg_restore --dbname=app_x_db --jobs=4 /backups/app_x_2026-06-28

# whole cluster including roles/globals — pg_dump alone misses these
pg_dumpall --globals-only > /backups/globals.sql
```

`pg_dump` does **not** capture roles, tablespaces, or other cluster-wide objects — pair it with `pg_dumpall --globals-only`, or a restore comes back with no app roles. Easy to forget, painful to discover during recovery.

**Physical (`pg_basebackup` + WAL archiving)** — byte-level copy of the data directory plus the WAL stream. Enables **point-in-time recovery**: restore to any moment, not just the last backup. Faster restore at size. Tied to the same major version and architecture.

```bash
pg_basebackup --pgdata=/backups/base --format=tar --gzip --checkpoint=fast --progress
```

## PITR setup (the config side)

Continuous WAL archiving is what turns physical backups into point-in-time recovery. The parameters are config (restart-class for `wal_level`) — author them here as the backup strategy's prerequisite:

```
wal_level = replica
archive_mode = on
archive_command = '...'   # ship each WAL segment to durable storage — the *where* is ops
```

vera authors the `archive_command`'s shape and the recovery procedure; the storage target (S3, NFS, etc.) and the credentials are ops. Recovery replays a base backup, then WAL up to a `recovery_target_time`.

## Restore runbook — the deliverable that matters

A backup nobody has restored is a hope, not a backup. When asked for a backup strategy, the restore runbook is the more important half. Author it as ordered, testable steps:

1. Preconditions (which backup, which target instance, expected downtime)
2. Stop the application / fence writes
3. The exact restore commands
4. Post-restore verification (row counts, key invariants, app smoke test)
5. Rollback if the restore itself fails

Always recommend that restores be **rehearsed in staging** on a schedule — an untested restore path is the single most common recovery failure. Rehearsal scheduling is ops; the rehearsal procedure is vera's.

## Retention

Author the policy, not just the backups: how many dailies/weeklies/monthlies, how long WAL is kept (must cover the gap between base backups), when backups age out. Tie it back to RPO. Enforcing rotation (the cron, the lifecycle rules on storage) is ops.

## Boundary recap

- **In:** method choice, RPO/RTO reasoning, `pg_dump`/`pg_basebackup` command authoring, PITR config parameters and recovery procedure, retention policy, restore runbooks.
- **Out:** scheduling (cron/timers), offsite/cloud storage and its credentials, monitoring backup success, alerting on failure, the durable-storage target itself.
