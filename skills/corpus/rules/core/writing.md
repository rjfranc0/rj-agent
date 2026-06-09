# Core: Writing

Quality standard and writing rules for all doc output.

## The Cognitive Model Standard

A doc file meets the standard when an AI agent reading it can:
- Understand what this part of the system does and why it exists
- Know what would break or change if this component is modified
- Implement a requested change without reading the actual code

Code is never duplicated. The **mental model** of the code is fully captured: behavior, intent, contracts, edge cases, decisions.

## Writing Rules

**Behavior over implementation** — document what a function or module does and why, not how it is written. Never describe syntax.

**Decisions are documented** — why this approach was chosen, what was rejected, what constraint drove it. Undocumented decisions are invisible risks.

**Edge cases are explicit** — not "handles errors gracefully" but "if [condition], returns [result] because [reason]". Vagueness is a gap.

**Contracts are precise** — for any significant function or module: inputs, outputs, invariants, side effects. An agent must know the full contract without opening the file.

**Reference over repeat** — if something is explained elsewhere, link it with context. Never restate content that lives in another file.

**Dense over verbose** — every sentence earns its place. No filler, no padding, no restating the obvious.

**Explicit over implicit** — never assume the reader absorbed context from somewhere else.

**Snippets only when necessary**:
- Complex implementation pattern that cannot be described clearly in prose
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
