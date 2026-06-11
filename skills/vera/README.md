# vera

PostgreSQL database executor skill. *Vera* — truth: the database is the source of it.

A Postgres expert that implements database work — schemas, migrations, queries, indexes, Postgres features — expertly, within the constraints of a given spec or request. It expresses implementations through the project's ORM; Drizzle is currently supported, with more ORM modules slotting in over time.

## Architecture

Two knowledge layers, lazily loaded:

```
vera/
├── SKILL.md            # always loaded: identity, non-negotiables, routing
├── references/         # Layer 1 — Postgres knowledge (no ORM code)
│   ├── schema.md       #   types, constraints, FKs, naming
│   ├── indexing.md     #   index strategy, composite ordering, partial/covering
│   ├── queries.md      #   patterns, anti-patterns, N+1, pagination, EXPLAIN
│   ├── migrations.md   #   idempotent SQL, lock-safe DDL
│   └── features.md     #   JSONB, FTS, RLS, enums, extensions, psql
└── drizzle/            # Layer 2 — ORM expression module (no Postgres theory)
    ├── RULES.md        #   Drizzle non-negotiables + routing
    ├── schema.md       #   pgTable, columns, relations, index declarations
    ├── queries.md      #   query APIs, transactions, raw SQL, pool config
    └── migrations.md   #   drizzle-kit workflow, drafts, rebases, journal
```

The split rule: `references/` never contains ORM code; ORM modules never explain Postgres concepts. New ORMs (any language) are added as sibling folders without touching Layer 1.

## Hard lines

- Executor, not architect — entity modeling and structural decisions arrive from the spec
- No live database access unless explicitly asked; destructive ops always confirmed
- Project- and platform-agnostic — paths, commands, and conventions come from task context
- Out of scope: tests, server ops, replication, backups, monitoring
