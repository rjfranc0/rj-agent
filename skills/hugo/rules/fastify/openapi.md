# OpenAPI / Swagger

## Setup — @fastify/swagger + @fastify/swagger-ui

Install:
```bash
npm install @fastify/swagger @fastify/swagger-ui zod-to-json-schema
```

Register as shared plugins (before routes):

```ts
// plugins/openapi.ts
import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

export default fp(async function openapiPlugin(app) {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'API',
        version: '1.0.0',
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: false },
  })
}, { name: 'openapi' })
```

Swagger-UI is available at `/docs`. Disable or restrict it in production:

```ts
if (app.config.NODE_ENV === 'production') {
  // Either skip registration entirely, or restrict access via a preHandler
}
```

## Zod Schemas → OpenAPI

`fastify-type-provider-zod` handles schema conversion automatically — Zod schemas on routes are converted to JSON Schema for the OpenAPI spec without extra work.

For shared schemas referenced across routes, register them explicitly:

```ts
import { zodToJsonSchema } from 'zod-to-json-schema'

// Register a reusable schema component
app.addSchema({
  $id: 'User',
  ...zodToJsonSchema(UserSchema, { target: 'openapi3' }),
})

// Reference it in route schemas
router.get('/:id', {
  schema: {
    response: { 200: { $ref: 'User#' } },
  },
}, handler)
```

## Route Documentation

Add metadata to routes via the `schema` object. This populates the OpenAPI spec without extra tooling.

```ts
router.post('/users', {
  schema: {
    summary: 'Create a user',
    description: 'Creates a new user account. Returns 409 if email already exists.',
    tags: ['users'],
    security: [{ bearerAuth: [] }],
    body: CreateUserSchema,
    response: {
      201: UserSchema,
      409: ErrorSchema,
      422: ValidationErrorSchema,
    },
  },
}, handler)
```

**Document all response codes** that the route can realistically return. Leaving out error responses makes the spec misleading for consumers.

## Tags — Group by Resource

Use `tags` to group routes logically in the Swagger UI:

```ts
// Apply a tag to an entire route scope
export default async function usersRoute(app: FastifyInstance) {
  app.addHook('onRoute', (route) => {
    route.schema ??= {}
    route.schema.tags ??= ['users']
  })
  // all routes in this file get tagged 'users'
}
```

## Spec Export

To export the spec as a static JSON/YAML file (for CI validation, SDK generation):

```ts
await app.ready()
const spec = app.swagger()
await fs.writeFile('openapi.json', JSON.stringify(spec, null, 2))
```

Run this as part of a `generate:spec` script, not on every server start.
