# Sequencing

How to turn the work units in `### Implementation plan` into the Workflow sequence.

## 1. Unit → subagent

Each unit carries exactly one concern tag. Routing is a lookup — never your own reading of the unit:

| Concern tag | Subagent |
|---|---|
| `data` | `vera` |
| `backend` | `hugo` |
| `frontend:create` | `aurora-design` |
| `frontend:redesign` | `aurora-design` |
| `frontend:feature` | `aurora` |
| `rust` | `ferran` |
| `infra` | `silas` |

A unit with a missing tag, or a tag not in this table, is a sequence-build blocker.

## 2. SLL entries

One SLL entry per unit, in unit order — unit order is execution order. Never merge or reorder units; `blueprint` already grouped the work.

## 3. OTTL and WL

After all SLL entries, append exactly:

- One `OTTL` entry — `tessa` global pass, `cycle 0/2`.
- One `WL` entry — `argus` full-diff pass, `cycle 0/2`.

## 4. Final corpus

Always end with exactly one `corpus` Update over the whole issue. Docs are not refreshed between SLLs — each specialist gets its contracts and reads the code.

## Canonical shape

```
1. [ ] Unit 1 SLL — <subagent> — iteration 1/3 (<subagent>)
   ... (one entry per unit)
N.   [ ] OTTL — tessa global pass — cycle 0/2 (tessa)
N+1. [ ] WL — argus pass — cycle 0/2 (argus)
N+2. [ ] corpus — final Update
```

Always produce the full shape, even for a single-unit issue.
