# Graceful Shutdown

A graceful shutdown drains in-flight requests and closes connections cleanly before the process exits. Without it, mid-flight requests are cut off and database connections are left open.

## Signal Handlers

Register handlers for both `SIGTERM` (sent by orchestrators/containers on planned stops) and `SIGINT` (Ctrl+C in development):

```ts
// app.ts — after buildServer() and listen()
const shutdown = async (signal: string) => {
  app.log.info({ signal }, 'Shutdown signal received')
  try {
    await app.close()  // stops accepting new connections, drains in-flight requests
    app.log.info('Server closed cleanly')
    process.exit(0)
  } catch (err) {
    app.log.fatal({ err }, 'Error during shutdown')
    process.exit(1)
  }
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
```

## Fastify close() — What It Does

`app.close()` does three things in order:
1. Stops accepting new connections
2. Waits for in-flight requests to complete (up to a timeout)
3. Fires all registered `onClose` hooks (db.disconnect, cache.quit, etc.)

This means resource cleanup belongs in `onClose` hooks — not in the signal handler.

```ts
// In each plugin — cleanup registered where the resource is created
app.addHook('onClose', async () => {
  await db.pool.end()
})

app.addHook('onClose', async () => {
  await redis.quit()
})
```

## Shutdown Timeout

`app.close()` has no built-in timeout. In production, impose one to prevent hanging processes:

```ts
const shutdown = async (signal: string) => {
  app.log.info({ signal }, 'Shutdown signal received')

  const timeout = setTimeout(() => {
    app.log.fatal('Shutdown timed out — forcing exit')
    process.exit(1)
  }, 10_000) // 10s maximum

  try {
    await app.close()
    clearTimeout(timeout)
    process.exit(0)
  } catch (err) {
    app.log.fatal({ err }, 'Error during shutdown')
    clearTimeout(timeout)
    process.exit(1)
  }
}
```

## Health Checks During Draining

If you have a load balancer with health checks, signal unreadiness before closing:

```ts
let isShuttingDown = false

app.get('/health', async (request, reply) => {
  if (isShuttingDown) return reply.code(503).send({ status: 'shutting_down' })
  return { status: 'ok' }
})

const shutdown = async () => {
  isShuttingDown = true
  await new Promise(res => setTimeout(res, 2000)) // allow LB to reroute
  await app.close()
  process.exit(0)
}
```
