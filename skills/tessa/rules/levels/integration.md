# Level: Integration

Prove that components work together at a real boundary: route + handler + validation, service + database, producer + consumer. The seam under test is real; only what lies beyond it is doubled.

## What's real, what's doubled

- The boundary under test is always real. Testing a repository against a mocked database client proves nothing — that's a unit test wearing a costume.
- Double third-party externals you don't control (payment providers, external APIs) at the network edge. Double them with contract-shaped responses, including their error and timeout behaviors.
- In-process collaborators between the entry point and the boundary stay real — the wiring is exactly what this level proves.

## Environment discipline

- Use a dedicated, disposable test environment: test database, ephemeral broker, isolated schema. Never point tests at shared or production-like state.
- Known state before every test: seed in setup, clean in teardown. Prefer per-test transactions rolled back, or truncation — never rely on test order to leave data behind.
- Teardown is non-optional and must run on failure too: close connections, stop servers, disconnect clients. Leaked handles are bugs in the suite.
- No fixed ports, no shared temp paths — anything parallel runs will collide on must be dynamic.

## Coverage focus

Per planned behavior at this level, prove:

- The happy path through the full seam — request to persisted/returned effect
- Validation rejects malformed input at the boundary with the contracted status/error shape
- Failure propagation: what the behavior does when the layer beneath fails (connection refused, constraint violation, timeout)
- Data round-trips intact: what goes in is what comes out, including types and encodings

## Assertions

- Assert on observable effects at the boundary: response status and body shape, rows persisted, messages published — not on internal call sequences.
- After a write, read back through the real path to confirm persistence; don't trust the write's return value alone.
- For async flows (queues, events), await the observable effect with a bounded poll or event subscription — never a fixed sleep.
