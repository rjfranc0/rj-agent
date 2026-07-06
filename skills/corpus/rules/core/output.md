# Core: Output

When to propose vs. write directly, and how to handle conflicts.

## Propose vs. Write Threshold

| Scope | Behavior |
|---|---|
| Small | Propose changes in chat → incorporate feedback → write |
| Large | Write directly to repo → user reviews in repo |

**Small**: single file edit, or a handful of targeted changes to existing files
**Large**: new files created, structural changes to `docs/` tree, or 3+ files touched

Rationale: reviewing 40 proposed file changes in chat is worse than reviewing actual files in the repo. At large scale, the repo is the right review surface.

## Conflict Handling

A conflict is when code and docs describe different behavior. Never silently resolve — code and docs can both be wrong. The difference might be a bug in code, or an undocumented intentional change. That is a product question, not a technical one.

| Count | Behavior |
|---|---|
| 1–3 conflicts | Batch question → wait for resolution → write |
| 4+ conflicts | Full conflict report → pause → user resolves → write |

### Conflict Report Format

```markdown
## Doc Conflicts Found

### [Conflict title] — severity: breaking / cosmetic
- **Location**: `implementation/payments/settlement.md#reconciliation`
- **Doc says**: [current doc claim]
- **Code says**: [what the code actually does]
- **Cannot determine**: which is correct — may be a bug or an undocumented change

### [Next conflict...]
```

### Conflict Severity

**Breaking**: the doc description would cause incorrect implementation if followed as-is
**Cosmetic**: naming inaccuracy, minor description drift — does not affect implementation decisions

## Confirmation Gates

| Mode | Gate type |
|---|---|
| Bootstrap | Hard stop — always confirm before proceeding |
| Rewrite | Hard stop — always confirm before proceeding |
| Update | Soft stop — confirm, proceed on no objection |
| Targeted | Soft stop — confirm, proceed on no objection |
| Audit | Soft stop — confirm, proceed on no objection |
