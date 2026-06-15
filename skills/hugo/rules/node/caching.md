# Caching

**Activate when the task involves:** repeated async lookups, duplicate concurrent requests, ETL transforms with enrichment, N+1 remote calls, or hot-path DB reads.

## Choose the Right Cache

| Pattern | Library | When |
|---|---|---|
| Bounded in-memory, single process | `lru-cache` | Cache DB or API results; evict by size/TTL |
| Deduplicate concurrent async calls | `async-cache-dedupe` | Prevent stampede; ETL enrichment inside streams |

## lru-cache — Bounded In-Memory

```bash
npm install lru-cache
```

```ts
import { LRUCache } from 'lru-cache'

const cache = new LRUCache<string, User>({
  max: 500,         // max 500 entries
  ttl: 60_000,      // 60 seconds TTL
  allowStale: false,
})

async function getUser(id: string): Promise<User> {
  const cached = cache.get(id)
  if (cached) return cached

  const user = await db.users.findById(id)
  cache.set(id, user)
  return user
}
```

Use `lru-cache` for caching results that don't require deduplication of concurrent calls (i.e., multiple simultaneous requests for the same key can each execute the underlying fetch and just race to set the cache).

## async-cache-dedupe — Concurrent Request Deduplication

```bash
npm install async-cache-dedupe
```

```ts
import { createCache } from 'async-cache-dedupe'

const cache = createCache({
  ttl: 60,                   // seconds
  stale: 5,                  // serve stale for 5s while revalidating
  storage: { type: 'memory' },
})

// Define a cached function — concurrent calls for the same key
// share one in-flight promise
cache.define('user', async (id: string) => {
  return db.users.findById(id)
})

// Usage
const user = await cache.user(userId) // concurrent calls deduplicated
```

`async-cache-dedupe` is the right choice inside stream transforms and handlers where many items can request the same key simultaneously.

## Cache as a Fastify Plugin

Expose the cache via a decorator so it's available across all routes:

```ts
// plugins/cache.ts
import fp from 'fastify-plugin'
import { createCache } from 'async-cache-dedupe'

export default fp(async function cachePlugin(app) {
  const cache = createCache({ ttl: 60, storage: { type: 'memory' } })
  cache.define('user', (id: string) => app.db.users.findById(id))

  app.decorate('cache', cache)
}, { name: 'cache', dependencies: ['db'] })
```

## Cache Invalidation

Explicit invalidation on mutation:

```ts
app.put('/users/:id', async (request) => {
  const user = await db.users.update(request.params.id, request.body)
  app.cache.invalidate('user', request.params.id) // bust the cache
  return user
})
```

Never cache-bust entire keys speculatively — only invalidate what you know has changed.
