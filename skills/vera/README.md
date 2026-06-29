# vera

PostgreSQL database expert skill. *Vera* — truth: the database is the source of it.

A Postgres expert that designs, implements, and administers database work — data modeling, schemas, migrations, queries, indexes, Postgres features, plus instance configuration, access design, maintenance, and backup strategy. It takes anything from a rough entities-and-relations idea (designs first, then implements) to a precise technical spec (implements within its constraints) to an instance-level task (authors the config, roles, or runbook). Data-layer work is expressed through the project's ORM; Drizzle is currently supported, with more ORM modules slotting in over time.

## Architecture

Two layers, lazily loaded. `postgres/` is the database truth (no ORM code); the ORM layer is how data work is expressed in code (no Postgres theory). The split is enforced by a no-bleed rule.

```
vera/
├── SKILL.md              # always loaded: identity, calibration, non-negotiables, routing
├── postgres/             # Layer 1 — Postgres knowledge
│   ├── data/             #   authoring the data
│   │   ├── design.md     #     modeling, normalization, relationships, multi-tenancy, partitioning
│   │   ├── schema.md     #     types, constraints, FKs, naming
│   │   ├── indexing.md   #     index strategy, composite ordering, partial/covering
│   │   ├── queries.md    #     patterns, anti-patterns, N+1, pagination, EXPLAIN
│   │   ├── migrations.md #     idempotent SQL, lock-safe DDL
│   │   └── features.md   #     JSONB, FTS, RLS, enums, extensions, psql
│   └── admin/            #   operating the instance (as an authoring task)
│       ├── configuration.md  # postgresql.conf tuning, reload-vs-restart, shared-instance limits
│       ├── security.md       # roles, privileges, pg_hba, least-privilege & per-app isolation
│       ├── maintenance.md    # vacuum/bloat, stats, reindex, autovacuum tuning, partition rotation
│       └── backup.md         # strategy, RPO/RTO, pg_dump/basebackup, PITR, restore runbooks
└── drizzle/              # Layer 2 — ORM expression (no Postgres theory)
    ├── RULES.md          #   Drizzle non-negotiables + routing
    ├── schema.md         #   pgTable, columns, relations, index declarations
    ├── queries.md        #   query APIs, transactions, raw SQL, pool config
    └── migrations.md     #   drizzle-kit workflow, drafts, rebases, journal
```

The split rule: `postgres/` never contains ORM code; ORM modules never explain Postgres concepts. New ORMs (any language) are added as siblings of `drizzle/` without touching Layer 1. Admin work is pure Postgres — it has no ORM layer.

## Hard lines

- Calibrates to the request: design-first for loose ideas, implement-as-specified for detailed specs
- Authors artifacts (schema, code, config, role SQL, runbooks) — never operates a live instance unless explicitly asked; destructive and restart-class changes always state their blast radius
- Postgres only — flags workloads that genuinely don't fit, never designs for other engines
- Project- and platform-agnostic — paths, commands, and conventions come from task context
- Out of scope (→ ops): applying config, restarts, running backups/restores, replication/HA, monitoring, scheduling, pooler infra, secrets, TLS
