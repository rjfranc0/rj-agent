# Security & Access (Postgres level)

Designing roles, privileges, authentication, and isolation. You author role/grant SQL and `pg_hba.conf` rules; you never run them against a live instance unless explicitly asked. Granting and revoking privileges on a live database is a destructive-class change — confirm before any live execution.

## Roles: the core model

Postgres has one object — the role — that is both "user" (can log in) and "group" (holds privileges). Design with that split deliberately:

- **Group roles** hold privileges, can't log in (`NOLOGIN`). Privileges attach here.
- **Login roles** log in, own no privileges directly, inherit from group roles via `GRANT group TO login`.

This keeps permissions auditable: you read a group's grants once, not every user's.

```sql
CREATE ROLE app_readwrite NOLOGIN;
CREATE ROLE app_x LOGIN PASSWORD 'set-via-secret-not-here';  -- real secret comes from the deploy/secret layer
GRANT app_readwrite TO app_x;
```

Never author real credentials into a file. Use a placeholder and note that the secret is injected by the deployment/secret-management layer (ops).

## Least-privilege app roles

The default install is dangerous: `PUBLIC` can connect to any database and historically had `CREATE` on the `public` schema. Lock it down, then grant up.

```sql
-- revoke the permissive defaults
REVOKE ALL ON DATABASE app_x_db FROM PUBLIC;
REVOKE CREATE ON SCHEMA public FROM PUBLIC;

-- grant only what the app needs
GRANT CONNECT ON DATABASE app_x_db TO app_readwrite;
GRANT USAGE ON SCHEMA public TO app_readwrite;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_readwrite;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_readwrite;

-- and for tables created later
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_readwrite;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_readwrite;
```

`ALTER DEFAULT PRIVILEGES` is the step everyone forgets — without it, every new table is invisible to the app role until manually granted.

Split read-only from read-write when the app has both a hot read path and a writer, or a separate analytics/reporting consumer:

```sql
CREATE ROLE app_readonly NOLOGIN;
GRANT CONNECT ON DATABASE app_x_db TO app_readonly;
GRANT USAGE ON SCHEMA public TO app_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO app_readonly;
```

The app must **not** connect as a superuser or the database owner for normal traffic — owners bypass RLS and can DROP anything. The migration runner may need owner/DDL rights; the runtime app role should not have them. Design two roles when migrations and runtime differ in privilege needs.

## Multi-app single instance — isolation

The shared-instance case. Goal: one app cannot read, exhaust, or destabilize another.

**Separate databases per app** (not just schemas) is the strong default — cross-database access requires explicit setup, so isolation is the baseline rather than something you maintain by vigilance.

```sql
CREATE DATABASE app_x_db OWNER app_x_owner;
CREATE DATABASE app_y_db OWNER app_y_owner;
```

Each app gets its own owner role and its own runtime role; no app's roles are granted on another's database. Then bound each app's resource footprint so noisy neighbors can't starve the instance:

```sql
ALTER ROLE app_x CONNECTION LIMIT 20;          -- can't hog the connection pool
ALTER ROLE app_x SET statement_timeout = '30s'; -- runaway queries self-abort
ALTER ROLE app_x SET work_mem = '32MB';         -- per-app memory ceiling (see configuration)
ALTER ROLE app_x SET idle_in_transaction_session_timeout = '60s';  -- kills forgotten open transactions
```

Per-role `SET` is the lever that makes a shared instance safe — global config stays conservative, each app is tuned and capped on its own role. This is genuine database design, and it's vera's to own.

## pg_hba.conf — authentication

`pg_hba.conf` controls *who can connect from where, authenticated how*, evaluated top-to-bottom, first match wins. Authoring rules is in scope; the file takes effect on **reload** (no restart).

```
# TYPE  DATABASE     USER        ADDRESS          METHOD
local   all          all                          scram-sha-256
host    app_x_db     app_x       10.0.0.0/24      scram-sha-256
host    all          all         0.0.0.0/0        reject
```

Principles: `scram-sha-256` over `md5` (legacy) or `trust` (never outside throwaway local); scope each app's rule to its own database and a tight network range; end with an explicit reject rather than relying on the implicit one. TLS enforcement (`hostssl`) and certificate management cross into ops — author the rule, flag the cert provisioning.

## Row-level security

When isolation must be *within* a shared table rather than across databases (multi-tenant single schema), RLS is the tool — full treatment in the data-layer features reference. The security-critical fact that belongs here: **RLS is bypassed by table owners and superusers** unless `FORCE ROW LEVEL SECURITY` is set, so the app must connect as a non-owner role for RLS to enforce anything. An RLS design paired with an owner-role connection is a silent no-op.

## Encryption & audit — the boundary

- **In:** designing *what* to audit (which tables, which operations) and the trigger/table mechanism; column-level access design; choosing `pgcrypto` for application-controlled column encryption.
- **Out:** at-rest disk/volume encryption, TLS certificate lifecycle, KMS/secret-store integration, shipping audit logs to a SIEM — all ops. Design the model, name the operational pieces.
