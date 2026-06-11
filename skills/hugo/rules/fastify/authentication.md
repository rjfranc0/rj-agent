# Authentication

## JWT — @fastify/jwt as a Plugin

Register JWT as a shared plugin (wrapped with `fastify-plugin`) and decorate the instance with an `authenticate` preHandler. This keeps token verification logic in one place.

```ts
// src/plugins/auth.ts
import fp from 'fastify-plugin'
import fjwt from '@fastify/jwt'
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

export default fp(async function authPlugin(app: FastifyInstance) {
  await app.register(fjwt, {
    secret: app.config.JWT_SECRET,
    sign: { expiresIn: '1h' },
  })

  app.decorate('authenticate', async function (
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      await request.jwtVerify()
    } catch {
      reply.code(401).send({ error: 'Unauthorized', code: 'INVALID_TOKEN' })
    }
  })
}, { name: 'auth', dependencies: ['config'] })
```

```ts
// TypeScript augmentation — put in a types.ts or the plugin file
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}
```

Use `preHandler` to protect routes:
```ts
app.get('/profile', {
  preHandler: [app.authenticate],
  schema: { response: { 200: UserSchema } },
}, async (request) => {
  return request.user
})
```

## Login Route — Signing Tokens

```ts
app.withTypeProvider<ZodTypeProvider>().post('/auth/login', {
  schema: {
    body: z.object({ email: z.string().email(), password: z.string() }),
    response: { 200: z.object({ token: z.string() }) },
  },
}, async (request, reply) => {
  const user = await validateCredentials(request.body.email, request.body.password)
  if (!user) return reply.code(401).send({ error: 'Invalid credentials' })

  const token = app.jwt.sign({ id: user.id, email: user.email })
  return { token }
})
```

## Multiple Auth Strategies — @fastify/auth

When you need to support multiple authentication methods (e.g. JWT + API key), use `@fastify/auth` to compose strategies declaratively.

```ts
import fauth from '@fastify/auth'

await app.register(fauth)

// Define strategies as decorators
app.decorate('verifyJwt', async (request, reply) => { await request.jwtVerify() })
app.decorate('verifyApiKey', async (request, reply) => {
  const key = request.headers['x-api-key']
  if (!key || !isValidApiKey(key)) throw new UnauthorizedError()
})

// Compose with AND or OR logic
app.get('/resource', {
  preHandler: app.auth([app.verifyJwt, app.verifyApiKey], { relation: 'or' }),
}, handler)
```

## Token in Request

Access the verified JWT payload via `request.user`:
```ts
// After jwtVerify(), the payload is on request.user
const { id, email } = request.user as { id: string; email: string }
```

Extend the JWT typing via module augmentation:
```ts
declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: { id: string; email: string }
    user: { id: string; email: string }
  }
}
```

## Refresh Tokens

Implement refresh as a separate route — never auto-refresh inside `authenticate`. Separation of concerns: the auth plugin verifies tokens, a dedicated route issues new ones.

```ts
app.post('/auth/refresh', {
  schema: { body: z.object({ refreshToken: z.string() }) },
}, async (request, reply) => {
  const payload = app.jwt.verify(request.body.refreshToken)
  const accessToken = app.jwt.sign({ id: payload.id, email: payload.email })
  return { token: accessToken }
})
```
