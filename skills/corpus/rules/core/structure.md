# Core: Structure

Canonical layout and rules for the `docs/` tree.

## Tree Layout

```
docs/
├── index.md                      ← Project summary, references functional/ and technical/
├── functional/
│   ├── index.md                  ← Domain map, table of contents
│   ├── <domain>.md               ← Single file when domain is simple
│   └── <domain>/
│       ├── index.md              ← Domain summary, table of contents
│       └── <feature>.md
└── technical/
    ├── index.md                  ← Domain map, table of contents
    ├── <domain>.md               ← Single file when domain is simple
    └── <domain>/
        ├── index.md              ← Domain summary, table of contents
        └── <feature>.md
```

## Index Files

Index files are navigation nodes, not content files. They:
- Summarize what the domain/section covers in 2–3 sentences
- List and link all children with one-line descriptions
- Do not repeat content from children — reference, never restate
- Are the first file an agent loads when orienting in the tree

## Split Decision

A domain warrants a subfolder only when **both** gates pass:

**Gate 1 — Navigability independence**: each section can be loaded alone and fully understood without any other section. If section B requires context from section A to make sense → coupled → stay single file. A long list of products, use cases, or configurations that share a common definition fails this gate.

**Gate 2 — Substance**: each section justifies its own file. No micro-files for minor edge cases. Rough floor: ~50 lines of meaningful content per section.

Size alone is never a split signal.

## File Size

Soft cap: **~250–300 lines**. Above this, flag it — an agent loading this file is paying a token cost worth examining. Do not split unless Gate 1 passes.

## Reference Types

All references are semantic — the surrounding sentence explains *why* the link exists, never bare links.

| Direction | Meaning |
|---|---|
| `functional → functional` | Domain dependency ("this feature depends on this rule") |
| `technical → functional` | Implementation traces back to business logic |
| `functional → technical` | Spec points at concrete implementation |
| `technical → technical` | Code-level dependency between modules |

Reference syntax:
```markdown
See [@/functional/payments/settlement.md#reconciliation-logic] for the business rule this implements.
```

## Domain Boundaries

Domains are semantic groupings, not folder structures. One domain = one coherent business or technical concern an agent can reason about independently.

Inferring domain boundaries from code:
1. Read entry points, routes, schemas, config first
2. Cluster by import graph and naming patterns
3. Propose domain map before writing anything
4. Heavy internal cross-references between candidates → merge them
