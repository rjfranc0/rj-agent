# Mode: Audit

**Load also**: `writing.md`, `structure.md`, `agent-files.md`

Guardian mode. Enforces the full cognitive model standard. Reports only — never rewrites.

## Quality Contract

A passing audit means every doc file in the tree allows an agent to:
- Understand the domain and why it exists
- Know what breaks if this component changes
- Implement a change without reading the actual code

Additionally:
- All contracts are precise (inputs, outputs, invariants, side effects)
- All decisions are documented (why this, what was rejected)
- All edge cases are explicit (conditions, results, reasons — not vague phrases)
- All references are valid and semantic — no bare links
- No unverified `⚠️ Inferred` or `🔍 Bootstrap note` sections remain
- File structure matches split decision rules from `structure.md`
- `AGENTS.md` is present, accurate, and canonical

## Workflow

### Phase 1 — Structural Scan

Check `docs/` tree against `structure.md`:
- Missing index files
- Files above soft cap (250–300 lines) — flag, note split candidacy
- Files that should be split (both gates pass)
- Misplaced files or domains

### Phase 2 — Content Audit

For each doc file, check against the cognitive model standard:
- Missing or vague behavior description
- Missing decisions or rationale
- Vague edge cases ("handles errors" without specifics)
- Imprecise or missing contracts
- Unverified inference flags
- Restated content that should be a reference instead
- Stale claims referencing changed code

### Phase 3 — Reference Audit

- Broken references (file moved, deleted, renamed)
- Bare references with no semantic context
- Missing references (behavior implemented elsewhere — should link)
- Direction mismatches (e.g. functional file containing implementation detail instead of linking)

### Phase 4 — Agent File Audit

Apply audit scope from `agent-files.md`:
- Doc-reading rule present and correctly formed
- Doc map matches actual `docs/` tree
- No system knowledge that belongs in docs
- Conventions reflect current codebase
- Stub files contain only `@AGENTS.md`

### Phase 5 — Gap Report

```markdown
## Audit Report

### Summary
X files audited · Y issues found
Breaking gaps: N | Quality gaps: N | Structural issues: N

### Breaking Gaps
Issues that would cause incorrect implementation if followed.
- `functional/payments/settlement.md#reconciliation`: contract missing — return conditions undocumented

### Quality Gaps
Issues that degrade agent understanding.
- `implementation/auth/sessions.md`: decision not documented (why JWT, what was rejected)
- `functional/billing/invoices.md`: edge case vague — "handles failed payments" without conditions

### Structural Issues
- `implementation/api.md`: 340 lines, above soft cap — review for split candidates
- `implementation/notifications/`: missing index.md

### Inference Flags Outstanding
- `functional/payments/settlement.md`: 2 Bootstrap notes unverified

### Agent File Issues
- [any issues found in `AGENTS.md` or stub files]
- `implementation/payments/provider.md`: 1 Inferred claim needs confirmation

### Recommended Actions
Prioritized fix list for Rewrite mode, highest severity first.
```

Close the report with:
> "Run `rewrite` with this report to address gaps incrementally."
