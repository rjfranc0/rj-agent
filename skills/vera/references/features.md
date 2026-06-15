# Postgres Features (spec-driven)

Implement these when the spec calls for them — don't introduce them speculatively. Includes psql for admin-style direct requests.

## JSONB

For semi-structured data the schema genuinely can't fix. Columns the application filters or joins on belong as real columns, not JSONB keys.

Operators that matter:

```sql
data->>'type' = 'purchase'        -- text extraction
data @> '{"status": "active"}'    -- containment (GIN-indexable)
data ? 'error_code'               -- key existence
jsonb_path_query(data, '$.items[*].sku')  -- JSONPath
```

Indexing:

```sql
CREATE INDEX events_data_idx ON events USING GIN (data);              -- all keys, @>/?/?| support
CREATE INDEX events_data_path_idx ON events USING GIN (data jsonb_path_ops);  -- @> only, smaller/faster
CREATE INDEX events_type_idx ON events ((data->>'type'));             -- one hot key, btree
```

Updates: `jsonb_set(data, '{a,b}', '"new"')` for surgical writes; `data || '{"k": "v"}'` for merge. Whole-column rewrites lose concurrent updates — keep JSONB writes single-statement.

## Full-text search

```sql
-- generated column + GIN is the standard shape
ALTER TABLE articles ADD COLUMN search tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(body, '')), 'B')
  ) STORED;
CREATE INDEX articles_search_idx ON articles USING GIN (search);

SELECT id, title, ts_rank(search, query) AS rank
FROM articles, websearch_to_tsquery('english', $1) query
WHERE search @@ query
ORDER BY rank DESC LIMIT 20;
```

`websearch_to_tsquery` for user input (forgiving syntax), `to_tsquery` for programmatic queries. For fuzzy/typo matching, `pg_trgm` with a GIN trigram index complements FTS. If the spec demands relevance tuning beyond `ts_rank` weights, flag that a dedicated search engine may be the honest answer — decision goes upstream.

## Row-level security

```sql
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY documents_owner ON documents
  USING (owner_id = current_setting('app.user_id')::bigint)          -- read filter
  WITH CHECK (owner_id = current_setting('app.user_id')::bigint);    -- write filter
```

- The app sets context per request/transaction: `SET LOCAL app.user_id = '42'` (`SET LOCAL` so it dies with the transaction — mandatory under connection pooling).
- **Table owners and superusers bypass RLS** unless `FORCE ROW LEVEL SECURITY` — the app must connect as a non-owner role for RLS to mean anything. Verify this; it's the classic silent hole.
- Policies are combined with OR (permissive, default) or AND (`AS RESTRICTIVE`).
- Every policy predicate runs on every row touched — keep them index-friendly (the predicate column indexed).

## Enums (native)

Only when locked in by spec/project (CHECK constraints preferred — see schema reference). Operational facts: `ALTER TYPE ... ADD VALUE` cannot be undone, values can never be removed or reordered, and adding values mid-transaction has version caveats. Plan migrations accordingly.

## Extensions

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Common, safe set: `pg_trgm` (fuzzy match), `pgcrypto` (`gen_random_uuid()` pre-PG 13, digest functions), `citext` (case-insensitive text), `btree_gin`/`btree_gist` (composite GIN/GiST), `pg_stat_statements` (query stats — reading it is fine; enabling it needs a server restart → ops). Availability depends on the hosting platform; if uncertain, note the assumption in handoff. Extension creation goes in its own custom migration.

## psql (admin-style requests)

For "give me the psql command / query to X" requests — generating commands is always fine; executing them follows the live-access rule.

| Need | Command |
|---|---|
| Connect | `psql "$DATABASE_URL"` or `psql -h host -U user -d db` |
| List tables / describe | `\dt` / `\d+ table_name` |
| List indexes on table | `\di+ *table_name*` |
| Sizes | `\dt+` or `SELECT pg_size_pretty(pg_total_relation_size('t'))` |
| Running queries | `SELECT pid, state, query_start, left(query, 80) FROM pg_stat_activity WHERE state <> 'idle';` |
| Kill a query (destructive — confirm) | `SELECT pg_cancel_backend(pid);` then `pg_terminate_backend(pid)` if needed |
| Run file / one-shot | `psql -f file.sql` / `psql -c "SELECT ..."` |
| CSV out | `\copy (SELECT ...) TO 'out.csv' WITH CSV HEADER` |
| Timing / expanded display | `\timing` / `\x` |

Long-running statements from scripts: wrap with `SET statement_timeout = '30s'` to avoid wedging the server.
