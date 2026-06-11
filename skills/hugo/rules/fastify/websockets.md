# WebSockets

## Setup — @fastify/websocket

```bash
npm install @fastify/websocket
```

Register before route plugins:

```ts
import websocket from '@fastify/websocket'
await app.register(websocket)
```

## Route Handler

WebSocket routes use `{ websocket: true }` in the route config. The handler receives `(socket, request)` — not `(request, reply)`.

```ts
app.get('/ws', { websocket: true }, (socket, request) => {
  socket.on('message', (raw) => {
    const message = raw.toString()
    request.log.debug({ message }, 'WS message received')
    socket.send(JSON.stringify({ echo: message }))
  })

  socket.on('close', (code, reason) => {
    request.log.info({ code }, 'WS connection closed')
  })

  socket.on('error', (err) => {
    request.log.error({ err }, 'WS error')
  })
})
```

Always handle `error` — an unhandled WebSocket error event crashes the process.

## Authentication — Validate Before Upgrade

Use a `preValidation` or `preHandler` hook to authenticate before the HTTP→WebSocket upgrade happens. After upgrade, you can no longer send a 401.

```ts
// routes/ws/_hooks.ts — applies to all WS routes in this scope
export default async function wsHooks(app: FastifyInstance) {
  app.addHook('preValidation', async (request, reply) => {
    // Check token from query param (browser WebSocket doesn't support headers)
    const token = (request.query as { token?: string }).token
    if (!token) return reply.code(401).send({ error: 'Unauthorized' })

    try {
      request.user = app.jwt.verify(token)
    } catch {
      return reply.code(401).send({ error: 'Invalid token' })
    }
  })
}
```

## Structured Messaging

For anything beyond a basic echo, define a message protocol and parse JSON explicitly:

```ts
interface WsMessage {
  type: 'subscribe' | 'unsubscribe' | 'ping'
  payload?: unknown
}

socket.on('message', (raw) => {
  let msg: WsMessage
  try {
    msg = JSON.parse(raw.toString())
  } catch {
    socket.send(JSON.stringify({ error: 'Invalid JSON' }))
    return
  }

  switch (msg.type) {
    case 'ping':
      socket.send(JSON.stringify({ type: 'pong' }))
      break
    case 'subscribe':
      // handle subscription
      break
    default:
      socket.send(JSON.stringify({ error: `Unknown type: ${msg.type}` }))
  }
})
```

## Cleanup on Close

If a connection manages subscriptions, timers, or resources, release them on `close`:

```ts
const interval = setInterval(() => socket.send('heartbeat'), 30_000)

socket.on('close', () => {
  clearInterval(interval)
  subscriptions.delete(socket)
})
```
