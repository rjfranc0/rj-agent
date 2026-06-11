# Decorators

Decorators extend Fastify's instance, request, or reply objects. Always use the decorator API — never mutate these objects directly.

## Three Decorator Types

```ts
// Instance — shared services (db, cache, config)
app.decorate('db', dbClient)

// Request — per-request state (authenticated user, timing, parsed data)
app.decorateRequest('user', null)   // initialize with null for objects
app.decorateRequest('startTime', 0) // initialize with 0 for numbers

// Reply — custom response helpers
app.decorateReply('ok', function (data: unknown) {
  return this.code(200).send({ data })
})
```

**Always initialize** `decorateRequest` and `decorateReply` with a value matching the type — `null` for objects, `0` for numbers, `''` for strings. Fastify uses this to allocate the property on the prototype efficiently. Skipping initialization causes a `TypeError` at runtime.

## TypeScript — Module Augmentation

Declare custom decorators so TypeScript knows their types. Co-locate the declaration with the plugin that creates the decorator.

```ts
// plugins/auth.ts
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>
  }

  interface FastifyRequest {
    user: { id: string; email: string; roles: string[] } | null
  }
}

// plugins/db.ts
declare module 'fastify' {
  interface FastifyInstance {
    db: DatabaseClient
  }
}
```

Don't put all augmentations in a single `types.ts` file — it creates an implicit dependency on load order. Keep declarations next to the plugin that registers them.

## Decorators and Encapsulation

Decorators defined inside a plugin without `fastify-plugin` are scoped to that plugin's context. To make a decorator available everywhere, the plugin must be wrapped with `fastify-plugin`.

```ts
// ✗ decorator is scoped — not visible to sibling plugins
export default async function localPlugin(app) {
  app.decorate('helper', myHelper)
}

// ✓ decorator breaks encapsulation — visible everywhere after registration
import fp from 'fastify-plugin'
export default fp(async function sharedPlugin(app) {
  app.decorate('helper', myHelper)
}, { name: 'shared-plugin' })
```

## Avoid Shared Mutable State on Request

Don't store mutable shared state in request decorators — each request has its own copy of the prototype, so mutations don't leak across requests. But initializing with a reference type (object/array) means all requests share the same reference initially — always initialize to `null` and assign in a hook.

```ts
// ✗ all requests share the same array reference
app.decorateRequest('items', [])

// ✓ null initial value — assign a new array per request in a hook
app.decorateRequest('items', null)
app.addHook('preHandler', async (request) => {
  request.items = []
})
```
