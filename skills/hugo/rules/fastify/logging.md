# Logging

Fastify uses [Pino](https://getpino.io/) as its built-in logger. Fast, structured, JSON output — no setup required beyond enabling it.

## Enable at Server Creation

```ts
const app = Fastify({
  logger: {
    level: process.env.LOG_LEVEL ?? 'info',
    // In development, pretty-print; in production, raw JSON
    ...(process.env.NODE_ENV !== 'production' && {
      transport: {
        target: 'pino-pretty',
        options: { colorize: true, translateTime: 'HH:MM:ss' },
      },
    }),
  },
})
```

Never disable logging in production. `logger: false` is only acceptable in test environments.

## Use request.log — Not a Module-Level Logger

Inside handlers and hooks, always use `request.log`. It automatically includes the request ID, enabling log correlation across a full request lifecycle.

```ts
// ✗ module-level logger — no request correlation
import pino from 'pino'
const logger = pino()

app.get('/users', async (request) => {
  logger.info('Fetching users') // no request ID in this log
})

// ✓ request.log — correlated automatically
app.get('/users', async (request) => {
  request.log.info('Fetching users') // includes reqId
})
```

For application-level events outside a request (startup, shutdown, background jobs), use `app.log`.

## Log Levels

Use the right level — don't emit everything as `info`:

| Level | When |
|---|---|
| `trace` | Per-item detail in tight loops — off in production |
| `debug` | Diagnostic detail useful during development |
| `info` | Normal application lifecycle events |
| `warn` | Recoverable unexpected conditions |
| `error` | Failures that need investigation |
| `fatal` | Unrecoverable — process is about to exit |

## Structured Logging

Pass an object as the first argument, a message as the second. This keeps logs machine-parseable.

```ts
// ✗ concatenation — hard to query
request.log.info(`User ${userId} updated profile`)

// ✓ structured — queryable fields
request.log.info({ userId, action: 'profile_update' }, 'User updated profile')
```

## Redaction — Hide Sensitive Fields

Configure `redact` to prevent secrets from appearing in logs:

```ts
const app = Fastify({
  logger: {
    level: 'info',
    redact: {
      paths: ['req.headers.authorization', 'body.password', 'body.token'],
      censor: '[REDACTED]',
    },
  },
})
```

Redact at the logger level — not in the application code. Manual deletion before logging is easy to miss.

## Request ID Customization

By default, Fastify uses an auto-incrementing integer for `reqId`. For distributed tracing, use a UUID or forward the incoming trace header:

```ts
const app = Fastify({
  logger: true,
  genReqId: (req) => req.headers['x-request-id'] as string ?? crypto.randomUUID(),
  requestIdHeader: 'x-request-id',
  requestIdLogLabel: 'requestId',
})
```

This propagates the same ID across upstream and downstream logs.

## Child Loggers

For domain-specific context, create a child logger. Child loggers inherit the parent's level and serializers and add a fixed context to every message:

```ts
const serviceLog = request.log.child({ service: 'payment', orderId: order.id })
serviceLog.info('Processing payment')
serviceLog.error({ err }, 'Payment failed')
```
