# Error Handling

## The Boundary Pattern

Internal code (services, utils, domain logic) never throws — it returns `Result<T, E>`. The Fastify route handler is the only place where an `Err` becomes a `throw`, because `setErrorHandler` is waiting to catch it.

```ts
// Service — returns Result, never throws
async function getUser(id: string): Promise<Result<User, NotFoundError>> {
  const user = await db.findById(id)
  if (!user) return err(new NotFoundError('User'))
  return ok(user)
}

// Route handler — the boundary
app.withTypeProvider<ZodTypeProvider>().get('/users/:id', {
  schema: {
    params: z.object({ id: z.string().uuid() }),
    response: { 200: UserSchema },
  },
}, async (request) => {
  const result = await getUser(request.params.id)
  if (result.error) throw result.error  // Fastify's setErrorHandler takes it from here
  return result.data
})
```

Keep the boundary thin. The handler should not contain business logic — it receives a Result and either returns the data or throws the error. Nothing more.

## Error Handler — Full Pattern

The custom error handler (set via `setErrorHandler`) is the single exit point for all errors. Keep it consistent — same shape every time, never leaking internals.

```ts
import { FastifyError } from 'fastify'

app.setErrorHandler((error: FastifyError, request, reply) => {
  const statusCode = error.statusCode ?? 500
  const isServerError = statusCode >= 500

  if (isServerError) {
    request.log.error({ err: error, reqId: request.id }, 'Server error')
  } else {
    request.log.warn({ code: error.code, message: error.message }, 'Client error')
  }

  reply.status(statusCode).send({
    error: isServerError ? 'Internal Server Error' : error.message,
    code: error.code ?? 'UNKNOWN_ERROR',
    // Include validation details for 400 errors
    ...(statusCode === 400 && error.validation && { details: error.validation }),
  })
})

app.setNotFoundHandler((request, reply) => {
  reply.status(404).send({
    error: `Route ${request.method}:${request.url} not found`,
    code: 'ROUTE_NOT_FOUND',
  })
})
```

## Typed HTTP Errors

Define all HTTP errors as typed classes using `@fastify/error`. This integrates with `setErrorHandler` — the `statusCode`, `code`, and message flow through automatically.

```ts
import createError from '@fastify/error'

// Define once, export, import where needed
export const NotFoundError = createError('NOT_FOUND', '%s not found', 404)
export const ConflictError = createError('CONFLICT', '%s already exists', 409)
export const ForbiddenError = createError('FORBIDDEN', 'Insufficient permissions', 403)
export const UnprocessableError = createError('UNPROCESSABLE', '%s', 422)
export const InternalError = createError('INTERNAL_ERROR', 'An unexpected error occurred', 500)

// Usage in handlers
throw new NotFoundError('User')           // → 404: "User not found"
throw new ConflictError('Email address')  // → 409: "Email address already exists"
```

## Validation Error Shape

Fastify + Zod produces structured validation errors automatically. Expose them in the error handler for 400 responses:

```ts
// Zod validation errors are attached to error.validation
// Shape from fastify-type-provider-zod:
// [{ instancePath: '/body/email', message: 'Invalid email' }]

if (statusCode === 400 && error.validation) {
  reply.status(400).send({
    error: 'Validation Error',
    code: 'VALIDATION_ERROR',
    details: error.validation,
  })
  return
}
```

## Never Throw in onError or setErrorHandler

If the error handler itself throws, Fastify sends a 500 with no body — you get a silent failure and lose the original error. Wrap the handler body in try/catch:

```ts
app.setErrorHandler((error, request, reply) => {
  try {
    // ... handler logic
  } catch (handlerError) {
    request.log.fatal({ err: handlerError }, 'Error handler threw')
    reply.status(500).send({ error: 'Internal Server Error', code: 'HANDLER_ERROR' })
  }
})
```

## Async Handler Errors

Fastify catches errors thrown from async handlers automatically — no need to wrap in try/catch unless you want to transform the error before it reaches `setErrorHandler`.

```ts
// ✓ throw directly — Fastify forwards to setErrorHandler
app.get('/users/:id', async (request) => {
  const user = await db.findUser(request.params.id)
  if (!user) throw new NotFoundError('User')
  return user
})

// ✗ avoid — wrapping just to rethrow adds noise
app.get('/users/:id', async (request, reply) => {
  try {
    const user = await db.findUser(request.params.id)
    return user
  } catch (err) {
    throw err // pointless wrapper
  }
})
```

Only use try/catch when you're transforming the error (e.g., mapping a DB constraint error to a `ConflictError`).

## Production Safety Checklist

- [ ] `setErrorHandler` registered in `buildServer()`
- [ ] `setNotFoundHandler` registered
- [ ] No `error.stack` in response body
- [ ] 500 errors log full `err` object (for debugging); 4xx logs only code + message
- [ ] Validation errors expose `details` on 400, not on 422/other codes
- [ ] All custom errors defined via `createError` — no raw `new Error()` with HTTP intent
