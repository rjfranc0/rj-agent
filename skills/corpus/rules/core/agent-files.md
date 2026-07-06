# Core: Agent Files

Rules for managing `AGENTS.md` and agent-specific files. Applies during Bootstrap, Audit, and Rewrite.

## Source of Truth Model

One `AGENTS.md` at project root is the canonical agent instruction file. All agent-specific files (`CLAUDE.md`, `GEMINI.md`, `WARP.md`, etc.) are thin stubs that reference it:

```
@AGENTS.md
```

Corpus enforces this model. Corpus never touches content below `## Corpus` in any file — that section is reserved for human-authored instructions.

## File Management on Bootstrap

### Case 1 — No agent file exists

1. Generate `AGENTS.md` (see structure below)
2. Scan for agent-specific config folders (`.claude/`, `.gemini/`, `.warp/`, etc.)
3. For each found → create matching stub file (`CLAUDE.md`, `GEMINI.md`, etc.) with `@AGENTS.md` as only content
4. Nothing found → do nothing beyond `AGENTS.md`

### Case 2 — One specific agent file exists (e.g. `CLAUDE.md`)

1. Generate `AGENTS.md` from its content
2. Replace specific file content with `@AGENTS.md` stub

### Case 3 — Multiple specific agent files, no `AGENTS.md`

1. Generate `AGENTS.md` skeleton (do not merge — content stays in specific files)
2. Prepend `@AGENTS.md` to each specific file without touching existing content
3. Propose refactor to human: extract shared rules to `AGENTS.md`, keep agent-specific rules in place
4. Execute refactor only if accepted

### Case 4 — `AGENTS.md` already exists with stub references

Setup is already canonical. Proceed directly to review and update.

### Explicit override

If the human states a specific file is the only agent file used in this project, target that file only. Skip `AGENTS.md` generation entirely.

## `AGENTS.md` Structure

```markdown
# [Project Name] — Agent Instructions

## Corpus

### Doc-Reading Rules
[Always present. Instructs agents to start with docs/index.md, follow refs to narrow scope, never load the full tree blindly, trust docs as source of truth.]

### Doc Map
[Lists all active docs/ branches, one-line description each, current confidence level.]

### Architecture
[Inferred architectural patterns — service boundaries, layer responsibilities, data flow.]

### Naming Conventions
[File, function, variable, domain naming patterns inferred from codebase.]

### Error Handling
[How errors are handled, propagated, and surfaced across the project.]

### Async Conventions
[Async patterns in use — promises, callbacks, channels, etc.]

### Code Style
[Formatting, structure, and style patterns inferred from codebase.]

### Commit Format
[Commit message conventions inferred from git history if available.]
```

## Convention Inference

Run during Bootstrap map phase. Goal: a project worked from docs and agent file alone, on any machine, without any external skill or config.

Infer from:
- File and folder naming patterns
- Function and variable naming across the codebase
- Import structure and module boundaries
- Error handling patterns in existing code
- Async patterns in use
- Git history for commit format
- Config files for code style rules

Include everything. Do not skip conventions assuming they are handled elsewhere — external configs are not portable.

## Audit Scope

Check `AGENTS.md` and all stub files for:
- Doc-reading rule present and correctly formed
- Doc map matches actual `docs/` tree (no missing or stale branches)
- Confidence level reflects current doc state
- No system knowledge that belongs in `docs/`
- Conventions reflect current codebase patterns
- Stub files contain only `@AGENTS.md` and nothing else
