# Node.js Core Rules

Always-loaded. Apply to every Node.js file in the project.

## TypeScript — Use Type Stripping

Run TypeScript directly via Node's built-in type stripping. No ts-node, no tsx, no build step.

```bash
# Node 22.6–22.18 (experimental flag required)
node --experimental-strip-types app.ts

# Node 22.19+, 23.6+, 24+ (default, no flag needed)
node app.ts
```

**Type stripping constraints — these are hard requirements:**
- Use `import type` for type-only imports — regular imports of types break stripping
- No enums — use `const` objects with `as const` instead
- No namespaces, no parameter properties
- Use `.ts` extensions in import paths (e.g. `import { foo } from './foo.ts'`)

```ts
// ✗ breaks type stripping
import { User } from './types'       // missing .ts extension
enum Direction { Up, Down }          // enum — not supported

// ✓ correct
import type { User } from './types.ts'
import { foo } from './utils.ts'
const Direction = { Up: 'up', Down: 'down' } as const
```

`tsconfig.json` for type stripping:
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "verbatimModuleSyntax": true,
    "strict": true,
    "noEmit": true
  }
}
```

## Modules — ESM First

Always use ESM (`"type": "module"` in `package.json`). Use the `node:` prefix for built-in modules — it's explicit, avoids name collisions, and signals intent clearly.

```ts
// ✗ ambiguous, could be a package
import { readFile } from 'fs'
import { join } from 'path'

// ✓ unambiguous
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
```

## Async — No Floating Promises

Every async call must be awaited or explicitly handled. Floating promises swallow errors silently — they're bugs waiting to surface in production.

```ts
// ✗ floating promise — error is lost
server.close()
db.disconnect()

// ✓ awaited
await server.close()
await db.disconnect()
```

Set up async error boundaries at process level:
```ts
process.on('unhandledRejection', (reason) => {
  logger.fatal({ reason }, 'Unhandled rejection — exiting')
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  logger.fatal({ err }, 'Uncaught exception — exiting')
  process.exit(1)
})
```

Exit on unhandled rejections — don't swallow them. A crashing process is recoverable; a silent bad state is not.

## Never Throw in Internal Code

Internal code — services, utilities, domain logic — never throws. Errors are return values, not exceptions. This makes failure explicit in the function signature and forces every caller to handle it.

Define a minimal Result type manually:

```ts
// src/types/result.ts
export type Ok<T> = { data: T; error: null }
export type Err<E> = { data: null; error: E }
export type Result<T, E = Error> = Ok<T> | Err<E>

export const ok = <T>(data: T): Ok<T> => ({ data, error: null })
export const err = <E>(error: E): Err<E> => ({ data: null, error })
```

Use it in every function that can fail:

```ts
// ✗ throws — caller has no type-level signal that this can fail
async function getUser(id: string): Promise<User> {
  const user = await db.findById(id)
  if (!user) throw new Error('User not found')
  return user
}

// ✓ returns Result — failure is visible in the signature
async function getUser(id: string): Promise<Result<User, NotFoundError>> {
  const user = await db.findById(id)
  if (!user) return err(new NotFoundError('User'))
  return ok(user)
}
```

The **only** place internal errors become throws is at the Fastify route handler boundary, where `setErrorHandler` is waiting to catch them. See `rules/fastify/error-handling.md` for the boundary pattern.

## Error Classification

Separate operational errors (expected, recoverable) from programmer errors (bugs, should crash):

- **Operational**: invalid input, resource not found, network timeout, DB connection failure — handle and respond appropriately
- **Programmer**: type errors, null dereferences, invariant violations — crash fast, fix the code

Use `@fastify/error` (or `createError` from `@fastify/error`) to define typed HTTP errors. This integrates with Fastify's error handler automatically.

```ts
import createError from '@fastify/error'

export const NotFoundError = createError('NOT_FOUND', '%s not found', 404)
export const ConflictError = createError('CONFLICT', '%s already exists', 409)
export const UnauthorizedError = createError('UNAUTHORIZED', 'Authentication required', 401)
```

## Lazy-Load Pointers

| Need | File |
|---|---|
| Graceful shutdown / signal handling | `rules/node/graceful-shutdown.md` |
| Streams, pipeline, backpressure | `rules/node/streams.md` |
| In-memory caching | `rules/node/caching.md` |
| CPU profiling | `rules/node/profiling.md` |
| Stuck processes / open handles | `rules/node/stuck-processes.md` |
