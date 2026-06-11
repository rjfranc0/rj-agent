# Stuck Processes

**Activate when:** a Node.js process doesn't exit after the main work is done, `node --test` hangs, CI times out with no error, or "open handles" are reported.

This is a production concern, not just a testing one — the same open handles that prevent test exit can prevent graceful shutdown in production.

## Diagnostic Sequence

Run in order. Stop when you find the culprit.

```bash
# 1. Reproduce with a timeout so it fails loudly
timeout 30s node app.ts || echo "Process did not exit within 30s"

# 2. Identify open handles
node --import why-is-node-running/include app.ts
# In another shell, after the process should have exited:
kill -SIGUSR1 <pid>
# why-is-node-running prints a stack trace for each open handle
```

```bash
npm install --save-dev why-is-node-running
```

## Common Culprits

| Handle type | Typical cause | Fix |
|---|---|---|
| TCP server | `app.close()` not awaited | Await `app.close()` in shutdown handler |
| DB pool | Pool not drained | Call `pool.end()` in `onClose` hook |
| Timer | `setInterval` / `setTimeout` not cleared | Call `clearInterval` / `clearTimeout` on cleanup |
| Redis / cache client | Client not quit | Call `client.quit()` in `onClose` |
| File watcher | `fs.watch` stream not destroyed | Destroy watcher in cleanup |

## Fix Pattern

Fix teardown **in the same scope that created the resource**. Don't add a global cleanup step — fix it at the source.

```ts
// ✗ cleanup added far from where the resource was created
process.on('exit', () => {
  pool.end() // too late — process.on('exit') can't be async
})

// ✓ onClose hook — registered where the resource is created, awaitable
export default fp(async function dbPlugin(app) {
  const pool = new Pool(...)
  app.decorate('db', drizzle(pool))
  app.addHook('onClose', async () => pool.end()) // co-located, properly awaited
})
```

## Verification

After fixing, verify the process exits cleanly under repeated runs:

```bash
for i in {1..20}; do
  timeout 15s node app.ts && echo "Run $i: OK" || echo "Run $i: FAILED"
done
```

A fix that works once but flakes on repeated runs is not a fix — there's still a race condition.
