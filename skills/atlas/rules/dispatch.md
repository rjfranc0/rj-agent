# Dispatch

How to call a station, what to send, and how to read what comes back.

## Calling

| Station | Call |
|---|---|
| `vera`, `hugo`, `aurora`, `ferran`, `silas`, `tessa`, `argus` | Bash, `timeout` parameter 5700000: `rj-codex run <station> <<'RJ_PACKET'` … `RJ_PACKET` |
| `aurora-design`, `corpus` | Agent tool, the station as subagent type, the packet as prompt |

One dispatch at a time. Wait for it to finish.

## The packet

Each station starts empty. The issue context lives in the file `rj-codex ctx` printed; point to it, never paste it.

| Receives | Unit | Fix | `tessa` | `argus` | `corpus` |
|---|---|---|---|---|---|
| Mode + step `N/M` | ✓ | ✓ | ✓ | ✓ | ✓ |
| Issue file path | ✓ | ✓ | ✓ | ✓ | ✓ |
| Which unit, and which contracts it produces or consumes | ✓ | | | | |
| Corpus doc pointers for the scope, or "none — read the codebase" | ✓ | ✓ | ✓ | ✓ | ✓ |
| The findings to fix, with your root-cause reasoning | | ✓ | | | |
| Review scope (below) | | | | ✓ | |

Standing lines, by station:

- **Units and fixes:** "Before returning, run the existing tests covering what you changed. Report what ran and the result."
- **Fixes:** the findings and why this station owns them. Never prescribe the fix — the station decides how, and checks the code itself. Name any risk you see ("this path shares the rate limiter") without solving it.
- **`aurora-design`:** "Before returning, render what you built and check it against the design system. Fix what's off."
- **`tessa`:** run the issue's `### Automated tests` and `[Cn]` checks, across everything built.
- **`argus`:** "Write no files. Return every report in your final message." Intent context is the issue file.
- **`corpus`:** mode Update, scope the whole issue, write directly.
- **Every packet ends with:** "End your output with a `Deviations:` line — anything you did beyond or differently from the issue, or `none`. Return your full output as your final message."

Never include instructions about model, effort, or thinking.

### argus review scope

- **Cycle 0:** the full candidate, `git diff <base>` plus untracked files.
- **Cycle 1+:** only the files the fixes changed, the union of their `changed.txt`, plus the findings to verify. On a resumed session, where those paths are lost, use the full candidate.

## Reading the result

**Codex stations** return an envelope (first line `status=`):

- `status=done` → read the file at `result=`. That's the output.
- `status=failed` or `cancelled` → Blocker. Put `reason` and `job` in the stop reply. It doesn't count as a cycle.

**Claude stations** return their output directly.

Then:

- **Unit done** → next step. Red tests reported → Notes, keep going; tessa's global pass handles them.
- **Pass / Fail** (tessa, argus) → fix cycles per `SKILL.md`.
- **Contract blocker** → stop. Never route a fix.
- **Other blocker** → stop.

Nothing is posted to Linear except the state.
