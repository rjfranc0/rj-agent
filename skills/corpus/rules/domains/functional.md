# Domain: Functional

Supplements `writing.md` for documenting business rules, feature specs, and user flows.

## Scope

`docs/functional/` covers: business rules, feature specifications, user flows, domain logic, and acceptance conditions. It does not cover how any of this is implemented — that belongs in `implementation/`.

## What a Complete Functional Doc Must Cover

**Business Rules**
- The rule stated plainly and completely
- The reason it exists — business constraint, legal requirement, product decision
- Edge cases and exceptions — conditions where the rule applies differently or not at all
- What breaks downstream if the rule is violated

**Features**
- What the feature does from the user's perspective
- The problem it solves and for whom
- Acceptance conditions — explicit, testable, not implied
- Out of scope — what this feature explicitly does not do

**User Flows**
- Trigger — what initiates the flow
- Steps — each meaningful state or decision point
- Outcomes — all possible end states, including error and edge cases
- Preconditions — what must be true for the flow to start

**Domain Language**
- Terms that mean something specific in this domain are defined
- Ambiguous terms are disambiguated — if "account" means two different things in two flows, say so
- Synonyms are consolidated — pick one term per concept, reference others as aliases

## Writing Rules (Functional-Specific)

**Rules are rules, not descriptions** — a business rule must read as a constraint, not a feature summary. "Users must verify their email before placing an order" is a rule. "The system handles email verification" is not.

**Acceptance conditions are explicit** — vague conditions are gaps. Not "the feature works correctly" but "given [state], when [action], then [outcome]".

**Domain language is consistent** — use the same term for the same concept throughout. An agent reading two functional files must not have to guess whether they refer to the same thing.

**Cross-reference implementation and data** — when a business rule has a concrete implementation or data constraint:
> See [@/implementation/orders/validation.md] for how this rule is enforced in code.
> See [@/data/orders.md#constraints] for the data-layer constraint backing this rule.

## Reference Directions

| Direction | Meaning |
|---|---|
| `functional → functional` | This feature depends on this business rule or domain |
| `functional → implementation` | This business rule is implemented here |
| `functional → data` | This rule is enforced or reflected at the data layer |
| `functional → design` | This flow requires this design pattern |
