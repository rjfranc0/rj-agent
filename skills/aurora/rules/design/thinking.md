# Design Thinking

## The Two Axes

Every design decision is shaped by two semi-independent axes:

**Creativity** — how expressive, unexpected, and distinctive the design is
**Functionality** — how strict the UX conventions and interface legibility need to be

They are not opposites. High creativity does not mean low functionality.
Calibrate each independently based on context signals.

## Reading Context Signals

Before calibrating, read the issue for:
- **UI type** — portfolio, landing page, SaaS app, dashboard, tool, form, component
- **Audience** — end users, developers, clients, general public
- **UX stakes** — is confusion costly? Does the user need to act fast?
- **Explicit constraints** — brand guidelines, existing system, strict requirements
- **Freedom signals** — "make it interesting", "fresh take", "no constraints"

## Calibration by Context

Responsiveness is a project-level decision — check project docs first, then the issue. If neither specifies, use the default below and confirm before proceeding.

| Context | Creativity | Functionality | Responsiveness | Notes |
|---------|-----------|---------------|----------------|-------|
| Portfolio / personal site | Max | Low–medium | Mobile-first | Full creative freedom, UX matters but isn't primary |
| Marketing / landing page | High | Medium | Mobile-first | Creative but must convert |
| SaaS product UI | High | High | Mobile-first | Figma-level: original and functional |
| Dashboard / data tool | Medium | Max | Desktop-first | Creativity in composition, not at the cost of clarity |
| Component (reusable) | Medium | High | Fully responsive | Must work in any context it's placed in |
| Form / utility UI | Low–medium | Max | Mobile-first | Clarity above all, small creative moments acceptable |

When context is ambiguous on creativity/functionality, bias toward higher functionality. Creativity that creates confusion is a failed design.

**Responsiveness strategies and what they imply:**

- **Mobile-first** — design starts at mobile, Tailwind base styles target small screens, `md:`/`lg:` progressively enhance. Layout, navigation, and hierarchy decisions all start from the smallest viewport.
- **Desktop-first** — design starts at large viewport, mobile is adapted. Suits complex data layouts and dense tooling.
- **Fully responsive** — no primary viewport, fluid at all sizes. For reusable components with no control over where they're placed.
- **Mobile-only** — desktop is not a target. Rare and always explicit.

**When inferring:** state the assumption in the design declaration and confirm before proceeding — responsiveness strategy shapes layout decisions upstream of everything else.

## Direction Mode Inference

**Mode 1 — Declare and execute:**
- UI type is clear from the issue
- Functional constraints are explicit
- Brief provides enough context to commit confidently
- Default for most cases

**Mode 2 — Present options, wait for choice:**
- Issue uses language like "something fresh", "explore", "up to you"
- No clear aesthetic direction given, significant creative freedom
- Multiple valid directions exist with meaningfully different outcomes
- Present 2–3 options as brief declarations (not implementations), wait for one to be chosen

**Mode 3 — Implement multiple branches:**
- Explicitly requested ("show me both", "build two versions")
- Never inferred — always requires an explicit ask

## Committing to a Direction

Once calibrated, commit fully. Don't soften the direction with fallbacks.
Bold minimalism should be actually minimal. Maximalism should be actually maximal.
The differentiation is in execution, not intensity — but execute the vision you declared.

One thing the visitor will remember. Define it before writing a single line.
