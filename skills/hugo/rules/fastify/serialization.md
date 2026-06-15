# Response Serialization

## Response Schemas Are Not Optional

When a response schema is defined, Fastify uses `fast-json-stringify` instead of `JSON.stringify`. This is ~2–3x faster and provides two additional guarantees:

1. **Security**: only fields defined in the schema are serialized — undeclared fields (including internal properties or accidentally leaked data) are stripped
2. **Type safety**: the response type is inferred from the Zod schema when using ZodTypeProvider

Define response schemas for every success status code at minimum:

```ts
router.get('/users/:id', {
  schema: {
    params: z.object({ id: z.string().uuid() }),
    response: {
      200: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        createdAt: z.string().datetime(),
        // ✓ internal fields like passwordHash, deletedAt not listed — stripped
      }),
      404: z.object({ error: z.string(), code: z.string() }),
    },
  },
}, async (request) => {
  const user = await db.findUser(request.params.id)
  if (!user) throw new NotFoundError('User')
  return user // passwordHash is not in the response schema — Fastify strips it
})
```

## String Format Serialization

Dates should be serialized as ISO 8601 strings. Return JavaScript `Date` objects and let Fastify serialize them — don't manually call `.toISOString()`:

```ts
// ✓ return Date — serialized correctly when schema has z.string().datetime()
return { createdAt: user.createdAt }  // user.createdAt is a Date object

// ✗ unnecessary manual serialization
return { createdAt: user.createdAt.toISOString() }
```

## Shared Response Schemas

For schemas reused across routes, define them once and import them:

```ts
// src/schemas/common.ts
import { z } from 'zod'

export const ErrorSchema = z.object({
  error: z.string(),
  code: z.string(),
})

export const PaginatedSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int(),
    page: z.number().int(),
    pageSize: z.number().int(),
  })
```

## Reply.serialize()

For cases where you need to manually serialize a response (e.g., streaming or custom serialization logic), use `reply.serialize()` — it applies the route's response schema rather than `JSON.stringify`:

```ts
const serialized = reply.serialize(data) // uses fast-json-stringify with route schema
```
