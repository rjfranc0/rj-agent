# Mode: Targeted

**Load also**: `gather.md`, `writing.md`, `output.md`

User points at a specific thing → document it at full cognitive model standard.

Also handles surface artifacts — README generation and project description snippets. Load `surfaces.md` when the output is a surface artifact rather than a doc file.

## Scope Detection

From user input, determine:
- What is being documented (module, feature, function, domain, API endpoint, README, description…)
- Whether functional, implementation, design, infra, or data doc is needed — or a surface artifact
- Where the output lands in the existing `docs/` tree

If docs exist: check for existing coverage first. Update in place rather than create a duplicate.

If location in tree is ambiguous → confirm with user before writing.

## Workflow

1. **Identify scope** — confirm if ambiguous
2. **Gather** — read the pointed file + direct deps + existing doc refs (see `gather.md`)
3. **Load domain rules** — `rules/domains/<domain>.md` for the target domain
4. **Load surface rules** — `rules/core/surfaces.md` if output is README or description
5. **Conflict check** — if existing doc coverage found, apply conflict rules from `output.md`
6. **Write** — apply full cognitive model standard (`writing.md`) to this scope

## Output

Small scope by default → propose in chat before writing. If the output creates a new file or section in the tree, apply the threshold from `output.md`.
