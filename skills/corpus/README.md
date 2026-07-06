# corpus

A self-contained documentation engine. Generates and maintains a `docs/` tree that acts as the cognitive model of a project — complete enough that any AI agent can implement changes from an incomplete spec using docs alone, without reading the actual code. Any specialist can hand corpus their context (issue, prompt, diff, output) and get structured, correctly placed documentation back.

## What it does

Generates and maintains a `docs/` tree that acts as the cognitive model of a project — complete enough that an AI agent can implement changes from an incomplete spec using docs alone, without reading the actual code.

## Modes

| Mode | When to use |
|---|---|
| **Bootstrap** | No docs exist — generate the full tree from scratch |
| **Update** | Code changed — sync affected doc files |
| **Targeted** | Document a specific module, feature, domain, or surface artifact |
| **Audit** | Evaluate doc quality, produce a gap report |
| **Rewrite** | Fix messy, incomplete, or mis-structured docs |

## Doc Lifecycle

```
Bootstrap ──→ Rewrite ──→ Audit
  (seed)     (n passes)  (guardian)
               ↑____________↓
               loop until clean
```

Bootstrap seeds the tree. Rewrite elevates quality incrementally. Audit enforces the standard and feeds the next Rewrite pass. The loop runs until Audit is satisfied.

## Doc Structure

```
docs/
├── index.md
├── functional/
│   ├── index.md
│   └── <domain>.md or <domain>/
├── implementation/
│   ├── index.md
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
- **README** — multiple types: `library`, `internal-tool`, `app`, `infra`, `cli`, `monorepo`
- **Project descriptions** — sized and formatted for any destination (GitHub, `package.json`, Linear, pitch…)

## Agent File Management

Corpus manages `AGENTS.md` and agent-specific stub files (`CLAUDE.md`, `GEMINI.md`, etc.) as part of Bootstrap, Audit, and Rewrite. It enforces a single source of truth model: one `AGENTS.md` containing doc-reading rules, doc map, and inferred project conventions — with all agent-specific files as thin stubs referencing it.

## Rules Files

| File | Purpose |
|---|---|
| `rules/core/structure.md` | Doc tree layout, split decisions, references |
| `rules/core/gather.md` | Content classification, discovery, dead ends |
| `rules/core/writing.md` | Universal quality standard, confidence flagging, domain loading |
| `rules/core/output.md` | Propose vs. write threshold, conflict handling |
| `rules/core/agent-files.md` | Agent file management and `AGENTS.md` structure |
| `rules/core/surfaces.md` | README types and description snippet formats |
| `rules/modes/bootstrap.md` | Bootstrap workflow |
| `rules/modes/update.md` | Update workflow |
| `rules/modes/targeted.md` | Targeted workflow |
| `rules/modes/audit.md` | Audit workflow |
| `rules/modes/rewrite.md` | Rewrite workflow |
| `rules/domains/functional.md` | Business rules, feature specs, user flows |
| `rules/domains/implementation.md` | Module contracts, decisions, patterns |
| `rules/domains/design.md` | Tokens, components, interaction patterns, guidelines |
| `rules/domains/infra.md` | Deployment, environments, operations |
| `rules/domains/data.md` | Schemas, models, migrations, data contracts |
