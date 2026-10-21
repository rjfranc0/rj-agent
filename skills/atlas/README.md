# atlas

Dispatcher for the rj-agent pipeline. Takes a `blueprint`-filled issue and runs it end to end through the stations, without implementing anything itself.

## Structure

```
atlas/
├── SKILL.md           # sequence, entry, run loop, fix cycles, stops, boundaries
└── rules/
    ├── dispatch.md    # how to call a station, what to send, how to read the result
    └── state.md       # the # Atlas State comment
```

Agent file: `agents/atlas.md` (Opus / high, no edit tools). Start it with `claude --agent atlas`.

## Flow

```
Unit 1 … Unit U ──▶ tessa global ──▶ argus ──▶ corpus
(one dispatch each)   ⟲ fix ×2        ⟲ fix ×2
```

| Station | Runs on |
|---|---|
| `vera`, `hugo`, `aurora`, `ferran`, `silas`, `tessa`, `argus` | Codex, through `rj-codex` |
| `aurora-design`, `corpus` | Claude subagents |

## Before a run

The environment is yours: create the worktree (`wt`), install dependencies, start Postgres, build what the stations need. A station that finds something missing stops the run with a Blocker.

## State

One Linear comment, `# Atlas State`: a status line, `## Notes` (deviations from the blueprint only) and `## Findings` (tessa/argus findings and how each ended). It's the only thing atlas writes to Linear. Station outputs stay in `.git/rj-codex/<job>/`.

## Decision log

| # | Decision | Why |
|---|---|---|
| D1 | State in one Linear comment, edited in place | One place you already look |
| D2 | The sequence is derived from the issue every invocation, never stored | Status `step N/M` plus the blueprint is enough to resume |
| D3 | State reports by exception: deviations and findings only | The blueprint already says what should be done |
| D4 | No per-unit test check; specialists run their tests, tessa runs once globally | One loop instead of N; red units are caught and routed by tessa |
| D5 | argus once, late, on the full candidate; re-checks only see the fixes' changed files | Cross-station findings need full context; re-reading everything was ~750k tokens |
| D6 | Fix cycles capped at 2, then stop with findings | A clean stop beats an infinite loop |
| D7 | Fix routing is root-cause judgment, not file ownership | Atlas's job is routing |
| D8 | Fix packets carry findings, never solutions | A prescribed fix sent hugo the wrong way (SEC-001); the station checks the code itself |
| D9 | Issue context written once to a file (`rj-codex ctx`), packets point to it | Decisions and contracts were pasted ~35 times per run |
| D10 | Codex called directly from atlas, no relay | Relays re-typed every packet and could truncate it |
| D11 | aurora-design self-reviews in its build run | Cold-start reviewers were ~40% of the last run's tokens |
| D12 | Nothing posted to Linear per dispatch | Every report crossed atlas's context twice |
| D13 | Environment prep is manual | `wt` already handles worktrees and env files |
