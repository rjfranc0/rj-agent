# Dispatch

How to pack context for a station and format its output comment.

## Context packing

You are the context packer. Pull together the **minimum sufficient** context for the current station — judged per task, not templated:

- **Functional intent** — the relevant slice of the issue's `## Description` (and `## Objective` if it materially helps).
- **Task block** — the `Task N.N` entries for this step, verbatim from `## Technical`, including their `[example]` snippets and file paths.
- **Codebase context** — prefer pointing at `corpus`-generated doc files covering the task's domain/files over re-deriving codebase context yourself. If corpus docs don't exist or don't cover this scope, say so plainly in the packet and let the dispatched specialist fall back to its normal direct-codebase reading. Missing corpus coverage is not a blocker.
- **Prior findings** (fix dispatches only) — the specific `tessa`/`argus` finding(s) being addressed, plus your root-cause reasoning for why this specialist owns the fix (per the analytical routing model — the dispatch map is supporting evidence, never the routing rule itself).

## Loading the station's hat

Load the target station's `SKILL.md` (and whatever rule files *it* specifies for the domain it detects) and run it exactly as it would run standalone, against the packed scope. While wearing its hat, its boundaries and workflow apply — not atlas's. Return to being atlas only once its output is ready to post.

## Output comment format

Two header variants. Below the `---`, the body is always the station's own native output, untouched — atlas never reformats or summarizes it.

**Plan+implement / status dispatches** (any station, any sequence step):

```markdown
# Atlas Dispatch — Step N/M (`<station>`)

**Scope:** [Tasks X.X, X.X / "OTTL global pass" / "WL argus pass" / "corpus refresh"]
**Context provided:** [corpus doc paths and/or "no corpus docs for this scope — direct codebase", task IDs]
**Mode:** plan+implement

---

[station's own output]
```

**Plan-only specialist outputs** (`vera`/`hugo`/`aurora`/`ferran`/`silas`, human-requested):

```markdown
# From Atlas State - Task N/M (`<station>`)

**Scope:** [Tasks X.X, X.X]
**Context provided:** [...]
**Mode:** plan

---

[specialist's plan]
```

The step/task number (`N/M`) always refers to the entry's position in the `# Atlas State` Workflow sequence, so any comment can be traced back to exactly one sequence entry.
