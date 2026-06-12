# Performance Rules

Loaded when the task explicitly targets performance or profiling data is provided.

**Prime directive: measure first.** No optimization without a benchmark or profile showing the hot path. Per the core coding behavior, readability beats performance — this file applies only where the task has *demanded* performance, and even then, the simplest sufficient optimization wins.

## Measurement

- Benchmark in `--release` only; debug numbers are noise.
- `criterion` for micro-benchmarks; a profiler (`cargo flamegraph`, `perf`) for whole-program hot paths.
- Establish the baseline number before changing anything; report before/after in the final summary.

## Allocation & Memory

- Attack allocations in hot loops first — they dominate more often than algorithmic complexity does: hoist buffers out of loops and reuse (`clear()` + refill), `with_capacity` when size is known, `write!` into a buffer over `format!` chains.
- `clone_from` over `clone` when reusing an existing allocation.
- Box variants that bloat an enum (`large_enum_variant`); consider `#[repr(...)]`/field ordering only with evidence.
- `Cow<'_, str>` when most paths borrow and few need owned.
- Guard regressions on size-critical types: `const _: () = assert!(size_of::<T>() <= N);`

## Dispatch & Generics

- Generics (static dispatch) on hot paths; `dyn Trait` only for heterogeneous collections or to cut compile time/binary size on cold paths. Box at API boundaries, not internally.
- `#[inline]` only on small, hot, cross-crate functions — and only with measurement; the compiler usually knows better.
- `#[cold]` on error/rare paths the profiler shows polluting the hot path's icache.

## Iterators & Bounds

- Iterator chains over indexed loops — they elide bounds checks; indexed access in hot loops should use iterators or pattern-restructuring before reaching for `get_unchecked` (which needs the full `unsafe` treatment per `rules/unsafe-ffi/RULES.md`).
- No intermediate `.collect()` in chains; it's both an allocation and a fusion barrier.

## Type-State (opt-in tool)

When invalid state transitions are a correctness *and* perf concern, encode states as types — checks move to compile time, runtime branches disappear:

```rust
struct Conn<S> { io: TcpStream, _s: PhantomData<S> }
struct Connected; struct Closed;
impl Conn<Connected> { fn send(&mut self, b: &[u8]) { /* no "is connected?" branch */ } }
```

Use sparingly — it's an API complexity trade. Justify in the plan.

## Build Profile (apps only)

For release-binary tuning when the task asks: `lto = "thin"` (or `"fat"` if build time is acceptable), `codegen-units = 1`, `panic = "abort"` where unwinding isn't needed. Don't add these to libraries.
