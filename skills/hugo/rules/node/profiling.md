# Profiling

## CPU Profiling — @platformatic/flame

The fastest path to a flame graph:

```bash
npx @platformatic/flame app.ts
```

Starts your application with CPU profiling enabled. Run your load scenario, then stop — it generates an interactive flame graph HTML file.

For AI-assisted analysis, output as markdown:
```bash
npx @platformatic/flame --output markdown app.ts
```

Paste the markdown into a chat to get hotspot analysis and optimization suggestions.

## Built-in --cpu-prof

For profiling in CI or production-like conditions without interactive tools:

```bash
node --cpu-prof --cpu-prof-dir=./profiles app.ts
```

Generates a `.cpuprofile` file. Open in Chrome DevTools (Performance tab → Load profile) or VS Code's JavaScript Profiler extension.

## Load Testing — autocannon

Reproduce load before profiling — you need realistic throughput to expose real bottlenecks.

```bash
npm install -g autocannon
autocannon -c 100 -d 30 http://localhost:3000/api/users
```

`-c 100` = 100 concurrent connections, `-d 30` = 30 seconds.

For programmatic use:
```ts
import autocannon from 'autocannon'

const result = await autocannon({
  url: 'http://localhost:3000/api/users',
  connections: 100,
  duration: 30,
})
console.log(autocannon.printResult(result))
```

## perf_hooks — Inline Timing

For measuring specific code paths without a full profile:

```ts
import { performance } from 'node:perf_hooks'

const start = performance.now()
await expensiveOperation()
const duration = performance.now() - start
request.log.info({ duration }, 'Operation timing')
```

## Common Hotspots in Fastify Apps

In order of likelihood:

1. **Missing response schema** — falls back to `JSON.stringify` instead of `fast-json-stringify`
2. **Synchronous validation without Zod type provider** — parsing on every request instead of compiled validators
3. **N+1 queries** — check `database.md`
4. **No connection pooling** — creating a new DB connection per request
5. **Unnecessary serialization** — `.toISOString()`, `JSON.parse(JSON.stringify(...))` inside hot paths
6. **Stream backpressure ignored** — not using `pipeline()` for large responses
