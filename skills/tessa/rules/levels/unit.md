# Level: Unit

Prove a single module's contract in isolation. Fast, deterministic, no I/O.

## Structure

- One behavior per test. The test name states the behavior and condition in plain words — readable as a spec line.
- Arrange–Act–Assert, visibly. Setup, the single action under test, then assertions. No assertions inside arrange, no actions inside assert.
- Group by unit then by concern: rendering/computation, interactions/inputs, error paths, edge cases.
- Tests are fully independent: no shared mutable state, no order dependence, fresh state per test. Reset all doubles between tests.

## Test doubles

- Double only what crosses the unit's boundary: external services, repositories, clocks, randomness, network.
- Never double the unit under test or pure helpers it owns — that tests the double, not the code.
- Assert on **outcomes**, not on double call counts, unless the call itself *is* the contract (e.g., "sends exactly one notification").
- Inject time and randomness. A test that depends on the wall clock, timezone, or `random` is flaky by construction.

## Fixtures and factories

- Use factory functions with sensible defaults and partial overrides for any data shape used more than once. Inline literals only for one-off trivial values.
- Reuse the project's existing factories and helpers before creating new ones.
- Fixture values should make assertions obvious — distinctive strings over realistic noise.

## Edge-case expansion

For each behavior, systematically consider and cover where applicable:

- Empty / zero / null / undefined inputs
- Boundary values (off-by-one, min/max, exact limits)
- Invalid types and malformed inputs at validated entry points
- Error paths: every declared failure mode of the contract, asserted on the error's identity (type/code/message), not just "it threw"
- Async outcomes: resolution, rejection, and — when the contract involves timing — cancellation or timeout

Edge cases serve the planned behavior. Don't enumerate every theoretical input for a behavior the plan never asked to prove.

## Verification quality

- A green test must be able to go red: confirm each test fails when the behavior it proves is broken (mentally or by mutation when in doubt).
- Prefer exact-equality assertions over loose truthiness; assert the message when comparing errors.
- Snapshot assertions only for genuinely complex stable outputs — never as a substitute for targeted assertions.
