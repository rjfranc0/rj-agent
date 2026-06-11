# Streams

**Activate this file when the task involves:** CSV, ETL, ingestion pipelines, large file processing, backpressure, line-by-line transforms, or binary data pipelines.

## Always Use pipeline()

Use `pipeline()` from `node:stream/promises` — never `.pipe()`. `pipeline()` propagates errors and cleans up all streams in the chain automatically. `.pipe()` leaves upstream streams open if a downstream stream errors.

```ts
import { pipeline } from 'node:stream/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { createGzip } from 'node:zlib'

await pipeline(
  createReadStream('input.txt'),
  createGzip(),
  createWriteStream('output.txt.gz')
)
```

## Async Generators for Transforms

Use `async function*` for transform steps — more readable than Transform streams and composable in `pipeline()`.

```ts
async function* parseLines(source: AsyncIterable<Buffer>): AsyncGenerator<string> {
  let buffer = ''
  for await (const chunk of source) {
    buffer += chunk.toString()
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''   // keep incomplete line for next chunk
    for (const line of lines) yield line
  }
  if (buffer) yield buffer
}

async function* filterEmpty(source: AsyncIterable<string>): AsyncGenerator<string> {
  for await (const line of source) {
    if (line.trim()) yield line
  }
}

await pipeline(
  createReadStream('data.txt'),
  parseLines,
  filterEmpty,
  createWriteStream('cleaned.txt')
)
```

## CSV / ETL Pattern

For ingestion-style pipelines: `createReadStream` → parse transform → enrichment lookup → write.

```ts
import { createCache } from 'async-cache-dedupe'

// Cache enrichment calls — avoids N remote calls for repeated keys
const userCache = createCache({ ttl: 60, storage: { type: 'memory' } })
userCache.define('byId', async (id: string) => fetchUser(id))

async function* enrich(source: AsyncIterable<ParsedRow>): AsyncGenerator<EnrichedRow> {
  for await (const row of source) {
    const user = await userCache.byId(row.userId) // deduplicated
    yield { ...row, userName: user.name }
  }
}

await pipeline(
  createReadStream('import.csv'),
  parseCsvTransform,   // async generator
  enrich,              // async generator with cached lookups
  writeToDb,           // writable
)
```

## Backpressure

`pipeline()` handles backpressure implicitly — it pauses the readable when the writable's internal buffer is full. You don't need to manage this manually when using `pipeline()`.

If writing a custom Writable, respect backpressure:
```ts
const ok = writable.write(chunk)
if (!ok) await once(writable, 'drain') // wait for drain before continuing
```

## Stream Error Handling

Errors propagate through `pipeline()` — one error destroys the entire chain. Catch at the `pipeline()` level:

```ts
try {
  await pipeline(source, transform, destination)
} catch (err) {
  logger.error({ err }, 'Pipeline failed')
  // all streams are already destroyed by pipeline()
}
```
