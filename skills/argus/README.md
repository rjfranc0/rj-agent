# argus

Hundred-eyed watchman — code reviewer running isolated lens passes, one findings report per lens.

Generic and pipeline-agnostic: takes a changeset (diff, branch, commit range) or a full codebase (audit mode), emits markdown reports to `.argus/`, stops. Never fixes code, never publishes anywhere.

## Run model

1. **Critical sweep** — always first: secrets, hardcoded env config, fabricated dependencies/APIs, leftover scaffolding (`CRIT-`)
2. **Lens passes**, one at a time, each with its own report:

| Lens | Judges code against | Prefix | Availability |
|---|---|---|---|
| Security | the adversary (OWASP Top 10 backbone) | `SEC-` | always |
| Performance | resources (cost story required) | `PERF-` | always |
| Correctness | stated intent | `CORR-` | gated: skipped when no intent context provided |
| Quality | craft + domain logic | `QUAL-` | always |

Quality lazy-loads domain files by touched file types: `frontend.md`, `backend.md`, `db.md`, `rust.md`.

## Findings

Lens-prefixed ID · severity (`blocker/high/medium/low`) · exact location · finding · violated principle · **resolved-when** condition (verifiable outcome, never a patch). Report verdict: `pass` / `pass with findings` / `blocked`.

## Structure

```
argus/
  SKILL.md                 # identity, run model, sweep checklist, findings contract, routing
  rules/
    security/RULES.md
    performance/RULES.md
    correctness/RULES.md
    quality/RULES.md + frontend.md, backend.md, db.md, rust.md
```
