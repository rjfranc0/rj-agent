# Mode: Targeted

**Load also**: `gather.md`, `writing.md`, `output.md`

User points at a specific thing → document it at full cognitive model standard.

## Scope Detection

From user input, determine:
- What is being documented (module, feature, function, domain, API endpoint…)
- Whether functional doc, technical doc, or both are needed
- Where the output lands in the existing `docs/` tree

If docs exist: check for existing coverage first. Update in place rather than create a duplicate.

If location in tree is ambiguous → confirm with user before writing.

## Workflow

1. **Identify scope** — confirm if ambiguous
2. **Gather** — read the pointed file + direct deps + existing doc refs (see `gather.md`)
3. **Conflict check** — if existing doc coverage found, apply conflict rules from `output.md`
4. **Write** — apply full cognitive model standard (`writing.md`) to this scope

## Output

Small scope by default → propose in chat before writing. If the output creates a new file or section in the tree, apply the threshold from `output.md`.
