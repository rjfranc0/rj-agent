# Fastify Core Rules

Always-loaded. Apply to every Fastify project.

## Server — buildServer() Factory

Never instantiate Fastify directly in the entry point. Wrap it in a `buildServer()` factory — this keeps the server testable and the entry point minimal.

```ts
// src/server.ts
import Fastify from 'fastify'
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod'

export async function buildServer() {
  const app = Fastify({ logger: true })

  app.setValidatorCompiler(validatorCompiler)
  app.setSerializerCompiler(serializerCompiler)

  // register plugins and routes here
  await app.register(import('./plugins/config.ts'))
  await app.register(import('./plugins/db.ts'))
  await app.register(import('./plugins/auth.ts'))
  await app.register(import('@fastify/autoload'), { dir: './routes' })

  return app
}

// src/app.ts
import { buildServer } from './server.ts'

const app = await buildServer()
await app.listen({ port: 3000, host: '0.0.0.0' })
```

## Schema Validation — Zod Type Provider

Always configure the Zod type provider. This gives full TypeScript inference from schemas — no manual type casting anywhere.

```ts
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod'
import { z } from 'zod'

// Set once in buildServer()
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Use withTypeProvider on the app or instance
app.withTypeProvider<ZodTypeProvider>().post('/users', {
  schema: {
    body: z.object({ name: z.string(), email: z.string().email() }),
    response: { 201: z.object({ id: z.string(), name: z.string() }) },
  },
}, async (request, reply) => {
  // request.body is fully typed — no casting
  return reply.code(201).send(await createUser(request.body))
})
```

Define schemas near their routes, or in a colocated `schema.ts`. Don't define schemas in a global registry unless they're reused widely — it creates implicit coupling.

**Every route must declare:**
- `body` schema (for POST/PUT/PATCH)
- `params` schema (for `:id` style params)
- `querystring` schema (for query params)
- `response` schema (at minimum for success status codes)

Missing response schemas disable Fastify's serialization optimization and leave types unverified.

## Plugins — Encapsulation Rule

This is the most important Fastify architectural rule:

- **Shared plugins** (db, auth, config, logger): wrap with `fastify-plugin`. This breaks encapsulation intentionally — decorators and hooks from these plugins become available in all child scopes.
- **Route plugins**: never wrap with `fastify-plugin`. Keep them encapsulated — their hooks and decorators stay scoped.

```ts
// ✗ wrong — route plugin wrapped with fp, leaks scope
import fp from 'fastify-plugin'
export default fp(async function usersRoute(app) {
  app.get('/users', ...)
})

// ✓ correct — route plugin is bare, stays scoped
export default async function usersRoute(app: FastifyInstance) {
  app.get('/users', ...)
}

// ✓ correct — shared plugin wrapped with fp, breaks encapsulation intentionally
import fp from 'fastify-plugin'
export default fp(async function dbPlugin(app) {
  const db = await createDbConnection()
  app.decorate('db', db)
  app.addHook('onClose', async () => db.disconnect())
}, { name: 'db' })
```

## Error Handling — Always Set a Handler

Every server must set a custom error handler. The default Fastify error handler is fine for development but leaks internal information in production.

```ts
app.setErrorHandler((error, request, reply) => {
  const statusCode = error.statusCode ?? 500

  // Log server errors with full detail; log client errors minimally
  if (statusCode >= 500) {
    request.log.error({ err: error }, 'Server error')
  } else {
    request.log.warn({ err: error }, 'Client error')
  }

  reply.status(statusCode).send({
    error: statusCode >= 500 ? 'Internal Server Error' : error.message,
    code: error.code ?? 'UNKNOWN_ERROR',
  })
})

app.setNotFoundHandler((request, reply) => {
  reply.status(404).send({ error: 'Not Found', code: 'ROUTE_NOT_FOUND' })
})
```

Never leak stack traces to clients. Never send `error.stack` in responses.

## Hooks — Cleanup and Lifecycle

Use `onClose` for cleanup in plugins. Use `onReady` for pre-flight checks. Both are idiomatic and prevent resource leaks.

```ts
app.addHook('onClose', async () => {
  await db.disconnect()
  await cache.quit()
})
```

## Lazy-Load Pointers

| Need | File |
|---|---|
| JWT / multi-strategy auth | `rules/fastify/authentication.md` |
| Pino logging config | `rules/fastify/logging.md` |
| Environment / secrets | `rules/fastify/configuration.md` |
| Error handling depth | `rules/fastify/error-handling.md` |
| Autoload setup | `rules/fastify/autoload.md` |
| OpenAPI / Swagger | `rules/fastify/openapi.md` |
| Decorators / module augmentation | `rules/fastify/decorators.md` |
| Serialization | `rules/fastify/serialization.md` |
| File uploads / content parsers | `rules/fastify/content-type.md` |
| WebSockets | `rules/fastify/websockets.md` |
| Database patterns | `rules/fastify/database.md` |
| HTTP proxy | `rules/fastify/http-proxy.md` |
