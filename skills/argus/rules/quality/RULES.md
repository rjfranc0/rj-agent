# Quality Lens

Judge code against craft. Maintainability, structure, and the domain logic readability that lets the next session change this code safely.

## Domain Files (Lazy-Loaded)

After this file, load only the domain files matching file types touched in the changeset:

| Touched | Load |
|---|---|
| `.tsx` / `.jsx` / `.css` / component dirs | `frontend.md` |
| `.ts` / `.js` under server/api/service dirs | `backend.md` |
| migrations, `.sql`, ORM schema/models | `db.md` |
| `.rs` | `rust.md` |

Multiple matches → load all matching. No match → universal rules only.

## Principles

1. **Names carry the what** — a name that lies, vagues (`data`, `handle`, `process`), or contradicts its behavior is a finding. Code needing a comment to explain *what* it does has a naming or structure problem.
2. **No silent fallbacks** — swallowed exceptions, broad catches that log-and-continue, defaults masking failure. Surfacing beats smoothing. (Whether the swallowed path violates the *feature* is correctness's question; the swallowing itself is craft.)
3. **Stay in scope** — the diff contains only its task. Drive-by refactors, renames "while in here," and abstractions for hypothetical futures are findings, even when the adjacent code is genuinely bad. One concern per change.
4. **Complexity needs a cause** — indirection, generics, patterns, and config layers are justified by a present requirement, not an imagined one. The simplest thing that works wins; flag cleverness without payoff.
5. **Dead weight goes** — unreachable branches, unused exports, commented-out code, vestigial flags. Version control is the archive.
6. **Comments explain why, never what** — a *what* comment is a finding (fix the name instead); a missing *why* on a non-obvious constraint, workaround, or invariant is also a finding.
7. **Structure mirrors the domain** — modules and functions cut along business concepts, not technical accidents. A function mixing two business concerns, or domain logic leaking into transport/persistence layers, is a finding even when it "works."
8. **Duplication of knowledge, not lines** — two code blocks that look alike but encode different business rules may stay; one business rule encoded in two places must not.
9. **Tests are code** — reviewed for readability, isolation, and whether assertions verify real behavior (a test asserting its own mock is a finding). Never demand coverage targets or test strategy — that's out of scope entirely.
10. **Consistency beats preference** — follow the codebase's established conventions; a finding is deviation from *this* project's style, not from the reviewer's taste.

## Severity Guide

- **blocker** — rare here; reserved for structure so misleading it will cause defects (names asserting the opposite of behavior, error handling hiding data loss)
- **high** — silent fallbacks, knowledge duplication, scope creep with behavioral surface
- **medium** — structural friction: poor cuts, unjustified complexity, misleading names
- **low** — dead code, comment hygiene, convention drift
