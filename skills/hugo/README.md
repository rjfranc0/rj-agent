# Hugo

Backend development expert for Node.js + Fastify. Covers the full API development stack — from server setup to security to production concerns.

## Role in pipeline

`api-engineer` executor slot. Receives tasks from the orchestrator and produces implementation-ready backend code.

## Domains

### Always loaded

| File | Covers |
|---|---|
| `rules/node/RULES.md` | Type stripping, ESM, async correctness, error classification |
| `rules/fastify/RULES.md` | buildServer factory, Zod type provider, encapsulation, error handler |
| `rules/security/RULES.md` | CORS, helmet, input validation posture, secrets |

### Fastify (lazy)

| File | Covers |
|---|---|
| `authentication.md` | @fastify/jwt, multi-strategy auth, token refresh |
| `logging.md` | Pino config, request.log, redaction, correlation |
| `configuration.md` | Env validation with Zod, config plugin, startup fail-fast |
| `error-handling.md` | setErrorHandler, typed errors, validation shape, safety checklist |
| `openapi.md` | @fastify/swagger, Zod→OpenAPI, tags, spec export |
| `decorators.md` | decorate/decorateRequest/decorateReply, module augmentation |
| `serialization.md` | Response schemas, fast-json-stringify, field stripping |
| `content-type.md` | Body limits, custom parsers, @fastify/multipart |
| `websockets.md` | @fastify/websocket, auth before upgrade, structured messaging |
| `database.md` | DB as plugin, connection validation, transactions, N+1 prevention |
| `http-proxy.md` | @fastify/http-proxy, @fastify/reply-from, header forwarding |

### Node.js (lazy)

| File | Covers |
|---|---|
| `graceful-shutdown.md` | SIGTERM/SIGINT, app.close(), shutdown timeout, health drain |
| `streams.md` | pipeline(), async generators, CSV/ETL pattern, backpressure |
| `caching.md` | lru-cache, async-cache-dedupe, cache plugin pattern |
| `profiling.md` | @platformatic/flame, --cpu-prof, autocannon, common hotspots |
| `stuck-processes.md` | why-is-node-running, open handles, diagnostic sequence |

### Security (lazy)

| File | Covers |
|---|---|
| `rate-limiting.md` | @fastify/rate-limit, per-route overrides, Redis backend |

## Stack assumptions

- **Runtime**: Node.js 22.19+ (type stripping default, no build step)
- **Validation**: Zod + fastify-type-provider-zod
- **Autoload**: @fastify/autoload
- **Logging**: Pino (Fastify built-in)
- **Auth**: @fastify/jwt + @fastify/auth
- **Security**: @fastify/cors + @fastify/helmet

## Out of scope

- Database schema design and migrations → `db-architect`
- Infrastructure, containers, CI/CD → DevOps
- Testing and QA → separate QA skill
- Frontend → `aurora`
