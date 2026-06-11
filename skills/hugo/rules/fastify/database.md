# Database Integration

## Database as a Plugin

Always register the database as a shared plugin (wrapped with `fastify-plugin`). This makes the connection pool available as `app.db` everywhere, and ensures `onClose` cleanup fires during graceful shutdown.

```ts
// plugins/db.ts
import fp from 'fastify-plugin'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

export default fp(async function dbPlugin(app) {
  const pool = new Pool({ connectionString: app.config.DATABASE_URL })
  const db = drizzle(pool)

  app.decorate('db', db)
  app.addHook('onClose', async () => pool.end())
}, { name: 'db', dependencies: ['config'] })

declare module 'fastify' {
  interface FastifyInstance {
    db: ReturnType<typeof drizzle>
  }
}
```

## Connection Validation at Startup

Validate the database connection before the server starts accepting requests. A server that starts without a working database is more dangerous than one that fails to start.

```ts
export default fp(async function dbPlugin(app) {
  const pool = new Pool({ connectionString: app.config.DATABASE_URL })

  // Fail fast — validate connection before registering
  const client = await pool.connect()
  await client.query('SELECT 1')
  client.release()
  app.log.info('Database connection validated')

  app.decorate('db', drizzle(pool))
  app.addHook('onClose', async () => pool.end())
}, { name: 'db', dependencies: ['config'] })
```

## Transactions

Wrap multi-step operations in transactions. Never spread related mutations across separate awaits without a transaction — partial updates are worse than failed ones.

```ts
// With pg directly
app.post('/transfer', async (request) => {
  const client = await app.pg.connect()
  try {
    await client.query('BEGIN')
    await client.query('UPDATE accounts SET balance = balance - $1 WHERE id = $2',
      [request.body.amount, request.body.fromId])
    await client.query('UPDATE accounts SET balance = balance + $1 WHERE id = $2',
      [request.body.amount, request.body.toId])
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release() // always release — leak prevention
  }
})
```

## Query Error Mapping

Map database constraint violations to typed HTTP errors before they reach `setErrorHandler`. The error handler shouldn't know about database error codes.

```ts
import { DatabaseError } from 'pg'

async function createUser(data: NewUser) {
  try {
    return await db.insert(users).values(data).returning()
  } catch (err) {
    if (err instanceof DatabaseError && err.code === '23505') {
      // unique_violation — map to domain error
      throw new ConflictError('Email address')
    }
    throw err // re-throw unexpected errors
  }
}
```

## N+1 Query Prevention

Don't query inside a loop. Batch queries or use joins.

```ts
// ✗ N+1 — one query per user
const users = await db.findAll()
for (const user of users) {
  user.posts = await db.findPostsByUser(user.id) // N extra queries
}

// ✓ join or batch
const usersWithPosts = await db
  .select()
  .from(users)
  .leftJoin(posts, eq(users.id, posts.userId))
```
