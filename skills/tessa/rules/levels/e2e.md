# Level: E2E

Prove complete user journeys through the real application stack. The most expensive level — reserve it for what nothing cheaper can prove.

## Journey selection

- Only critical paths: the flows whose breakage means the product is broken (auth, the core transaction, the primary workflow). If the plan marks a behavior as a journey, it qualifies; otherwise justify the level choice in the coverage map.
- One journey per test, end to end, asserting the user-visible outcome at each meaningful step — not just the final screen.
- Don't re-prove logic already covered below. E2E asserts the stack is wired, not that validation rules are exhaustive.

## Tooling

- **Playwright is the default.** Cypress only when a capability genuinely requires it; state the reason in the coverage map when chosen.
- Use the page-object pattern when more than one test touches the same screen: selectors and interactions live in the page object, tests read as journeys. Skip the abstraction for a single throwaway flow.
- Select elements by role, label, or dedicated test id — never by CSS structure or text that copy changes will break.

## Stability rules

- No fixed sleeps, ever. Use the framework's built-in waiting on conditions: element visible, response received, URL changed.
- Each test owns its data: create what it needs (via API or seed hooks, not UI clicking-through), clean up after. Never depend on data another test created.
- Tests must pass in parallel and in any order. Unique identifiers per run (timestamps/suffixes) for anything stored.
- Authenticate via the fast path (API login, storage state) except in the test whose subject *is* the login UI.

## Assertions

- Assert what the user sees and what the system durably did — visible confirmation plus, where the journey's point is a side effect, a back-end check of the effect (via API, not direct DB poking from the e2e suite unless the project already does so).
- On failure, capture the evidence the runner offers (trace, screenshot) and reference it in the report.
