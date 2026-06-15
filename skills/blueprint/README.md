# blueprint

A skill for filling the `## Technical` stub in a `brief`-generated issue. Takes the issue + full codebase context, surfaces any blockers in one batch, then produces a codebase-aware, agent-executable implementation plan.

## How it works

Give it the issue and project context. It reads both fully, flags architectural decisions or ambiguities in one shot, waits for your response, then drafts the complete `## Technical` section — ready for an agent to execute.

**Hard requirement:** codebase context must be present. Without it, the skill stops and names what's missing.

## What it fills

| Section | When |
|---|---|
| `### Implementation plan` | Always (feat, bug, refactor) |
| `### Automated tests` | feat |
| `### Functional tests` | feat |
| `### Regression tests` | bug |
| `### Key regression tests` | refactor |
| `### Observability` | added on blueprint's judgment — declares *what* must be observable, specialists decide *how* |

## Implementation plan format

Tasks grouped into phases by concern (data layer, business logic, UI, etc.). Each task has:
- Explicit file paths verified against the codebase
- Step-by-step instructions — no interpretation needed
- `[example]` snippets for non-obvious patterns only
- Flat execution queue at the end for agent handoff

## Interaction model

```
read issue + codebase → surface blockers (one batch) → you clarify → draft
```

No back-and-forth. One round of questions max, then done. If nothing is unclear, drafts immediately.

## Where it fits

```
brief → [you review] → blueprint → [you review] → agent executes → [you review]
```

blueprint produces content only — placement and publishing are yours.

## Usage

```
Fill the technical section of this issue
```
```
Blueprint this feature
```
```
Write the implementation plan for this bug fix
```
```
Add technical details to this brief
```
