# Performance Lens

Judge code against resources. Readability beats performance by default — a performance finding must carry a **cost story**: who pays, when, and how it grows.

## The Cost Story Rule

Every finding states its cost at *plausible* load for this codebase: "at 1k users this endpoint issues 1k+1 queries per page load." No cost story → not a finding. Micro-optimizations (shaving allocations in cold paths, clever bitwise tricks, premature caching) are never findings; if anything, flag them under quality as complexity without cause.

## Principles

1. **Work scales with input, response shouldn't** — N+1 queries, per-item network calls in loops, O(n²) over unbounded collections. The default suspicion for any loop containing I/O.
2. **Unbounded is a bug** — queries without limits, lists without pagination, caches without eviction, queues without backpressure, file reads without size guards. Anything that grows with data volume and has no ceiling.
3. **Don't block the loop** — synchronous I/O, CPU-heavy work, or unbatched large JSON parsing on an event loop or UI thread. One slow request must not stall its neighbors.
4. **Memory must come back** — listeners without removal, timers without cancellation, subscriptions without cleanup, closures capturing large structures beyond their need, accumulating module-level state.
5. **I/O is the budget** — chatty sequential calls that could batch or parallelize, payloads carrying fields nobody reads, missing compression or caching headers on hot static responses, repeated fetches of immutable data.
6. **Render proportionally** — UI re-renders scoped to what changed: unstable references passed as props, state lifted higher than its consumers, lists re-rendering wholesale on item change, layout thrash from interleaved reads/writes. Web vitals framing applies: anything delaying first meaningful paint or shifting layout after load.
7. **Hot paths earn scrutiny, cold paths earn simplicity** — judge severity by path temperature: startup code and admin endpoints tolerate waste that request-path code cannot.

## Severity Guide

- **blocker** — degrades under normal expected load (not just spikes): unbounded query on a growing table in a request path
- **high** — clear superlinear cost on a hot path, or a leak that accumulates in normal operation
- **medium** — measurable waste with a real cost story, but bounded or on a warm path
- **low** — cheap win with a concrete benefit; still requires the cost story
