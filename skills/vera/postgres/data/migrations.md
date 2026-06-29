# Migrations (Postgres level)

SQL-level safety for schema changes. Tooling workflow (generation, journals, regeneration) lives in the ORM layer — this file covers what the migration SQL itself must look like.

## Idempotency — defensive clauses always

Migrations must be safe to re-run. Every statement carries its defensive clause:

```sql
CREATE TABLE IF NOT EXISTS ...;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT;
ALTER TABLE posts DROP COLUMN IF EXISTS deprecated_field;
DROP TABLE IF EXISTS old_table;
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (email);
```

Constraints have no `IF NOT EXISTS` — use drop-then-add:

```sql
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_user_id_fkey;
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
```

## Lock awareness

DDL takes locks; on tables with traffic, the wrong sequence blocks production. Severity tiers:

**Safe (brief metadata-only lock):** add nullable column; add column with constant default (PG 11+ — no rewrite); drop column (instant, space reclaimed later); `ADD CONSTRAINT ... NOT VALID`.

**Dangerous on live tables (long ACCESS EXCLUSIVE or full scan under lock):**

| Operation | Safe sequence |
|---|---|
| Add NOT NULL column to populated table | 1. add nullable → 2. backfill in batches → 3. `ADD CONSTRAINT ... CHECK (col IS NOT NULL) NOT VALID` → 4. `VALIDATE CONSTRAINT` (PG 12+: then `SET NOT NULL` is free, drop the check) |
| Add FK to populated table | `ADD CONSTRAINT ... NOT VALID` → `VALIDATE CONSTRAINT` (validation takes a weaker lock) |
| Create index on populated table | `CREATE INDEX CONCURRENTLY` — cannot run inside a transaction; failed builds leave INVALID indexes that must be dropped before retry |
| Change column type | Usually a full rewrite. New column → backfill → swap. Exceptions that are free: widening `VARCHAR(n)`, `VARCHAR→TEXT` |
| Add UNIQUE to populated column | `CREATE UNIQUE INDEX CONCURRENTLY` → `ADD CONSTRAINT ... UNIQUE USING INDEX` |

When the deployment context is unknown, write the safe sequence and note in handoff which steps assume live traffic — a pre-launch table can take the simple path.

## Destructive changes

`DROP TABLE`, `DROP COLUMN`, type narrowing, `TRUNCATE` in a migration: call them out explicitly when delivering, even code-only. If data loss is possible and the spec didn't acknowledge it, that's a clarification-batch blocker, not a judgment call.

Renames (table or column) break running application code during deploys. Default expectation: expand-and-contract (add new → dual-write/backfill → switch reads → drop old) unless the project deploys with downtime or the table is pre-launch. Ask via the batch if unclear.

## Transactional discipline

- Postgres DDL is transactional — a multi-statement migration should run in one transaction so it fails atomically. Most migration runners do this by default.
- Exceptions that cannot run in a transaction: `CREATE INDEX CONCURRENTLY`, `ALTER TYPE ... ADD VALUE` (pre-PG 12). These need their own migration, flagged for non-transactional execution per the tool's mechanism.
- Backfills of large tables don't belong inside the schema migration — batched updates (by PK range) outside the DDL transaction, or a separate data migration.

## Immutability

A migration that has reached production or the default branch is history. Never rewrite it — fix forward with a new migration. Draft migrations that haven't shipped have no such protection; regenerating them is preferred over hand-editing (workflow in the ORM layer).
