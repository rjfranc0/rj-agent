# Rate Limiting

## Global Rate Limit — @fastify/rate-limit

Apply a global limit as a baseline. Tighten per-route for sensitive endpoints (login, signup, password reset).

```bash
npm install @fastify/rate-limit
```

```ts
// plugins/rate-limit.ts
import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'

export default fp(async function rateLimitPlugin(app) {
  await app.register(rateLimit, {
    global: true,
    max: 200,              // requests per timeWindow per IP
    timeWindow: '1 minute',
    errorResponseBuilder: (request, context) => ({
      error: 'Too Many Requests',
      code: 'RATE_LIMITED',
      retryAfter: context.after,
    }),
  })
}, { name: 'rate-limit' })
```

## Per-Route Limits

Override the global limit at the route level for sensitive endpoints:

```ts
router.post('/auth/login', {
  config: {
    rateLimit: {
      max: 5,
      timeWindow: '15 minutes',
    },
  },
  schema: { body: LoginSchema },
}, handler)

router.post('/auth/password-reset', {
  config: {
    rateLimit: {
      max: 3,
      timeWindow: '1 hour',
    },
  },
  schema: { body: PasswordResetSchema },
}, handler)
```

## Disable for Specific Routes

Some routes (health checks, internal callbacks) shouldn't be rate-limited:

```ts
app.get('/health', {
  config: { rateLimit: false },
}, async () => ({ status: 'ok' }))
```

## Redis Backend — Distributed Environments

In-memory rate limiting doesn't work across multiple server instances. Use Redis when running more than one process:

```bash
npm install @fastify/rate-limit ioredis
```

```ts
import Redis from 'ioredis'

await app.register(rateLimit, {
  global: true,
  max: 200,
  timeWindow: '1 minute',
  redis: new Redis(app.config.REDIS_URL),
  // Key by IP by default; customize for authenticated routes:
  keyGenerator: (request) =>
    request.user?.id ?? request.ip,
})
```

Keying by user ID (for authenticated routes) is more accurate than keying by IP — it prevents shared IPs (corporate proxies, NAT) from unfairly triggering limits.

## Rate Limit Headers

`@fastify/rate-limit` adds these response headers automatically:
- `X-RateLimit-Limit` — max allowed
- `X-RateLimit-Remaining` — remaining in the window
- `X-RateLimit-Reset` — when the window resets (Unix timestamp)
- `Retry-After` — on 429, seconds to wait

Don't strip these headers — clients need them to implement backoff.
