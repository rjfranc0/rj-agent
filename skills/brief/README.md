# brief

A skill for writing structured issue drafts. Takes whatever you give it — a rough idea, a sentence, a detailed brief — infers the type, and produces a clean, ready-to-use issue in markdown.

## How it works

Give it a description of the work. It infers the type, picks the right template, fills it from your input, and states any assumptions inline. No pre-flight questions, no blank templates to fill manually.

**One exception:** if the type is genuinely undetermined, it asks one question.

## Supported types

| Type | When |
|---|---|
| `feat` | New capability or behavior the system doesn't have yet |
| `bug` | Something broken, failing, or producing unexpected results |
| `chore` | Config, tooling, documentation, convention enforcement |
| `style` | Formatting, naming, linting rules — no logic change |
| `deps` | Adding, removing, or updating packages |
| `refactor` | Restructuring or migrating existing code — same behavior |
| `epic` | Large scope broken into sub-issues — defines context for child issues |
| `milestone` | Roadmap grouping phases and epics — delivery criteria only |

## The functional / technical split

Every template has a `## Technical` section stub for `feat`, `bug`, and `refactor`. This skill **never fills it** — that section is reserved for sprint planning with codebase context.

What belongs in the issue (Description):
- What the system should do and why
- Business rules and edge cases
- Light technical decisions already made (tech choices, schema shapes, config bases, project structure)

What never goes in this skill (Technical section):
- Implementation steps
- Which files to change
- How to write the code

## Publishing

When asked to publish or create the issue in a tracker, the skill completes the draft first, then delegates to the platform tool (Linear, GitHub, etc.) with the title, type label, and markdown content. The skill's job ends when the draft is ready.

## Usage examples

```
Write me an issue for adding CSV export to the transaction view
```
```
Bug: balance shows wrong numbers after coming back online
```
```
I need to migrate the auth module to better-auth
```
```
Draft an epic for phase 2 of the fin-app backend integration
```
