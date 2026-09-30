# Domain: Implementation

Supplements `writing.md` for documenting application code structure, module behavior, technical decisions, and project conventions.

## Scope

`docs/implementation/` covers: architecture, module structure, service contracts, function behavior, API design, architectural decisions, implementation patterns, and project-wide conventions. It does not cover business rules or user flows — that belongs in `functional/`. It does not cover infrastructure — that belongs in `infra/`.

`implementation/index.md` holds the architecture overview: service boundaries, layer responsibilities, data flow.

## What a Complete Implementation Doc Must Cover

**Module or Service**
- Purpose — what problem this module solves at the code level
- Responsibilities — what it owns, what it explicitly does not own
- Public interface — what other modules interact with and how
- Dependencies — what it relies on and what breaks if those change

**Function or Method Contracts**
- Inputs — types, constraints, valid ranges, what happens with invalid input
- Outputs — return values, shape, guarantees
- Invariants — conditions that must hold before and after
- Side effects — what else changes when this runs (state, DB, external calls)
- Error conditions — every meaningful failure mode and what is returned or thrown

**Architectural Decisions**
- What was chosen and why
- What was rejected and why
- What constraint or context drove the decision
- What changes if that context changes

**Patterns**
- Non-obvious patterns used and why they were chosen
- Where the pattern is applied consistently across the codebase
- What breaks if the pattern is deviated from

## Conventions — `implementation/conventions.md`

One file, always present. The project's conventions, inferred from the codebase — complete enough that the project can be worked on from docs alone, on any machine, without external skills or configs.

- **Naming** — files, folders, functions, variables, domain terms
- **Error handling** — how errors are created, propagated, and surfaced
- **Async** — patterns in use (promises, callbacks, channels…)
- **Code style** — formatting, structure, and style patterns, including what linters and formatters enforce
- **Module boundaries** — import structure, what may depend on what
- **Commit format** — inferred from git history when available

Infer from naming across the codebase, import structure, existing error and async code, config files, and git history. Include everything — don't skip a convention because a tool already enforces it; external configs are not portable.

## Writing Rules (Implementation-Specific)

**Contracts are complete** — a function contract with missing error conditions is an incomplete contract. An agent following an incomplete contract will produce incorrect code.

**Decisions are documented** — the most dangerous implementation docs are those that describe *what* without explaining *why*. An agent that doesn't know why a decision was made will reverse it.

**Error handling is explicit** — not "returns an error on failure" but "throws `PaymentDeclinedError` when the provider returns a 402, `ProviderUnavailableError` on timeout". Vague error docs produce wrong error handling.

**Side effects are never implied** — if a function writes to the database, fires an event, or mutates shared state, it must be stated. An agent cannot infer side effects from a function name.

**Cross-reference functional** — every significant implementation decision traces back to a business rule or constraint. Make that link explicit:
> Implements the rule defined in [@/functional/payments/settlement.md#reconciliation-logic].

## Reference Directions

| Direction | Meaning |
|---|---|
| `implementation → functional` | This code implements this business rule |
| `implementation → implementation` | This module depends on this service or utility |
| `implementation → data` | This code depends on this data contract |
| `implementation → infra` | This code depends on this infrastructure config |
