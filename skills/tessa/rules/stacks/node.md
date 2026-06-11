# Stack: Node.js

## Runner

- **Always prefer the Node.js built-in test runner** (`node:test`, Node 22+): `describe`/`it`, context assertions (`t.assert`), lifecycle hooks (`before`, `after`, `beforeEach`, `afterEach`).
- Fall back to vitest **only** when something is genuinely impossible in the built-in runner — a very rare case. Name the impossibility in the report when you do.
- Run with `node --test`; scope to a file or pattern while iterating; `--experimental-test-coverage` when coverage evidence is requested.

## Mocking

- Use the test context: `t.mock.fn()` for function doubles, `t.mock.method()` for method/global replacement (e.g. `fetch`), `t.mock.timers` for time control. Context mocks restore automatically per test — prefer them over manual patching.
- Assert mock interactions through `mock.calls` only when the call is the contract; otherwise assert outcomes.

## Conventions

- Tests follow the dedicated `tests/` layout from the core rules; map each test file to its source path inside the level folder.
- Async error expectations through `t.assert.rejects` with the expected error shape; sync through `t.assert.throws`.
- Register event listeners **before** triggering the emitting action (`once(emitter, 'event')` first, then act). Emit-before-listen loses the event and produces hangs or intermittent failures.

## Flaky and stuck suites

A test that passes alone but fails or hangs in the full run is a defect in the suite. Diagnose, never tolerate:

- **Identify** the offender: spec reporter to see the hang point, per-test timeouts to get a named failure, then isolate file → test name.
- **Usual causes**, check in order: shared state between tests; race conditions and uncontrolled timing (inject clocks, await conditions); port conflicts (use port 0 / dynamic); unhandled promise rejections; resources not closed in teardown.
- **A run that never exits** means open handles: servers not closed, intervals left running, DB/queue clients not disconnected, workers or watchers alive. Dump active handles (`why-is-node-running` or SIGUSR1 inspection) and fix the leak in the test's own setup/teardown.
- If the leak is in the implementation (e.g. the server offers no close path), that's a **bug for the report**, not something to paper over with `--forceExit`-style escapes.
