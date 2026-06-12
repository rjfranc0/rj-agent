# ferran

Rust & Tauri systems specialist executor. *Blacksmith, iron* — iron oxidizes into rust.

A self-contained developer skill: give it a task in a Rust codebase — fully specified or rough — and it implements production-grade code, validates with the full cargo loop, and reports back, explaining any non-obvious idioms along the way. Workflow-unaware by design: it doesn't know or care what hands it the task. Graduated autonomy: follows what's specified, decides what's missing (flagged + justified, architecture included), and batches questions in one block only for genuinely blocking, costly-to-reverse calls.

## Structure

```
ferran/
├── SKILL.md                      # identity, loading table, workflow, boundaries
└── rules/
    ├── rust/RULES.md             # always-on core
    ├── tauri/RULES.md            # src-tauri detected
    ├── tauri/ipc-patterns.md     # lazy: events/channels/streaming/state
    ├── concurrency/RULES.md      # tokio/rayon detected
    ├── unsafe-ffi/RULES.md       # task involves unsafe/FFI
    └── perf/RULES.md             # task targets performance
```

## Scope

| Does | Doesn't |
|---|---|
| Rust: CLIs, daemons, libraries, Tauri v2 apps | Frontend logic, components, UI state |
| `#[tauri::command]` + typed TS invoke wrappers | Frontend `invoke` refactors (flags raw calls, doesn't fix) |
| Inline `#[cfg(test)]` unit tests + doctests | Integration tests (`tests/`), e2e |
| Running the validation loop + the feature itself | CI configs, Dockerfiles, deployment |

## Decision log

| # | Decision | Alternatives rejected | Why |
|---|---|---|---|
| D1 | Executor posture; idiom explanations in the report | Teacher mode | Learning happens in human review; code stays production-grade |
| D2 | Rust-first; Tauri as lazy-loaded domain | Tauri-app skill that writes Rust | Covers pure-Rust targets; no token waste on non-Tauri tasks |
| D3 | Ferran owns both sides of the IPC binding (command + TS wrapper); frontend consumes wrappers only | Frontend skill writes bindings from the contract | Serde-boundary bugs live on the Rust side; one owner per contract surface, zero drift |
| D4 | Test split by file ownership: inline unit/doctests = ferran; `tests/` + e2e = elsewhere | Ferran writes all Rust tests / ferran writes none | Rust unit tests live inside source files; one owner per file |
| D5 | thiserror at boundaries, anyhow in binaries; no unwrap; panics are bugs | anyhow everywhere | Tauri commands need typed serializable errors; typed errors make error contracts enforceable |
| D6 | Full gates: `fmt --check`, `clippy -D warnings`, `test`; `#[expect]` over `#[allow]`; SAFETY comments mandatory | Relaxed clippy while learning | Friction is the learning channel; relaxing invites drift |
| D7 | Single `concurrency/` domain: tokio + rayon + the seam | Separate async/ and parallel/ domains | The danger is where they meet; splitting hides exactly that knowledge |
| D8 | Synthesized from four inspiration skills at authoring time | Runtime references to them | Skills are inspirations, not runtime dependencies |
| D9 | Workflow-unaware: no pipeline/orchestrator references | Pipeline-aware boundaries | Skills are independent stations; the human is the runtime |
| D10 | Graduated autonomy: specified → follow; missing → decide, flag, justify; blocking → one batched question round | "Missing contract = blocker" | An independent station must work without a perfect upstream spec; visible decisions beat stalls |

## Sources synthesized

`tauri-v2` (backbone of the tauri domain) · `rust-skills` (179 rules, CRITICAL tiers distilled into core) · `rust-best-practices` (Apollo — judgment calls: dispatch, type-state, error split) · `rust-engineer` (validation loop, SAFETY discipline).
