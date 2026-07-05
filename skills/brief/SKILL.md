---
name: brief
description: "Write structured issue drafts in markdown. Use whenever the user wants to create, draft, or write any kind of issue or ticket — feature, bug, chore, style, dependency update, refactor, epic, or milestone. Trigger on: 'write me an issue for', 'create a ticket for', 'draft an issue about', 'I need an issue for', or any description of work that needs capturing as a structured issue. Never ask the user to fill a template — infer the type from intent, draft the issue, state assumptions inline. If publishing is requested, delegate to the platform tool after the draft is complete."
---

# Brief

Write structured issue drafts from whatever the user provides. Infer aggressively. Assist — don't interrogate.

## Interaction model

Take what's given, infer the rest, write. State assumptions inline in the draft — not as pre-flight questions.

**One hard block only:** if the input is so vague the type genuinely cannot be determined, ask one single question. Otherwise, draft immediately.

Never ask the user to fill sections. Never present a blank template. Never run a pre-flight checklist.

## Type inference

Classify by **intent**, not keywords. Reason from the full input — what is the dominant nature of this change?

| Type | Intent |
|---|---|
| `feat` | The system gains a capability it didn't have before |
| `bug` | Something that worked (or should work) is broken or producing unexpected results |
| `chore` | Setup, configuration, tooling, documentation, convention enforcement — no product behavior change |
| `style` | Code formatting, naming conventions, linting rules — no logic change |
| `deps` | Adding, removing, or updating external packages |
| `refactor` | Existing code restructured or migrated — same behavior, different implementation |
| `epic` | Large body of work broken into multiple sub-issues — defines scope and context for child issues |
| `milestone` | Roadmap document grouping phases and epics — defines delivery criteria, not implementation |

**Disambiguation rules:**
- "Add tests for X" → `chore`, not `refactor`
- "Extract X into a package" → always `refactor`
- "Migrate to X" → `refactor` if same behavior; `feat` if new capability is added
- `chore` and `style` share one template — classify as whichever is dominant, state it as an assumption

When two types could apply: pick the dominant intent, state it as an assumption in the draft.

## Title convention

```
type: short imperative title
```

Clean, imperative, specific. No articles, no filler. The user corrects if a project convention differs.

Examples:
- `feat: expense CSV export`
- `bug: transaction total incorrect on empty box`
- `refactor: migrate auth module to better-auth`
- `chore: configure eslint with project rules`
- `epic: phase 2 — backend API integration`

## Writing discipline

**Scope.** Every sentence must serve this issue — defining what to build, a rule that applies, or an in-scope edge case. Cut tangents, "worth noting" asides, and references to unrelated parts of the system. Out-of-scope content goes only in an explicit **Out** list, never scattered as prose. Naming things far outside the issue's context is worse than saying nothing.

**Assumptions.** Only assume what's needed to make the issue coherent. Never fabricate business logic, thresholds, or behavior the user didn't imply. If something is genuinely needed but unknown, mark it `[TBD]` — don't invent it.

**No padding.** Drop optional sections that add nothing. No empty edge-case lists, no "N/A", no filler DoD items. A short honest issue beats a padded one.

**Voice.** Description reads functional — a non-technical collaborator should follow it. DoD items are checkable outcomes ("user can export"), not tasks ("add export button").

## Technical section rule (hard)

For `feat`, `bug`, and `refactor` only — the `## Technical` section is **always a stub**. Fill headers and the warning placeholder only. No content, no suggestions, no "you might want to...". Hard stop.

```md
## Technical

> ⚠ To be filled at sprint planning with codebase context.

### Implementation plan

### [Type-specific test section]
```

Never add content under these headers. Never suggest approaches. Never reference specific files, functions, or libraries in the Technical section.

## Templates

Load the matching template file and fill it from the user's input.

| Type | Template |
|---|---|
| `feat` | `templates/feat.md` |
| `bug` | `templates/bug.md` |
| `chore` / `style` | `templates/chore-style.md` |
| `deps` | `templates/deps.md` |
| `refactor` | `templates/refactor.md` |
| `epic` | `templates/epic.md` |
| `milestone` | `templates/milestone.md` |

## Delegation

When the user asks to publish, post, or create the issue in a tracker:

1. Complete the draft first — always
2. Hand off to the platform tool (Linear MCP, GitHub, etc.) with: title, type label, description markdown, and any metadata the user specified (project, milestone, parent issue for epics)
3. The skill's job ends when the draft is complete — the platform tool takes over

Never call a platform tool mid-draft. Never skip the draft step.
