# rj-agent

Franco's personal AI agent config — behaviors and skills managed by [lore](https://github.com/rjfranco/lore-repo).

This is a supervised, human-led pipeline: the human is the runtime, skills are stations that reduce cognitive load at each step. State lives in artifacts — docs, issues, findings — never in sessions, so any station can run on any model at any time. Skill boundaries are pause points where the human steps in, switches models, or does the work directly.

## Behaviors

| Name | Purpose |
|---|---|
| `core` | Non-negotiables: precedence, security, secrets, destructive ops |
| `communication` | Style and solution-framing rules |
| `planning` | Rules for before starting work (planning, questions, assumptions) |
| `coding` | Rules while coding (style, tool use, comments, secrets) |
| `post-work` | Rules after finishing (review, memory, commits gate) |
| `commits` | Commit discipline and Conventional Commits format |

## The Pipeline

Design principles:

- The human is the runtime; skills are stations, boundaries are pause points
- Artifacts are the interface — docs (`corpus`), spec + plan (Linear issue), QA findings (.md reports → Linear PR comments); never session memory
- Blueprint owns the what and the seams; specialists own the how — any judgment phase (design, data modeling, test strategy) stays with its specialist
- Split skills when core judgment diverges; lazy-load rule files when only domain rules vary
- Orchestrators dispatch curated context slices; specialists never talk to each other

```
 [facet] (Brainstorm)
    │
    │  Write issues
    ▼
┌─────────────────────────────────────────────────────────┐
│        [brief] (Functional Spec)                        │
│           │                                             │
│           │  With codebase context, fill the issue      │
│           ▼                                             │
│      [blueprint] (Technical Strategy + Test Plan)       │
│                                                         │
│      Artifact: Linear issue = spec + plan               │
└─────────────────────────────────────────────────────────┘
    │
    │  Implementation phase (per feature, human-stepped)
    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│   ┌──────────────────────────────────────────────────────────────────┐   │
│   │                            O[atlas]                              │   │
│   │   (Parses blueprint, tracks dispatch state, routes context       │   │
│   │    slices; every arrow below is a pause point for the human)     │   │
│   └───┬───────────┬───────────┬───────────┬──────────────┬───────────┘   │
│       │           │           │           │              │     ▲         │
│       ▼           ▼           ▼           ▼              │     │ fix-    │
│    [vera]      [hugo]     [aurora]     [ferran]          │     │ loop    │
│   (postgres  (node/      (design &     (rust &           │     │         │
│    /ORM)      fastify)    react)        tauri)           ▼     │         │
│       │           │           │           │       ┌──────────────────┐   │
│       └───────────┴─────┬─────┴───────────┘       │     [tessa]      │   │
│                         ▼                         │  decides levels: │   │
│   ┌──────────────────────────────────────────┐    │  unit / integra- │   │
│   │              [corpus]                    │    │  tion / e2e      │   │
│   │  (Docs = cognitive model; returns        │    └────────┬─────────┘   │
│   │   context packet to the lead)            │             ▼             │
│   └──────────────────────────────────────────┘    ┌──────────────────┐   │
│                                                   │     [argus]      │   │
│   Loop per task: dispatch → specialist →          │  lens passes:    │   │
│   corpus → tessa → argus →                        │  security / perf │   │
│   fix-loop (original specialist) → done           │  / quality       │   │
│                                                   └──────────────────┘   │
│   Artifact: QA findings = .md reports, pasted by the human as            │
│   Linear PR comments (one per pass; fix-loop sessions read them          │
│   back via diff threads — issue stays pre-code: spec, plan, prep)        │
└──────────────────────────────────────────────────────────────────────────┘
    │
    │  Deployment (pipeline deploys, human presses the button)
    ▼
[silas] (maintains CI configs, Dockerfiles, monitoring/dashboards;
         hugo instruments, silas consumes — never executes deploys)
```

## Skills

| Skill | Role | Name meaning | Status |
|---|---|---|---|
| `facet` | Brainstorming & thinking partner | One cut face of a gem — examining an idea angle by angle | ✅ |
| `brief` | Functional issue writer | The brief — what must be done, nothing about how | ✅ |
| `blueprint` | Technical strategy & test plan | The build plan drawn before construction | ✅ |
| `corpus` | AI-first documentation engine | Latin *body* — the body of knowledge, the system's cognitive model | ✅ |
| `vera` | Database specialist (Postgres/ORM) | *Truth* — data integrity | ✅ |
| `hugo` | Backend specialist (Node/Fastify) | *Mind, intellect* — the reasoning core | ✅ |
| `aurora` | Frontend specialist (design & React) | *Dawn* — beauty, what the user sees | ✅ |
| `atlas` | Fullstack lead — dispatches context slices | Titan holding the world — carries the whole map without building | 🔜 |
| `tessa` | Test writer (unit/integration/e2e) | *Harvester* — gathers proof from the plan | 🔜 |
| `argus` | Code reviewer (security/perf/quality passes) | Hundred-eyed watchman — nothing slips past | 🔜 |
| `ferran` | Systems specialist (Rust & Tauri) | *Blacksmith, iron* — iron oxidizes into rust | 🔜 |
| `silas` | DevOps — maintains CI/deploy/monitoring machinery | *Forest keeper* — tends the ecosystem, builds nothing new | 🔜 |

## Setup

```bash
cd behaviors
lore behavior add core communication planning coding post-work commits
```
