# Quality — Rust

Reviewer-angle anti-patterns. Flag these; the fix belongs to the implementer.

## Ownership & Allocation

- **Clone as a borrow-checker silencer** — `.clone()` where a borrow satisfies the call; cloning collections to iterate them; `to_owned()`/`to_string()` to pass where `&str` suffices
- **Early allocation** — building `String`s/`Vec`s eagerly on paths that may not use them (e.g. allocating an error message before knowing there's an error); allocation belongs at the point of need
- **Copy derived on growable types** — `Copy` on structs containing heap data semantics or likely to gain them; conversely, plain small value types missing `Copy` and forcing clone noise

## Errors & Options

- **`unwrap()`/`expect()` outside tests and provably-infallible spots** — every panic path in library/server code is a finding; `?` and explicit handling are the norm
- **Match arms that flatten information** — `match` collapsing distinct error variants into one generic case at a layer that should preserve them; `if let Some(x) ... else` where `match` would force exhaustive thought
- **Stringly-typed errors** — `Result<T, String>` or boxed `dyn Error` in domain code where a typed error enum carries the failure semantics callers need
- **Errors converted too early** — domain errors mapped into transport/display form deep in the call tree, losing the variant before the boundary that needs it

## Idiom & Structure

- **Index loops over iterator chains** — manual `for i in 0..len` with indexing where iterator adapters express the transform; conversely, iterator chains so dense a `for` loop would read better — judge by readability, not dogma
- **Needless `collect()`** — materializing intermediate `Vec`s mid-chain when the iterator could keep flowing
- **`pub` by reflex** — items public without an external consumer; the API surface is a liability to flag
- **Lifetimes/generics beyond need** — explicit lifetimes where elision works, generic parameters with one instantiation

## Comments & Docs

- **TODO as a comment** — untracked TODOs presented as acceptable state; track or resolve
- **Long function + narrator comments** — comments segmenting a function into chapters instead of the chapters being functions
- **Missing `///` on exported items** — public API without doc comments, while private helpers carry boilerplate docs they don't need
