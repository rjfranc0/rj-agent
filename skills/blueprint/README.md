# blueprint

A skill for filling the `## Technical` stub in a `brief`-generated issue. It decides only what can't be decided by an implementer working alone: decisions with real trade-offs, contracts between concerns, ordered work units, and what must be proven. The *how* stays with whoever implements each unit.

## How it works

Give it the issue and project context. It reads both fully, sorts the gaps (blocking → asked in one batch, reversible → decided and flagged `[assumed]`), then drafts the complete `## Technical` section.

**Hard requirement:** codebase context must be present. Without it, the skill stops and names what's missing.

## What it fills

| Section | When |
|---|---|
| `### Decisions` | Added when at least one decision was locked or assumed |
| `### Contracts` | Added when two or more units share a seam |
| `### Implementation plan` | Always — ordered work units |
| `### Automated tests` + `### Functional tests` | feat |
| `### Regression tests` | bug |
| `### Key regression tests` | refactor |
| `### Observability` | Added when production needs visibility into something |

## Work units

Each unit has a title, one concern tag, an Outcome, Touches (verified paths, context only), and optional Insights. Unit order is execution order.

Concern tags: `data`, `backend`, `frontend:create`, `frontend:redesign`, `frontend:feature`, `rust`, `infra`.

## Contracts

The only fixed part of the output. Written completely in the established standard for their kind, happy path and failure cases, following existing codebase conventions. A missing convention is asked, never invented.

## Interaction model

```
read issue + codebase → sort gaps → one question batch (if blocking) → draft
```

## Where it fits

```
brief → [you review] → blueprint → [you review] → implementation → [you review]
```

blueprint produces content only — placement and publishing are yours.

## Model

Opus at `high`. Use `xhigh` when the issue is vague and leaves most of the design open.

## Usage

```
Fill the technical section of this issue
```
```
Blueprint this feature
```

## Decision log

| # | Decision | Alternatives | Why |
|---|---|---|---|
| D1 | Decide only what can't be decided in isolation; implementers own the *how* | Step-by-step, "no interpretation needed" tasks | 5.5-generation models execute better from intent and constraints than from scripts |
| D2 | Drop tasks, numbered steps, `[example]` snippets, and the execution queue | Keep snippets for non-obvious patterns | Snippets are *how*; implementers read the codebase themselves |
| D3 | Contracts are the only hard-specified, fixed output | Context and outcomes only | Implementers run isolated — seams are the one thing that must be agreed upfront |
| D4 | Contracts follow the established standard for their kind, happy path + failures; no template library | Per-kind templates in a rule file | Standards already exist; listing them is maintenance with no gain |
| D5 | Existing conventions win; a missing convention becomes a question, then a Decision | Let blueprint pick a convention | Conventions outlive the issue — the human sets them |
| D6 | `### Decisions` and `### Contracts` added conditionally, like Observability; `brief` stub untouched | New stub headers in `brief` | Empty headers on single-concern work would be padding |
| D7 | Reversible gaps decided and recorded as `[assumed]` in Decisions | Separate assumptions section / ask everything | One place to review everything decided beyond the issue |
| D8 | Work units: one concern each, ordered, tagged with a station-agnostic concern tag | Phases + tasks | Units carry exactly what routing needs, with no ecosystem knowledge |
| D9 | `frontend:*` tags split create / redesign / feature; no design system → `create` | One `frontend` tag | Design-heavy work and in-system work need different executors |
| D10 | Automated tests become must-hold behavior statements; every contract covered by a `[Cn]` statement; manual sections unchanged | Test case names per module | Test structure is the tester's call; contracts must be proven, not just declared |