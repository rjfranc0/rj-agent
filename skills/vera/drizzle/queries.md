# Drizzle Queries

Expressing query decisions in Drizzle. What the query should be (shape, pagination strategy, isolation) is decided at the Postgres layer.

## Two APIs

| API | Use for | N+1 |
|---|---|---|
| Relational (`db.query.x.findMany`) | Nested shapes, straightforward filters | Safe by construction |
| SQL-like (`db.select()...`) | Joins with aggregation, partial columns, complex predicates | Your responsibility |

Default to the relational API for fetching object graphs; drop to SQL-like when the query is genuinely relationalized (aggregates, custom projections).

## Relational API

```typescript
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
  columns: { id: true, name: true },            // select specific columns — Layer 1 rule
  with: {
    orders: {
      columns: { id: true, total: true },
      where: eq(orders.status, 'active'),
      orderBy: [desc(orders.createdAt)],
      limit: 20,
    },
  },
});
```

## SQL-like API

```typescript
import { eq, and, desc, sql, count } from 'drizzle-orm';

// join + aggregate
const rows = await db
  .select({ userId: users.id, name: users.name, orderCount: count(orders.id) })
  .from(users)
  .leftJoin(orders, eq(orders.userId, users.id))
  .where(eq(users.status, 'active'))
  .groupBy(users.id, users.name);
```

Batch lookup (N+1 fix #2 from Layer 1):

```typescript
import { inArray } from 'drizzle-orm';
const found = await db.select().from(users).where(inArray(users.id, ids));
```

Keyset pagination (composite cursor):

```typescript
const page = await db.select({ id: articles.id, title: articles.title })
  .from(articles)
  .where(sql`(${articles.createdAt}, ${articles.id}) < (${cursor.createdAt}, ${cursor.id})`)
  .orderBy(desc(articles.createdAt), desc(articles.id))
  .limit(20);
```

## Writes

```typescript
// insert ... returning
const [created] = await db.insert(users).values({ email, name }).returning({ id: users.id });

// upsert
await db.insert(settings)
  .values({ userId, key, value })
  .onConflictDoUpdate({ target: [settings.userId, settings.key], set: { value } });

// update / delete — always with where; an unguarded delete is a destructive op
await db.update(users).set({ name }).where(eq(users.id, id));
```

## Transactions

```typescript
await db.transaction(async (tx) => {
  const [order] = await tx.insert(orders).values(data).returning();
  await tx.insert(orderItems).values(items.map(i => ({ ...i, orderId: order.id })));
});  // throw to roll back — never swallow errors inside
```

Isolation per Layer 1 decision: `db.transaction(fn, { isolationLevel: 'serializable' })` — pair serializable with retry-on-`40001` in the caller. Everything inside uses `tx`, not `db` — a stray `db` call escapes the transaction silently.

## Raw SQL escape hatch

For what the builder can't express (CTEs, window functions, JSONPath):

```typescript
const ranked = await db.execute(sql`
  SELECT id, title, row_number() OVER (PARTITION BY category_id ORDER BY score DESC) AS rank
  FROM articles WHERE published = true
`);
```

Interpolated values in `sql`` ` ` are parameterized automatically — never build strings. Type results explicitly; don't let `execute` results float as `any`.

## Client pool config (in scope)

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,                    // size to workload; serverless → small (1–5) per instance
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});
export const db = drizzle(pool, { schema });
```

Pooler infrastructure (PgBouncer etc.) is ops territory; if the project runs one in transaction mode, prepared statements and `SET`-based session state are off the table — flag it.
