---
name: blueprint
description: "Fill the ## Technical stub in a brief-generated issue with a codebase-aware, agent-executable implementation plan. Use after `brief` has produced a feat, bug, or refactor issue draft that has an empty ## Technical section. Triggers on: 'fill the technical section', 'write the implementation plan', 'blueprint this issue', 'add technical details to this issue', 'write the plan for this issue', or when an issue has an empty ## Technical stub and codebase context is available. Requires full project codebase access — do not use without it."
---

# Blueprint

Fill the `## Technical` stub in a `brief`-generated issue with a codebase-aware, agent-executable implementation plan.

This is a technical partner, not a redactor. It reads the full issue and codebase, synthesizes independently, surfaces critical questions in one shot, then drafts.

## Prerequisites

This skill requires:
- A `brief`-generated issue with an empty `## Technical` section (`feat`, `bug`, or `refactor` type only)
- Full codebase context — relevant files, structure, modules, existing patterns

**If codebase context is missing or insufficient: stop and say so explicitly before doing anything else.** Do not attempt to draft without it. Name specifically what's missing.

## Interaction model

**One-pass understanding. One-batch questions. One draft.**

1. **Read** — absorb the full issue and codebase context
2. **Identify** — find all blockers: ambiguities, architectural decisions, missing context
3. **Ask once** — surface everything in a single structured block (see format below)
4. **Draft** — after the user responds, produce the complete `## Technical` content

No slow back-and-forth. No one-question-at-a-time. No interrogation. If nothing is unclear — skip step 3 and draft immediately.

## Pre-draft question format

When clarification is needed, present it as a single structured block:

```
**Before drafting, I need to clarify:**

**Architectural decisions:**
- [Decision]: [Option A] vs [Option B] — [why it materially affects the plan]

**Ambiguities:**
- [What's unclear in the issue or codebase, and how it blocks the plan]

**Missing context:**
- [Specific file, module, or pattern not visible in the provided context]
```

User responds once. Draft immediately after — no follow-up rounds.

## Output: `## Technical`

Fill exactly the sections present in the issue's `## Technical` stub. Never add or remove sections.

### `### Implementation plan`

Group tasks into phases by concern. Use only phases that apply — don't force structure.

Typical phases: Setup / Data layer / Business logic / API or routing / UI / Integration / Tests

**Phase format:**

```
#### Phase N — [Concern]

**Task N.N — [Short imperative title]**
Files: `path/to/file.ts`, `path/to/other.ts`
1. [Concrete step — specific enough to execute without interpretation]
2. [Next step]
3. ...
[example] `minimal snippet showing the non-obvious pattern or API shape`
```

**Task rules:**
- One task = one coherent unit of work (one file group, one concern)
- File paths must be explicit and verified against codebase context — never invent paths
- For new files that must be created: derive the path from existing project conventions, prefix with `[new]` — e.g. `[new] src/utils/export.ts`
- Steps are instructions, not suggestions: "Add X to Y", not "Consider adding X"
- `[example]` snippets only when: the pattern is non-standard, the API is subtle, or wrong implementation is likely. Never for CRUD, standard lib usage, or anything a competent dev writes from memory. Snippets show the **shape** of the pattern — pseudocode-level, with placeholder names. Not copy-paste-ready code; the agent adapts them to the actual types, names, and conventions in the codebase
- Never make an architectural decision unilaterally — surface it in the pre-draft block

End the implementation plan with a flat execution queue:

```
**Execution order**
1. Task 1.1 — [title]
2. Task 1.2 — [title]
...
N. Done — [one sentence describing the shipped result]
```

### Test sections

Fill based on issue type — match exactly what's in the stub:

| Issue type | Sections to fill |
|---|---|
| `feat` | `### Automated tests` + `### Functional tests` |
| `bug` | `### Regression tests` |
| `refactor` | `### Key regression tests` |

**`### Automated tests` (feat only):**
New automated tests to write. Test case names with intent, inferred from implementation tasks. No code stubs, no assertions.

```
- `[module or component]`: [behavior] when [condition]
- `[module or component]`: [behavior] given [state]
```

**`### Functional tests` (feat only):**
Manual verification steps. Specific user flows, not abstract test categories.

```
- [User action] → [expected result]
```

**`### Regression tests` (bug) and `### Key regression tests` (refactor):**
These are primarily manual — steps to verify the fix holds or existing behavior is preserved. If the bug warrants a new automated test, add it as a single line before the manual steps, prefixed with `[new test]`.

```
[new test] `[module]`: [bug scenario] no longer reproduces when [condition]  ← only if warranted

Manual:
- [Action to verify the fix or check for regressions] → [expected result]
- [Edge case or related behavior to spot-check] → [expected result]
```

## Output rules

- Output content only — no preamble, no "here's your plan", no closing summary
- Start directly with `### Implementation plan`
- Never reference files that don't exist in the provided codebase context
- Never fill sections absent from the original stub
- Never suggest refactors or improvements outside the issue scope

## Delegation

When the user asks to update, push, or sync the issue in a tracker (Linear, GitHub, etc.):

1. Complete the draft first — always
2. Hand off to the platform tool with the filled `## Technical` content and the issue identifier
3. The skill's job ends when the draft is ready — the platform tool handles the update

Never call a platform tool before the draft is complete.
