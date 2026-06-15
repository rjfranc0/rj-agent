# Concurrency Rules

Loaded when `tokio`, `async-std`, or `rayon` is in `Cargo.toml`, or the task involves async/parallel work.

**The decision rule that governs everything here**: I/O-bound → tokio. CPU-bound → rayon (or `spawn_blocking` for one-offs). Both in one app → bridge explicitly at the seam. Never run CPU-heavy work inline in an async fn.

## Tokio (async I/O)

- **Never block the async runtime**: no `std::thread::sleep`, no synchronous file/network I/O, no heavy computation inside `async fn`. Blocking one worker starves every task on it.
- Hold no `std::sync::Mutex` guard across an `.await`. If a lock must live across an await, use `tokio::sync::Mutex` — but first try restructuring so it doesn't.
- Concurrency shapes: `tokio::join!` for a fixed set of concurrent futures, `tokio::spawn` for independent tasks (returns `JoinHandle` — don't drop it silently if the result matters), `select!` for races/cancellation.
- Spawned tasks need `Send + 'static`: pass owned data or `Arc`s, not references.
- Channels: `mpsc` for work queues, `oneshot` for single replies, `watch` for latest-value state, `broadcast` for fan-out. Pick by semantics, not habit.
- Cancellation: tokio tasks die when their future drops — use `CancellationToken` or watch-channel checks in long loops; don't rely on the task "noticing".

## Rayon (data parallelism)

- `par_iter()` over manual thread spawning for collection-shaped work. Rayon owns the pool sizing — don't second-guess it.
- Profitable only when per-item work outweighs coordination overhead; trivially cheap per-item loops get *slower*. When in doubt and it matters, measure (see `rules/perf/RULES.md`).
- Don't nest rayon-inside-rayon blindly — inner parallelism on an already-saturated pool adds overhead, not speed.
- Side-effect-free closures; reduce with `map/reduce/fold`, not shared mutable state behind a mutex (that serializes the "parallel" work).

## The Seam (where the bugs live)

CPU-bound work inside an async application:

```rust
// One-off blocking/CPU call inside async context
let result = tokio::task::spawn_blocking(move || heavy_compute(input)).await?;

// Rayon-shaped work bridged back to async via oneshot
async fn parallel_process(items: Vec<Item>) -> Result<Vec<Out>, AppError> {
    let (tx, rx) = tokio::sync::oneshot::channel();
    rayon::spawn(move || {
        let out: Vec<Out> = items.par_iter().map(process).collect();
        let _ = tx.send(out); // receiver dropped = caller cancelled; nothing to do
    });
    rx.await.map_err(|_| AppError::WorkerDied)
}
```

- `spawn_blocking` for occasional calls; the rayon bridge when the work is itself parallel or sustained (the blocking pool is for *waiting*, not for saturating cores).
- Never call `block_on` inside async code or inside a rayon worker that an async task is awaiting — classic deadlock.

## Send/Sync

- Don't hand-implement `Send`/`Sync` — that's `unsafe` territory (`rules/unsafe-ffi/RULES.md`).
- Compiler errors about `Rc`/`RefCell` crossing threads mean the *design* is single-threaded: switch to `Arc`/`Mutex` deliberately, or keep the data on one task and message it.
