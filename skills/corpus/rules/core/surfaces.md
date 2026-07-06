# Core: Surfaces

Rules for generating surface artifacts — README files and project description snippets. Loaded by Targeted mode when the output is a surface artifact rather than a doc file.

## README Generation

### Completeness Gate

**Full generation** — blocked unless:
- At least one Rewrite pass completed
- Zero breaking gaps remaining from last Audit
- Inferred flags (`⚠️ Inferred`) are acceptable — missing contracts are not

If gate fails, state why and recommend completing the doc cycle first.

**Rewrite/refactor** — no completeness gate. Existing README is the primary source, docs supplement and correct.

### README Types

**`library`** — API-focused, developer audience
- What it does and why to use it
- Installation
- Full API reference — every public method, inputs, outputs, examples
- Common usage patterns
- Known limitations

**`internal-tool`** — team-facing
- What problem it solves and for whom
- How to set it up
- How to use it — key actions, commands, workflows
- Who to contact / where to contribute

**`app`** — project presentation, broadest type
- Functional overview — what it does, for whom
- Technical overview — key architectural choices worth knowing
- How to start / dev / build / test
- Good-to-know notes — non-obvious decisions, known constraints

**`infra`** — IaC and ops tooling
- What infrastructure it manages
- Technical overview — tools, providers, structure
- How to apply / plan / destroy
- Environment differences
- Good-to-know notes — non-obvious decisions, runbook pointers

**`cli`** — command reference focused
- What it does
- Installation
- Command reference — every command, flags, defaults
- Usage examples — common and non-obvious cases

**`monorepo`** — workspace overview
- What the monorepo contains and why it is structured this way
- Each package's role and how they relate
- How to work across packages — dev, build, test at workspace level
- Dependency and release model

### Type Detection

Infer from project structure if not specified. Confirm before writing:
> "This looks like a `[type]` README — confirm?"

### Audit Integration

README is part of the corpus audit. Checked for:
- Accuracy against current docs
- Stale instructions (commands, paths, versions)
- Missing sections for its type
- Content that belongs in docs instead

---

## Description Snippets

No completeness gate — corpus always has enough to produce a description.

### Length Rule

| Output | Behavior |
|---|---|
| Small (one-liner to a few sentences) | Generate directly, no clarification |
| Large (paragraph+) | Ask for destination if not specified |

### Format by Destination

| Destination | Length | Tone | Notes |
|---|---|---|---|
| GitHub repo description | 1 sentence, ~160 chars | Neutral, informative | No markdown |
| `package.json` description | 1 sentence | Technical, concise | No markdown |
| npm / crates.io / PyPI | 1–2 sentences | Developer-facing | No markdown |
| Linear project subtitle | 1 short sentence | Internal, direct | No markdown |
| Linear project description | 2–4 sentences | Internal, functional | Light markdown ok |
| Pitch / presentation | 1 paragraph | Accessible, outcome-focused | No jargon |
| README tagline | 1 punchy sentence | Engaging | Markdown ok |

If destination is not in this list — user specifies length and tone, corpus formats accordingly.
