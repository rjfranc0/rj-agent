# corpus

A self-contained documentation engine. Generates and maintains a `docs/` tree that acts as the cognitive model of a project — complete enough that any AI agent can implement changes from an incomplete spec using docs alone, without reading the actual code. Any specialist can hand corpus their context (issue, prompt, diff, output) and get structured, correctly placed documentation back.

## What it does

Generates and maintains a `docs/` tree that acts as the cognitive model of a project — the point of contract between the humans who steer it and the agents who write the code.

## Modes

| Mode | When to use |
|---|---|
| **Bootstrap** | No docs exist — generate the full tree from scratch |
| **Update** | Code changed — sync affected doc files, harvest decisions and contracts from the input |
| **Targeted** | Document a specific module, feature, domain, or surface artifact |
| **Audit** | Evaluate doc quality, produce a gap report |
| **Rewrite** | Fix messy, incomplete, or mis-structured docs |

Update, Targeted, and Audit can run **unattended** (mode and scope given, no one to answer): no confirmations, direct writes, blockers and conflicts returned in the output. Bootstrap and Rewrite always need a human.

## Doc Lifecycle

```
Bootstrap ──→ Rewrite ──→ Audit
  (seed)     (n passes)  (guardian)
               ↑____________↓
               loop until clean
```

Bootstrap seeds the tree. Rewrite elevates quality incrementally as the project evolves. Audit enforces the standard and feeds the next Rewrite pass. Update keeps the tree in sync between passes.

## Doc Structure

```
docs/
├── index.md
├── functional/
│   ├── index.md
│   └── <domain>.md or <domain>/
├── implementation/
│   ├── index.md            ← architecture overview
│   ├── conventions.md      ← naming, errors, async, style, commits
│   └── <domain>.md or <domain>/
├── design/
│   ├── index.md
│   └── <domain>.md or <domain>/
├── infra/
│   ├── index.md
│   └── <domain>.md or <domain>/
└── data/
    ├── index.md
    └── <domain>.md or <domain>/
```

Full structure rules in `rules/core/structure.md`.

## Surface Artifacts

Corpus also generates project-level surface artifacts via Targeted mode:
- **README** — multiple types: `library`, `internal-tool`, `app`, `infra`, `cli`, `monorepo`. No completeness gate: built from the docs as they stand, with unverified claims flagged `⚠️ To confirm`.
- **Project descriptions** — sized and formatted for any destination (GitHub, `package.json`, Linear, pitch…)

## Agent File Management

`AGENTS.md` is the only agent instruction file. Corpus migrates the content of any vendor-specific file (`CLAUDE.md`, `.claude/CLAUDE.md`, `CLAUDE.local.md`, `GEMINI.md`…) into it and deletes them — a leftover `CLAUDE.md` makes Claude Code skip `AGENTS.md`.

`AGENTS.md` is loaded into every agent session, so it stays lean: a project line, exact commands, and the doc-reading rules. Architecture and conventions live in `docs/implementation/`. Monorepos get a nested `AGENTS.md` per package.

## Model

| Mode | Run it on | Why |
|---|---|---|
| Bootstrap, Rewrite, Audit | Opus session | Codebase-wide judgment |
| Update, Targeted | Sonnet (`high`) | Scoped, precise work |

A usage rule, not separate agents: run Bootstrap, Rewrite, and Audit yourself in an Opus session. Update runs wherever corpus is dispatched as a Sonnet agent.

## Rules Files

| File | Purpose |
|---|---|
| `rules/core/structure.md` | Doc tree layout, split decisions, references |
| `rules/core/gather.md` | Content classification, discovery, dead ends |
| `rules/core/writing.md` | Universal quality standard, confidence flagging, domain loading |
| `rules/core/output.md` | Propose vs. write threshold, conflict handling, unattended output |
| `rules/core/agent-files.md` | `AGENTS.md` management and structure |
| `rules/core/surfaces.md` | README types and description snippet formats |
| `rules/modes/bootstrap.md` | Bootstrap workflow |
| `rules/modes/update.md` | Update workflow, including decision and contract harvesting |
| `rules/modes/targeted.md` | Targeted workflow |
| `rules/modes/audit.md` | Audit workflow |
| `rules/modes/rewrite.md` | Rewrite workflow |
| `rules/domains/functional.md` | Business rules, feature specs, user flows |
| `rules/domains/implementation.md` | Architecture, module contracts, decisions, patterns, conventions |
| `rules/domains/design.md` | Tokens, components, interaction patterns, guidelines |
| `rules/domains/infra.md` | Deployment, environments, operations |
| `rules/domains/data.md` | Schemas, models, migrations, data contracts |