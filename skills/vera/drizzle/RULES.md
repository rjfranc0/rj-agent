# Drizzle Rules

Drizzle ORM layer. Postgres-level decisions are already made (Layer 1) — these files express them in Drizzle. Never re-derive strategy here.

## Non-negotiables

- **Never `drizzle-kit push` outside throwaway local development.** Migrations are the only path schema changes take toward shared or production databases.
- **Never hand-create migration files or hand-edit the journal.** The generator owns SQL files, snapshots, and journal entries — always generate with `--name` so nothing needs renaming after. Manual edits are limited to hardening generated SQL (idempotent clauses, lock-safe sequencing).
- **Schema files are the single source of truth.** The database shape is whatever the schema declares; drift gets fixed by migration, never by ad-hoc DDL on shared databases.
- **Type safety is the point.** No `any`-casts around query results, no raw SQL where the query builder expresses it cleanly. Raw `sql` template escape hatch is legitimate for what Drizzle can't express (window functions, CTEs, JSONPath) — typed via `.mapWith()` or explicit result types.

## Routing

| Task touches | Load |
|---|---|
| Table definitions, columns, constraints, relations, index declarations | `drizzle/schema.md` |
| Queries: select/insert/update/delete, joins, aggregations, relational API, transactions | `drizzle/queries.md` |
| drizzle-kit workflow, journal, regeneration, consolidation, rebase conflicts | `drizzle/migrations.md` |

## Project context

These files are project-agnostic. Paths (`src/db/schema.ts` vs `packages/database/`), commands (`npx drizzle-kit ...` vs project scripts), and conventions come from the task context. If the task doesn't say where schema files live or what command generates migrations, that's a clarification-batch item — don't guess paths.
