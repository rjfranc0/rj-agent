# Stack: Fastify

Extends the Node.js stack rules — same runner policy (built-in first, vitest only on genuine impossibility), same mocking and flaky-suite discipline. These rules add the Fastify-specific layer.

## Never start a real HTTP server in tests

- Use `server.inject({ method, url, payload, headers })` for every route test. Real `listen()` + `fetch` is slow, port-dependent, and flaky by construction.
- `inject` returns the full response: assert `statusCode`, parse with `response.json()`, check headers when they're part of the contract.

## The buildServer pattern

- Tests construct the app through the project's server factory (a `buildServer`/`buildApp` function that registers plugins and routes without listening). Build once per suite in `before`, close in `after`.
- If the project has no such factory and the server only exists behind `listen()`, that's a testability bug — flag it in the report and test as close to the factory shape as the code allows.

## What to prove at the boundary

- Schema validation is part of the route's contract: malformed payloads get the contracted 4xx with the expected error shape; valid payloads pass through with coerced/typed values intact.
- Authenticated routes: inject with the auth header/cookie the real flow produces; prove both the authorized path and the 401/403 rejection.
- Error handling: when the handler's dependency fails, the route answers with the contracted error response — never a leaked stack trace or hung request.
- Plugin encapsulation when relevant: a decorator or hook scoped to a context must not be observable outside it.

## Doubling under the route

- For route-level integration, keep Fastify real (routing, validation, hooks, serialization) and double at the service or repository seam — or keep the database real when the planned behavior is persistence itself.
- Inject doubles through the same mechanism the app uses (decorators, DI options on the factory), not by monkey-patching internals.
