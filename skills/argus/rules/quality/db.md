# Quality — Database (Postgres / ORM)

Reviewer-angle anti-patterns. Flag these; the fix belongs to the implementer.

## Schema & Migrations

- **Constraints in app code only** — uniqueness, foreign keys, non-null, enums enforced solely by the application; the database is the last line and must agree
- **Destructive migration without a path** — column drops/renames or type changes with no backfill, no two-step deploy, or no down migration where the project keeps them
- **Locking migrations on hot tables** — operations taking long exclusive locks (naive `ALTER`, non-concurrent index builds) written as if the table were idle
- **Nullable-by-default drift** — columns nullable for convenience when the domain says required; null becomes an unhandled third state everywhere

## Queries & ORM

- **Implicit N+1 by relation access** — lazy relations touched in loops; the ORM hides the query count, the review must not
- **SELECT * shapes** — full entities fetched where three columns are read; payloads and indexes both suffer
- **Business filtering in memory** — fetch-all-then-filter/sort/aggregate in application code for work the database does with an index
- **Index claims without evidence** — new query patterns on large tables with no matching index, or indexes added speculatively with no querying pattern
- **Raw SQL escaping the project's layer** — string-built queries beside an ORM, losing both parameterization guarantees and schema typing

## Transactions & Consistency

- **Multi-write operations without a transaction** — partial failure leaves related rows inconsistent
- **Transactions held across I/O** — external calls (HTTP, queues) inside an open transaction, pinning connections and inviting deadlocks
- **Read-modify-write races** — check-then-insert or fetch-increment-save without locking, `ON CONFLICT`, or atomic update where concurrency is plausible
