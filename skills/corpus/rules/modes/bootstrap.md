# Mode: Bootstrap

**Load also**: `gather.md`, `writing.md`, `output.md`

No docs exist → generate the complete `docs/` tree from scratch. This is the seed of the doc lifecycle, not the finished product.

## Quality Bar

Directionally correct and structurally sound. Not perfect — that is Rewrite and Audit's job. Goals for Bootstrap output:
- Right structure in place
- All domains represented
- All gaps visible and flagged
- Every inference marked — nothing hidden

## Workflow

### Phase 1 — Map

Run full codebase discovery per `gather.md` entry points. Goal: understand project intent and identify domain boundaries before reading individual files.

Produce a **proposed domain map**:

```markdown
## Proposed Domain Map

### Functional domains
- `auth` — user authentication and session management (simple → single file)
- `payments/` — payment processing, settlement, refunds (complex → subfolder)
  - `processing` — charge flow and provider integration
  - `settlement` — reconciliation and payout logic

### Technical domains
- `api` — route definitions and middleware (simple → single file)
- `payments/` — payment service implementation
  - `provider` — external provider adapter
  - `reconciliation` — settlement job logic

### Confidence
- High: [domains with clear naming and structure]
- Medium: [domains where intent is clear but edge cases are unknown]
- Low: [anything genuinely unclear — state why]
```

**Hard gate**: present the domain map, wait for confirmation or correction. Do not write a single file until the domain map is approved. If the map is wrong, every file downstream is wrong.

### Phase 2 — Write

Write the full tree following the confirmed domain map. Only write branches confirmed during Phase 1 — do not create empty domain folders.

Write in dependency order — branches that others reference should exist first:
1. `docs/index.md`
2. `docs/functional/` — foundation, referenced by everything
3. `docs/implementation/` — references functional
4. `docs/design/` — references functional
5. `docs/data/` — references functional and implementation
6. `docs/infra/` — references implementation and data

For each branch, load `rules/domains/<domain>.md` before writing its files.

Apply `writing.md` rules fully. Flag every inference with the appropriate confidence marker. Do not skip gaps — make them visible.

Output is **large by definition** → write directly to repo (see `output.md`).

### Phase 3 — Bootstrap Summary

After writing, produce:

```markdown
## Bootstrap Complete

### Coverage
- Functional: X domains, Y files
- Technical: X domains, Y files

### Confidence flags
- Needs verification: [files with high inference load]
- Gaps (could not determine): [list what remains unknown]

### Recommended next steps
Run `rewrite` for incremental quality improvement, then `audit` to evaluate coverage.
```
