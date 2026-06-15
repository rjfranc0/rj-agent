# Motion Rules

## Motion earns its place

Every animation must communicate something or it gets cut.
If you can't articulate what it communicates, remove it.

Valid reasons to animate:
- **Entrance** — content arriving, page loading, element appearing
- **Spatial relationship** — communicating where something came from or is going
- **State change** — something transitioning from one state to another
- **Feedback** — responding to user interaction
- **Atmosphere** — subtle ambient motion that establishes mood (use sparingly)

Not valid: animation because it looks cool in isolation.

## High-impact over scattered

One well-orchestrated page load with staggered reveals creates more delight than ten scattered micro-interactions.
Identify the one moment per section that earns motion. Animate that.

## Performance — non-negotiable

- **Only animate `transform` and `opacity`** — these don't trigger layout recalculation
- Never animate `width`, `height`, `top`, `left`, `margin`, or `padding`
- Apply `will-change: transform` only on complex moving elements, remove post-animation
- Wrap touch-device hover animations in `@media (hover: hover) and (pointer: fine)`
- Always respect `@media (prefers-reduced-motion: reduce)` — wrap heavy animations

## Library: Framer Motion

Default to Framer Motion for React. It handles spring physics, layout animations, and exit animations correctly.

Key patterns:
- `motion.div` with `initial`, `animate`, `exit` for enter/exit
- `variants` for coordinated multi-element animations
- `useInView` for scroll-triggered reveals
- `layout` prop for smooth layout transitions
- `AnimatePresence` for exit animations — required when elements unmount

CSS-only for simple, non-interactive effects (grain overlay, background pulse).
Framer Motion for anything user-interaction-driven or component-lifecycle-driven.

## Hover states

Hover states should surprise — not just scale up.
Think: rotation + slight translate, color shift with blur, reveal of hidden element.
The hover state should feel like a second design moment.
