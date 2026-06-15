# Coding — Non-Negotiables

These apply to every output, every context, no exceptions.

## Never define components inside components

Inline component definitions create a new type on every render.
React remounts them fully — destroying state, re-running effects, resetting DOM.
Always define components at module level and pass props explicitly.

## Ternary over && for conditional rendering

`&&` renders `0` or `NaN` when the left side evaluates to them.
Always use explicit ternary: `condition ? <Component /> : null`

## SSR-safe by default

Never access `window`, `document`, or browser APIs at module level or during render.
Guard with `typeof window !== 'undefined'` or move into `useEffect`.
Server-side rendering must never throw on missing browser globals.

## TypeScript-first

All component props are typed — no implicit `any`.
Prefer explicit interface or type declarations over inline object types for reusable shapes.

## No fabrication

No made-up package names, APIs, component names, or function signatures.
If unsure whether something exists, say so — don't invent it.

## No silent failures

Surface errors. Don't swallow them to make output look clean.
An error state in a component is a design decision — handle it explicitly.

## Stay in scope

The issue defines your scope. Don't refactor adjacent code, rename while you're in there, or add abstractions for hypothetical future needs.
