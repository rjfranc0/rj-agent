# Stack: React

## Tooling

- **vitest + Testing Library** (`@testing-library/react`) for component and frontend integration tests.
- Simulate interactions with `user-event`, not `fireEvent` — it reproduces real event sequences (focus, keydown, input). `fireEvent` only for low-level events `user-event` can't produce.
- Journeys through the rendered UI across pages belong to the e2e level, not here.

## Query discipline

- Query as the user perceives: by role with accessible name first, then label, then text; `data-testid` as last resort for elements with no accessible identity.
- `getBy*` when the element must exist, `queryBy*` to assert absence, `findBy*`/`waitFor` for async appearance. Never assert absence with `getBy*` in a try/catch.

## Test behavior, not implementation

- Assert what renders and what callbacks receive — never component state, instance internals, or hook return values directly.
- Don't double child components by default; render the real tree. Double at the data edge: API/client layer, or the hook that owns fetching when it is itself tested elsewhere.
- Cover the UI states the component contracts: loading, error, empty, success — each one a planned behavior or an edge case of one.

## Providers and harness

- Wrap renders in the providers the component requires (theme, router, query client, store) through a single shared custom render helper — reuse the project's if it exists, create one under `tests/helpers/` if not.
- Give the harness test-tuned settings (e.g. retries off on query clients) so failures surface instead of retrying into timeouts.

## Async and timers

- Always await `user-event` calls and async appearance queries; an unawaited interaction is a race.
- Use vitest fake timers for debounce/interval behavior; advance time explicitly. Restore real timers in teardown.
- Silence nothing: an `act` warning or unhandled rejection in test output is a real defect in the test or the component — resolve it, or report it if it's the component's.
