# Domain: Design

Supplements `writing.md` for documenting design systems, guidelines, and UI patterns.

## Scope

`docs/design/` covers: design tokens, component contracts, interaction patterns, layout rules, and design guidelines. It does not cover implementation of those components — that belongs in `implementation/`.

## What a Complete Design Doc Must Cover

**Tokens**
- Name, value, and semantic purpose (not just the hex — why this color, in what context)
- Usage rules — where it applies, where it explicitly does not
- Relationships to other tokens (e.g. this is derived from that)

**Components**
- Purpose — what problem it solves, when to use it
- Variants and states — every meaningful visual or behavioral state documented
- Props/API contract — inputs, defaults, constraints
- Accessibility requirements — keyboard behavior, ARIA roles, contrast requirements
- Do / don't — explicit misuse cases where relevant

**Interaction Patterns**
- Trigger and response — what causes the behavior, what happens
- Timing and transitions — not implementation values, but the intent (e.g. "fast dismissal, no linger")
- Edge cases — what happens on slow connection, empty state, error state

**Guidelines**
- The rule stated plainly
- The reason behind it
- Counter-examples where the rule is commonly broken

## Writing Rules (Design-Specific)

**Intent over value** — document why a token or pattern exists, not just what it is. `primary-action` explains itself; `#0057FF` does not.

**States are explicit** — never describe a component without covering all meaningful states: default, hover, focus, active, disabled, error, loading, empty.

**Misuse is documented** — design guidelines fail when agents only know the positive case. Include explicit counter-examples for rules that are commonly misread.

**Cross-reference implementation** — when a component has a corresponding implementation, reference it:
> See [@/implementation/ui/button.md] for the code contract this component maps to.

## Reference Directions

| Direction | Meaning |
|---|---|
| `design → functional` | Pattern exists because of this business rule or user flow |
| `design → implementation` | Component maps to this implementation |
| `implementation → design` | Code implements this design contract |
| `functional → design` | Feature requires this design pattern |
