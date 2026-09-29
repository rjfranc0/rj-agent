# Dispatch

How to build a subagent's prompt and post what it returns.

## The prompt is the context pack

Each subagent starts with an empty context plus its own preloaded skill. Your packet is everything else it knows. Pack by role:

| Receives | Implementers (SLL, fixes) | `tessa` scoped (SLL) | `tessa` global (OTTL) | `argus` (WL) | `corpus` |
|---|---|---|---|---|---|
| Mode + step reference | ✓ | ✓ | ✓ | ✓ | ✓ |
| Functional intent (relevant slice of `## Description`) | ✓ | ✓ | ✓ | ✓ | |
| The unit block, verbatim | ✓ | ✓ | | | |
| Contracts the unit produces or consumes, verbatim | ✓ | ✓ | | | |
| All contracts | | | ✓ | ✓ | |
| `### Decisions`, verbatim | ✓ | | | ✓ | |
| `[Cn]` statements for the unit's contracts | | ✓ | | | |
| Whole `### Automated tests` (or `[new test]` lines) | | | ✓ | | |
| `### Observability` items the unit touches | ✓ | | | ✓ | |
| Files touched (from the dispatch map) | | | | ✓ | ✓ |
| Corpus doc pointers for the scope | ✓ | ✓ | ✓ | ✓ | ✓ |
| Prior findings + your root-cause reasoning | fixes only | re-checks only | re-checks only | re-checks only | |

Rules:
- **Contracts are passed as fixed.** Never paraphrase or trim one.
- **Codebase context** — point at `corpus` docs covering the scope. If none do, say so; the subagent reads the codebase directly. Missing coverage is not a blocker.
- **Return contract** — end every packet with: "Return your full output as your final message."
- Never include instructions about model, effort, or thinking.

## Posting output

The subagent's final message is its output. Post it as a new comment; below the `---`, the body is untouched.

```markdown
# Atlas Dispatch — Step N/M (`<subagent>`)

**Scope:** [Unit N — title / "visual review" / "OTTL global pass" / "WL argus pass" / "corpus refresh"]
**Context provided:** [contracts C1, C2 / corpus doc paths or "no corpus docs — direct codebase"]
**Mode:** [implement / fix / review / test / docs]

---

[subagent output]
```

Plan-only outputs use `# From Atlas State - Step N/M (\`<subagent>\`)` with **Mode:** plan.

`N/M` is always the entry's position in the Workflow sequence.

## Reading the result

- **Pass / done** → advance per `state.md`.
- **Fail** (`tessa`, `argus`, or visual review) → findings to Notes, route per `state.md`.
- **Contract blocker** → stop. Never route a fix.
- **Other blocker** → stop condition. Post the output, record it in Notes, stop.