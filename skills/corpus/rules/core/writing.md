# Core: Writing

Universal quality standard and protocol. Applies to every domain, every mode.

After loading this file, load `rules/domains/<domain>.md` for each target domain. Domain rules supplement — never override — the universal rules here. If the scope spans multiple domains, load all relevant domain files.

## The Cognitive Model Standard

A doc file meets the standard when an AI agent reading it can:
- Understand what this part of the system does and why it exists
- Know what would break or change if this component is modified
- Implement a requested change without reading the actual code

Code is never duplicated. The **mental model** of the code is fully captured: behavior, intent, contracts, edge cases, decisions.

## Universal Writing Rules

**Reference over repeat** — if something is explained elsewhere, link it with context. Never restate content that lives in another file.

**Dense over verbose** — every sentence earns its place. No filler, no padding, no restating the obvious.

**Explicit over implicit** — never assume the reader absorbed context from somewhere else.

**Snippets only when necessary**:
- Complex pattern that cannot be described clearly in prose
- Unusual or non-standard methodology choice
- Subtle invariant that is hard to express without showing it

If in doubt — no snippet.

## Confidence Flagging

Used whenever the skill infers rather than reads explicit facts.

**Inline** — single inferred claim:
```markdown
> ⚠️ **Inferred:** [what was assumed — verify with original author or codebase]
```

**Section-level** — Bootstrap-heavy sections or reconstructed intent:
```markdown
> 🔍 **Bootstrap note:** Intent reconstructed from code analysis.
> Verified: [what could be confirmed from code]
> Gaps: [what could not be determined without original context]
```

**Confidence levels**:
- No flag — read directly from code or an explicit source
- `⚠️ Inferred` — reasonable reconstruction, moderate confidence
- `🔍 Bootstrap note` — high inference load, needs human verification

## Quality Bar by Mode

| Mode | Bar | Flagging |
|---|---|---|
| Bootstrap | Directionally correct, structurally sound, gaps visible | Heavy — every inference flagged |
| Update | Surgically accurate on affected scope only | Conflicts flagged only |
| Targeted | Full cognitive model standard on narrow scope | Flag what cannot be determined |
| Rewrite | Incremental elevation toward full standard | Mark what improved, flag what remains |
| Audit | Enforces full standard, no compromises, no inferences | Reports gaps, never fills them |
