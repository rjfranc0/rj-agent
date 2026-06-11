# Content Type Parsing

## Built-in Parsers

Fastify parses `application/json` and `text/plain` by default. No configuration needed for these.

## Body Limits

Set a global body size limit. The default is 1MB — adjust based on your use case, but never set it to unlimited in production.

```ts
const app = Fastify({
  logger: true,
  bodyLimit: 1_048_576, // 1MB — explicit, not relying on default
})
```

Override per route for endpoints that legitimately need larger bodies:
```ts
router.post('/import', {
  bodyLimit: 10_485_760, // 10MB for this route only
  schema: { ... },
}, handler)
```

## Custom Content Type Parser

Add parsers for non-default content types:

```ts
// application/x-www-form-urlencoded
app.addContentTypeParser(
  'application/x-www-form-urlencoded',
  { parseAs: 'string' },
  (request, body, done) => {
    const parsed = new URLSearchParams(body as string)
    done(null, Object.fromEntries(parsed))
  }
)

// Raw buffer (e.g., webhook signatures that need the raw body)
app.addContentTypeParser(
  'application/octet-stream',
  { parseAs: 'buffer' },
  (request, body, done) => done(null, body)
)
```

## File Uploads — @fastify/multipart

For `multipart/form-data` (file uploads), use `@fastify/multipart`:

```bash
npm install @fastify/multipart
```

```ts
import multipart from '@fastify/multipart'

await app.register(multipart, {
  limits: {
    fileSize: 5_242_880,  // 5MB per file
    files: 5,             // max 5 files per request
    fields: 10,           // max 10 non-file fields
  },
})

app.post('/upload', async (request, reply) => {
  const data = await request.file()
  if (!data) return reply.code(400).send({ error: 'No file uploaded' })

  const buffer = await data.toBuffer()
  await storage.upload(data.filename, buffer, data.mimetype)

  return { filename: data.filename, size: buffer.length }
})
```

For multiple files:
```ts
app.post('/upload-many', async (request) => {
  const files = request.files()
  const results = []

  for await (const file of files) {
    const buffer = await file.toBuffer()
    await storage.upload(file.filename, buffer, file.mimetype)
    results.push({ filename: file.filename })
  }

  return { uploaded: results }
})
```

## Catch-All Parser

To accept any content type (e.g., passthrough proxy), add a wildcard parser:

```ts
app.addContentTypeParser('*', { parseAs: 'buffer' }, (request, body, done) => {
  done(null, body)
})
```

Only use this for routes where you deliberately want to pass the raw body through. Don't set it globally.
