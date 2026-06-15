# Rust Core Rules

Always active. Edition 2024 unless the project pins otherwise.

## Ownership & Borrowing

- Prefer `&T` over `.clone()`. Clone only when ownership transfer is genuinely required — never to silence the borrow checker without understanding why it complained.
- Function parameters: `&str` not `&String`, `&[T]` not `&Vec<T>`, `&Path` not `&PathBuf`.
- Small `Copy` types (≤ ~24 bytes, all fields `Copy`) pass by value; derive `Copy` for them.
- Move large data instead of cloning; use `Cow<'_, T>` when ownership is conditional.
- Shared ownership: `Rc<T>` single-thread, `Arc<T>` cross-thread. Interior mutability: `RefCell` single-thread, `Mutex`/`RwLock` cross-thread (`RwLock` only when reads dominate).
- Rely on lifetime elision; annotate lifetimes only where inference fails, and keep them minimal.

## Error Handling

- Fallible operations return `Result<T, E>`. Panics are bugs, not error handling — `panic!`/`assert!` only for broken invariants.
- **`thiserror`** for typed errors on anything crossing a boundary (library APIs, Tauri commands). **`anyhow`** only in binary entry points (`main`, scripts), with `.context()` at every fallible call worth tracing.
- Propagate with `?`. Convert with `#[from]`. No match-chains where `?` does the job.
- **Never `unwrap()` in production code.** `expect()` only for genuine invariants that cannot fail by construction, with a message stating *why* ("regex is static and valid", "mutex not poisoned: no panics hold this lock"). Tests may unwrap freely.
- No silent fallbacks: don't swallow an error into a default value to make output look clean. Surface it.

## Quality Gates

Every task ends with this loop; all must pass:

```bash
cargo fmt --check
cargo clippy --all-targets --all-features -- -D warnings
cargo test
```

- Clippy warnings are failures. To suppress, use `#[expect(clippy::lint_name)]` with a justification comment — never bare `#[allow]`.
- Key lints to respect, not fight: `redundant_clone`, `large_enum_variant` (box variants > ~3x the smallest), `needless_collect`.

## Idioms

- Iterators over manual index loops. No intermediate `.collect()` — chain adapters; collect once at the end, or not at all.
- `.iter()` borrows, `.into_iter()` consumes — pick deliberately, don't default to whichever compiles.
- Let the type system carry invariants: newtypes over bare primitives for domain values; non-empty/validated states encoded in types where cheap.
- Exhaustive `match` over `if let` chains when variants matter; `if let`/`let else` for the single-variant case.
- `String` only when owned data is needed; build with `write!` into a buffer over repeated `format!` in hot paths.

## Naming

- Standard conventions: `snake_case` items, `CamelCase` types, `SCREAMING_SNAKE_CASE` consts. Acronyms are words: `HttpClient`, not `HTTPClient`.
- Method names follow std patterns: `iter`/`iter_mut`/`into_iter`, `as_*` (cheap ref cast), `to_*` (expensive conversion), `into_*` (consuming), `is_`/`has_` (bool getters). Getters have no `get_` prefix.

## Documentation & Comments

- Follow the project's comment behavior rules. Rust-specific additions:
- `///` rustdoc on **public** APIs only, with a usage example where it clarifies. Include `# Errors` and `# Panics` sections when the function can do either.
- `//` comments explain *why* (constraint, workaround, invariant) — never *what*.
- Every `unsafe` block carries a `// SAFETY:` comment (see `rules/unsafe-ffi/RULES.md` — load it the moment `unsafe` enters the picture).

## Project Hygiene

- Respect the existing module structure; organize by feature, not by layer, when creating new modules.
- Workspace-level lints (`[workspace.lints]`) over per-crate duplication in multi-crate repos.
- Pin nothing in libraries; apps may pin. Don't bump unrelated dependency versions.
