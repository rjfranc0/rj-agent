# Unsafe & FFI Rules

Loaded when the task involves `unsafe`, FFI, bindgen, or raw pointers.

## When unsafe is allowed at all

Only when the task demands it: FFI, or a measured performance need that safe Rust provably cannot meet (profiling data required — see `rules/perf/RULES.md`). "It's cleaner this way" is never a reason. If a safe alternative exists at acceptable cost, take it and note the trade-off in the report.

## Every unsafe block

- Carries a `// SAFETY:` comment stating the **invariant that makes it sound** — what must be true, and why it is true *here*:
  ```rust
  // SAFETY: `buf` was allocated with capacity `len` two lines above and is
  // never read before this full initialization completes.
  unsafe { buf.set_len(len) };
  ```
  No invariant you can articulate = no unsafe block.
- Is **minimal**: the smallest expression that needs it, never a whole function body wrapped for convenience.
- Is **encapsulated**: wrap unsafe internals in a safe public API whose type signature makes misuse impossible. Callers should never need `unsafe` to use your code. If a function is only sound under caller-upheld conditions, mark *it* `unsafe fn` and document the contract under `# Safety` in its rustdoc.

## FFI specifics

- `#[repr(C)]` on every type crossing the boundary; never assume Rust layout.
- Validate at the boundary: null-check every incoming pointer, length-check every buffer, before constructing references or slices from them. A reference from a null pointer is instant UB.
- Catch panics at `extern "C"` boundaries (`std::panic::catch_unwind`) — unwinding across FFI is UB.
- Ownership across the boundary is explicit and documented: who allocates, who frees, with which allocator. Pair every `into_raw` with exactly one `from_raw`.
- `CString`/`CStr` for C strings; never pass `&str` bytes and hope for a NUL.

## Verification

- State in the report how each `SAFETY:` invariant is protected against future regression (encapsulation, debug asserts, tests).
- Recommend `cargo +nightly miri test` for nontrivial unsafe; run it if the toolchain allows.
- Don't hand-implement `Send`/`Sync` unless the task is precisely that, with the soundness argument written out.
