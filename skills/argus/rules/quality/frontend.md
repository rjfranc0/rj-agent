# Quality — Frontend (React)

Reviewer-angle anti-patterns. Flag these; the fix belongs to the implementer.

## State & Data Flow

- **State lifted beyond its consumers** — context or top-level state for data one subtree reads; every consumer re-renders for unrelated changes
- **Derived state stored** — values computable from existing state/props kept in their own state, inviting desync
- **Server state hand-rolled** — manual fetch + loading flag + error flag + cache where the project already has a data-fetching layer; or three boolean flags encoding what is one state machine (`idle/loading/success/error`)
- **Effects as event handlers** — `useEffect` reacting to a state change that a handler set, instead of the handler doing the work; effect chains where one effect triggers another

## Components

- **Components doing data orchestration and presentation at once** — fetch logic, business rules, and markup in one body with no seams
- **Prop drilling past two levels** for data that is genuinely shared — or its inverse, context for data only one consumer needs
- **Unstable identities** — objects, arrays, callbacks created inline and passed to memoized children or dependency arrays, silently defeating memoization
- **Lists keyed by index** when items reorder, insert, or delete
- **Conditional hooks or hooks in loops** — order instability

## Failure & Edge States

- **Missing loading/empty/error renders** — a component handling only the happy path; the absent states are findings, not polish
- **Cleanup missing** — listeners, timers, subscriptions, in-flight requests not torn down on unmount or dependency change
- **Forms without validation feedback** — errors known to the code but invisible to the user

## Accessibility (reviewable subset)

- Interactive elements that aren't focusable/activatable by keyboard (`div` with `onClick`)
- Images and icon-buttons without accessible names
- Color as the only carrier of meaning
- Focus lost or trapped after dialogs/route changes
