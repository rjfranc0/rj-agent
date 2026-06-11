# HTTP Proxy

## @fastify/http-proxy — Simple Passthrough

For straightforward reverse proxy use (all traffic on a prefix forwarded upstream):

```bash
npm install @fastify/http-proxy
```

```ts
import httpProxy from '@fastify/http-proxy'

// Proxy /api/* → http://backend:3001/v1/*
await app.register(httpProxy, {
  upstream: 'http://backend:3001',
  prefix: '/api',
  rewritePrefix: '/v1',
})
```

Apply auth before proxying:
```ts
await app.register(httpProxy, {
  upstream: 'http://internal-api:3002',
  prefix: '/internal',
  preHandler: [app.authenticate],
})
```

## @fastify/reply-from — Fine-Grained Control

For selective proxying or request/response manipulation, use `@fastify/reply-from`:

```bash
npm install @fastify/reply-from
```

```ts
import replyFrom from '@fastify/reply-from'

await app.register(replyFrom, {
  base: 'http://backend:3001',
})

// Proxy a specific route, adding a header
app.get('/users/:id', {
  preHandler: [app.authenticate],
}, async (request, reply) => {
  return reply.from(`/users/${request.params.id}`, {
    rewriteRequestHeaders: (req, headers) => ({
      ...headers,
      'x-forwarded-user': request.user.id,
      'x-request-id': request.id,
    }),
  })
})
```

## Forward Request Correlation Headers

Always propagate tracing headers when proxying. Losing them breaks distributed tracing.

```ts
rewriteRequestHeaders: (req, headers) => ({
  ...headers,
  'x-request-id': req.id,
  'x-forwarded-for': req.ip,
  'x-forwarded-host': req.hostname,
})
```

## Timeout Configuration

Set upstream timeouts — never let a slow upstream hold a connection indefinitely:

```ts
await app.register(replyFrom, {
  base: 'http://backend:3001',
  undici: {
    connections: 100,
    pipelining: 1,
    connectTimeout: 2000,   // 2s to establish connection
    headersTimeout: 5000,   // 5s to receive response headers
    bodyTimeout: 10000,     // 10s to receive full body
  },
})
```
