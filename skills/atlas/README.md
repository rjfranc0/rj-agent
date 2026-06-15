# atlas

Fullstack lead and dispatcher. *Titan holding the map* — carries the whole pipeline without building any of it himself.

A single-station-per-invocation orchestrator: reads a `blueprint`-filled issue and its `# Atlas State` Linear comment, decides what runs next, wears that station's hat for one invocation, writes the result back to Linear, stops. Stateless across invocations by design — any model, any session, picks up exactly where the last one left off.

## Structure

```
atlas/
├── SKILL.md              # identity, entry guard, execution loop, modes, boundaries
└── rules/
    ├── sequencing.md     # task→specialist mapping, SLL/OTTL/WL/silas sequence derivation
    ├── dispatch.md        # context packing + output comment formats
    └── state.md           # Atlas State template, sub-status conventions, DoD sync
```

## Loop structure: SLL, OTTL, WL

- **SLL** — Specialist Level Loop: `specialist (vera/hugo/aurora/ferran) ↔ tessa → corpus`, looping between specialist and tessa until tessa validates.
- **OTTL** — Orchestrator-To-Test Loop: all SLLs feed into one global `tessa` pass; on failure, atlas re-dispatches and the cycle repeats (cap 2).

```
atlas (dispatch to specialists) → SLL → tessa
    ↑←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←←↓
```

- **WL** — Workflow Loop: the entire OTTL goes back-and-forth with `argus`, each cycle requiring its own validation (cap 2).

### From the workflow perspective

```
atlas ─▶ specialist (vera/hugo/aurora/ferran) ─▶ tessa ─▶ corpus ─▶ tessa ─▶ argus ─▶ silas ─▶ corpus
 ▲ ▲         ▲                                     │                  │        │
 │ │         │     Specialist level feedback       │                  │        │
 │ │         └─────────────────────────────────────┘                  │        │
 │ │                                                                  │        │
 │ │         Global Tests and Feedbacks (Integration/E2E)             │        │
 │ └──────────────────────────────────────────────────────────────────┘        │
 │                                                                             │
 │                     Re-dispatch reviews comments                            │
 └─────────────────────────────────────────────────────────────────────────────┘
```

### From the dev perspective — one invocation per node

```
atlas(dispatch/plan) ─▶ atlas[specialist] ─▶ atlas[tessa] ─▶ atlas[corpus] ─▶ atlas[tessa] ─▶ atlas[argus] ─▶ atlas[silas] ─▶ atlas[corpus]
 ▲  ▲                   ▲                         │                           │               │
 │  │                   │Specialist level feedback│                           │               │
 │  │                   └─────────────────────────┘                           │               │
 │  │                                                                         │               │
 │  │         Global Tests and Feedbacks (Integration/E2E)                    │               │
 │  └─────────────────────────────────────────────────────────────────────────┘               │
 │                                                                                            │
 │                     Re-dispatch reviews comments                                           │
 └────────────────────────────────────────────────────────────────────────────────────────────┘
```

Every `atlas[...]` node = one invocation = one Linear update. Nothing auto-chains between them.

## Scope

| Does | Doesn't |
|---|---|
| Derives the dispatch sequence from a filled `## Technical` | Plans the implementation itself — that's `blueprint`'s job |
| Loads `vera`/`hugo`/`aurora`/`ferran`/`tessa`/`argus`/`corpus`/`silas` as needed, one per invocation | Runs multiple stations or autonomous multi-step chains |
| Tracks state + DoD in its own `# Atlas State` comment | Edits the issue body — human-owned, alongside `brief`/`blueprint` |
| Packs minimal context (corpus pointers, task blocks, intent) | Re-derives full codebase context when corpus already covers it |
| Routes fixes analytically (root-cause specialist) | Routes mechanically by "which file did this touch" |
| Answers status/progress/DoD questions on request | Closes the issue or decides it's done — human's call |

## Decision log

| # | Decision | Alternatives rejected | Why |
|---|---|---|---|
| D1 | State lives in a Linear comment (`# Atlas State`), not a local file | `.atlas/<issue-id>.md` scratch file | Matches the existing tessa/argus PR-comment convention; one place the human already looks |
| D2 | Dispatch unit = contiguous specialist run (SLL), not atomic `Task N.N` | QA after every single task | Per-task QA is too fine-grained and too many pause points; per-slice tessa keeps fix attribution local without going coarse |
| D3 | `tessa` runs per-SLL (scoped to what's testable now) *and* once globally (OTTL, integration/e2e) | Single end-of-feature pass only | Local pass keeps fix-loop attribution immediate; global pass catches what no single slice could test |
| D4 | `argus` runs once, late, full-diff (WL) — not inside SLL | Per-SLL argus pass | Cross-specialist findings (e.g. access control spanning `vera`+`hugo`) need full context; doubling pause points per run isn't worth it |
| D5 | OTTL and WL each cap fix-loops at 2 cycles, then surface to the human | Uncapped retries | Infinite auto-loops do more harm than a clean stop with findings |
| D6 | Re-dispatch routing is analytical (root-cause judgment); dispatch map is supporting evidence only | Mechanical "file X was touched by Y → route to Y" | Atlas's first job is "fullstack lead" — judgment, not file-ownership lookup |
| D7 | One invocation = one station, fully stateless across invocations | Autonomous multi-station runs with internal "hard pause points" | This isn't an autonomous agent — the human is the runtime, by design |
| D8 | Specialist "plan only" is per-specialist, human-triggered, written as `# From Atlas State - Task N/M (...)` | Folding it into atlas's own sequence-build plan | Two different kinds of "plan" — atlas's dispatch sequence vs. a specialist's implementation plan for one task |
| D9 | Atlas ticks DoD items in its own state comment; never edits the issue body | Atlas updates the issue's DoD checkboxes directly | Issue body stays human-edited, alongside `brief`/`blueprint`; atlas's comment is the sync target |
| D10 | Drift detection is lazy — checked only when about to execute the current step's task | Proactive diff/hash check every invocation | Cheap, and only matters at the moment it'd actually block execution |
| D11 | File structure: `SKILL.md` + three focused rule files (sequencing / dispatch / state) | Single monolithic `SKILL.md` | Each file answers one question atlas asks every invocation; easier to navigate than one long file |

## Designed via

`facet` deep / ai-skill session, from scratch — no inspiration skills imported (orchestrator skills generally assume autonomous subagent dispatch, which conflicts with the human-as-runtime model here).
