# Core: Agent Files

Rules for managing agent instruction files. Applies during Bootstrap, Audit, and Rewrite.

## One File: `AGENTS.md`

`AGENTS.md` is the only agent instruction file in a project. Agents that support it read it natively, root and nested.

No vendor-specific files: no `CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md`, `GEMINI.md`, `WARP.md`, or stubs pointing to `AGENTS.md`. A leftover `CLAUDE.md`, `.claude/CLAUDE.md`, or `CLAUDE.local.md` anywhere on the path makes Claude Code skip `AGENTS.md` entirely — removing them is part of the job, not cleanup.

Corpus owns only the `## Corpus` section of each `AGENTS.md`. Everything outside it is human-authored and never touched.

## File Management

### No agent file exists

Generate `AGENTS.md` (structure below).

### Vendor-specific files exist

1. Generate `AGENTS.md` if missing.
2. Move each vendor file's human-authored content into `AGENTS.md`, outside `## Corpus`. Merge duplicates; when two files contradict each other, keep both versions and flag the conflict (`output.md`) — never pick one.
3. Delete the vendor files.

Hard stop before step 3 unless the run is unattended: list the files to delete and what moved where.

### `AGENTS.md` already exists

Review and update the `## Corpus` section only.

### Nested `AGENTS.md`

For monorepos, generate one `AGENTS.md` per package or app root, holding only what differs from the root file — package-specific commands and doc pointers. Agents load a nested file only when working in that directory, so package context costs nothing elsewhere.

## `AGENTS.md` Structure

Loaded into every agent session — every line is paid on every run. Keep it to what an agent needs before it opens a single doc:

```markdown
# [Project Name]

[One or two sentences: what the project is and who it serves.]

## Corpus

### Commands
[Exact, copy-pasteable dev / test / typecheck / lint / build commands. Nothing else.]

### Doc-Reading Rules
[Always present. Start with docs/index.md, follow refs to narrow scope, never load the full tree blindly. Docs are the source of truth. If docs and code disagree, don't pick a side silently — report the conflict.]
```

Everything else belongs in `docs/`:
- Architecture → `docs/implementation/index.md`
- Naming, error handling, async, code style, commit format → `docs/implementation/conventions.md` (see `rules/domains/implementation.md`)
- Doc map and confidence levels → `docs/index.md`

## Audit Scope

Check for:
- No vendor-specific agent files anywhere in the repo
- `AGENTS.md` present at root, plus nested files where the repo has packages
- `## Corpus` contains only the project line, Commands, and Doc-Reading Rules
- Commands are current and runnable
- Doc-Reading Rules present and correctly formed
- No system knowledge in `AGENTS.md` that belongs in `docs/`
