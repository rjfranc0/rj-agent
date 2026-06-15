# Stack: Rust

## Runner

- **`cargo test`** is the runner — always. Layout is language-mandated and overrides the core `tests/` structure: unit tests in `#[cfg(test)] mod tests` next to the code; integration tests as separate binaries under `tests/`, with shared helpers in `tests/common/mod.rs`.
- Useful invocations: a name pattern to scope (`cargo test name`), `--lib` / `--test <file>` to pick a target, `-- --nocapture` to see output while diagnosing.
- Doc tests count: if the public API carries `# Examples`, they must compile and pass — they're part of the suite.

## In-runner libraries (allowed when the case demands)

- **rstest** for parameterized cases and fixtures — when the same behavior must be proven over a table of inputs; never copy-paste a test body per case.
- **proptest** for invariants and round-trips (encode/decode, sort properties, parser robustness) — when the plan's behavior is a property over an input space rather than fixed examples. Constrain strategies to valid input shapes.
- **mockall** (`#[automock]` on traits) when isolating a unit from a trait-shaped dependency. Expectation counts only when the call is the contract.
- **tokio::test** for async; control time with `tokio::time::pause()`/`advance` — never real sleeps.

## Assertions and errors

- `assert_eq!`/`assert_ne!` over bare `assert!` for diff-bearing failures; message argument when the value alone won't explain a failure.
- Prove `Result` contracts on the error's identity: `matches!` on the variant, message content when contracted — not just `is_err()`.
- Tests may return `Result` and use `?` for clean arrange steps; the assertion itself stays explicit.
- `#[should_panic(expected = "...")]` only when panicking *is* the contract; if the API returns `Result`, test the `Err`.

## Hygiene

- No shared mutable state between tests — `cargo test` runs in parallel by default and must stay parallel-safe. Anything filesystem- or port-shaped gets unique per-test paths/ports.
- Float comparisons through an epsilon, never exact equality.
- When coverage evidence is requested and `cargo-llvm-cov` is available, use it; don't install tooling into the project unasked — report the absence instead.
