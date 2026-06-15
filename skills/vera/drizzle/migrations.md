# Drizzle Migrations

drizzle-kit workflow: generation, journal handling, draft churn, conflicts. SQL-level safety (idempotency, locks) is decided at the Postgres layer and applied during the review step here.

Commands below use `drizzle-kit` directly; substitute the project's scripts when the task context provides them.

## Standard flow

1. Change the schema files (source of truth).
2. Generate **with a meaningful name, always**: `npx drizzle-kit generate --name=users_add_avatar` — produces `NNNN_users_add_avatar.sql`, a snapshot, and a correct journal entry in one shot. Never generate unnamed and rename after; the journal must come out right the first time.
3. **Review and harden the SQL**: apply idempotent clauses and lock-safe sequencing per the Postgres migrations reference. The generator emits plain DDL; hardening is manual and expected.
4. Applying (`drizzle-kit migrate` or the project's runner) is a live-DB operation — explicit request only.

If a draft slipped through with a generated name, don't rename it — delete the draft artifacts and regenerate with `--name` (drafts are regenerable; see draft churn below).

## Custom migrations (no schema delta)

Extensions, triggers, data fixes:

```bash
npx drizzle-kit generate --custom --name=enable_pg_trgm
```

generates an empty migration with correct journal/snapshot bookkeeping; add the SQL by hand. Never create migration files manually — the journal must come from the generator.

## Draft churn (unshipped migrations)

While a migration exists only on the current branch, it's a draft with no history to preserve.

**Schema changed again before shipping** — don't chase it by editing the SQL. Delete the draft artifacts and regenerate:

```bash
rm migrations/0110_draft_name.sql
rm migrations/meta/0110_snapshot.json
# remove the 0110 entry from migrations/meta/_journal.json "entries"
npx drizzle-kit generate
```

**Multiple drafts accumulated on one branch** — consolidate before release. Delete all of them (SQL + snapshots + journal entries), regenerate one migration covering the full delta. Production never needs to replay intermediate draft shapes, and fewer migrations mean less deploy risk.

**No backward compatibility between drafts.** If an earlier draft created a column you've since renamed, don't add a compatibility `RENAME` step. Fix the dev database directly with the simplest SQL (live-DB op — explicit request), then regenerate from the final schema.

## Rebase conflicts

When migrations conflict on rebase: keep all upstream migrations, drop every migration this branch introduced (SQL + snapshots + journal entries), finish the rebase, regenerate this branch's migration from the rebased schema. Never hand-splice journal entries or merge two snapshot lineages.

## Shipped migrations

Immutable. A migration on the default branch or in production gets fixed forward with a new migration — never rewritten, renamed, or deleted.

## Failure cases

- **Snapshot/journal mismatch** ("snapshot not found", ordering errors): some artifact was hand-edited or half-deleted. Reconstruct by removing this branch's drafts cleanly and regenerating — don't patch JSON by hand.
- **Generated SQL looks wrong** (drops you didn't ask for): the schema files and the latest snapshot disagree — usually a missed file in the schema config's `schema` glob, or a rebase that brought a newer snapshot. Verify the config covers all schema files before trusting the diff.
- **Drift between dev DB and migrations**: fix the dev DB with direct SQL to match (live-DB op), or reset it and replay; never bend the migration to match a drifted database.
