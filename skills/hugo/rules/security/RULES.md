# Security Core Rules

Always-loaded. Apply to every Fastify server.

## CORS — Use @fastify/cors

Never set CORS headers manually. Use `@fastify/cors` — it handles preflight, credentials, and origin validation correctly.

```ts
await app.register(import('@fastify/cors'), {
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? false,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
})
```

`origin: false` disables CORS entirely (safe default for internal APIs). Never use `origin: true` or `origin: '*'` in production — it allows any origin.

## Security Headers — Use @fastify/helmet

Register `@fastify/helmet` on every server. It sets the security headers that browsers and scanners expect. Omitting it is a free vulnerability.

```ts
await app.register(import('@fastify/helmet'))
```

For APIs that don't serve HTML, the defaults are appropriate. For HTML-serving routes, configure CSP explicitly.

## Input Validation — Zod Is the Gate

Never access `request.body`, `request.params`, or `request.querystring` without a route schema. The Zod type provider enforces this at the type level — if the schema is missing, the type is `unknown`.

No manual validation logic inside handlers — if something doesn't fit the schema, the validation error is thrown before the handler runs.

```ts
// ✗ do not do this — bypasses validation
app.post('/users', async (request) => {
  const body = request.body as { email: string } // unsafe cast
})

// ✓ schema enforces shape and types
app.withTypeProvider<ZodTypeProvider>().post('/users', {
  schema: { body: z.object({ email: z.string().email() }) },
}, async (request) => {
  // request.body.email is string — guaranteed by Zod
})
```

## Secrets — Never Hardcode

Never put secrets, tokens, or credentials in source code. Reference them via environment variables and validate them at startup — if a required secret is missing, crash immediately rather than starting in a degraded state.

```ts
// ✓ validate at startup — crash if missing
const config = z.object({
  JWT_SECRET: z.string().min(32),
  DATABASE_URL: z.string().url(),
}).parse(process.env)
```

See `rules/fastify/configuration.md` for the full env validation pattern.

## Lazy-Load Pointer

| Need | File |
|---|---|
| Rate limiting (global or per-route) | `rules/security/rate-limiting.md` |
