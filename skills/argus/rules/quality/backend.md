# Quality — Backend (Node)

Reviewer-angle anti-patterns. Flag these; the fix belongs to the implementer.

## Boundaries

- **Validation missing at the edge** — request bodies, params, queries, and external responses consumed without schema validation at the boundary; types asserted (`as`) rather than verified
- **Domain logic in route handlers** — business rules living in the transport layer, untestable without HTTP; handlers should orchestrate, not decide
- **Persistence leaking upward** — ORM entities or raw rows crossing into domain/transport layers instead of mapped shapes; query details dictating business interfaces

## Errors

- **Throw-as-flow-control inside domain logic** — expected failures (not-found, validation, conflict) modeled as exceptions deep in the call tree instead of explicit return values; exceptions reserved for the truly exceptional
- **Errors flattened at the boundary** — distinct failure modes collapsing into one generic 500; status codes and error bodies should map failure semantics
- **Catch-log-continue** — recovery code that doesn't actually recover, leaving the operation half-done in a corrupted state
- **Internal details in error responses** — stack traces, query fragments, file paths reaching the client

## Async & Lifecycle

- **Floating promises** — async calls without await/return/explicit handling; rejections that escape to the process level
- **Sequential awaits on independent work** — `await a; await b;` where `a` and `b` don't depend on each other
- **Resources without lifecycle** — connections, handles, watchers opened without close paths on error and shutdown; missing graceful-shutdown participation

## Structure

- **Config read at call sites** — `process.env` scattered through logic instead of validated once at startup into a typed config
- **Logging as printf** — unstructured strings where the project logs structured; missing correlation/request ids on request-path logs; secrets or full payloads logged
- **Module-level mutable state** in request-handling code — hidden coupling between requests
