# Correctness Lens

Judge code against stated intent. This lens answers one question: does the change do what it was supposed to do — exactly, completely, and nothing else?

## The Intent Gate (Hard Requirement)

This lens runs only with **intent context**: an issue, spec, PR description, or an explicitly stated goal. Without it, skip the pass and state in the output: "Correctness not run: no intent context provided." **Never infer intent** from code, naming, or vibes and review against the guess — an inferred requirement produces confident false findings, which are worse than no findings.

The intent context is quoted or referenced in the report header so findings are traceable to the requirement they judge against.

## Method

1. **Requirement map** — decompose the intent into discrete requirements (explicit behaviors, stated constraints, acceptance criteria). For each: locate the implementing code, or flag it missing.
2. **Reverse map** — for each significant behavior the diff introduces, find its requirement. Behavior with no requirement is either scope creep (carry to quality) or a misunderstanding of the feature (finding here).
3. **Edge audit against the spec** — for each requirement, walk the boundaries: empty input, zero/negative, absent optional data, concurrent invocation, failure of a dependency mid-operation. Judge the code's behavior at each boundary against what the intent demands — not against what seems reasonable.
4. **Error semantics vs intent** — a swallowed error, silent fallback, or default value is a correctness finding when the intent requires the failure to be visible or handled differently. (The same pattern is independently a quality finding as craft; both may exist, judged against different references.)

## Principles

1. **Built the wrong thing is the highest-severity bug** — an implementation that satisfies its own logic but not the requirement blocks, even if every line is clean.
2. **Partial delivery is stated, never assumed** — a requirement silently dropped is a finding; a requirement explicitly deferred in the intent context is not.
3. **Boundaries belong to the requirement** — off-by-ones, inclusive/exclusive confusion, timezone and encoding assumptions are judged against what the spec defines, and flagged as ambiguity when the spec doesn't define them.
4. **Spec ambiguity is a finding, not a guess** — when the intent genuinely underdetermines behavior the code had to choose, report the choice made and mark the finding `spec-gap` instead of asserting the code is wrong.
5. **State transitions honor the declared lifecycle** — if the intent defines states (draft → submitted → approved), every transition in code maps to a legal transition in the spec.

## Severity Guide

- **blocker** — a stated requirement is unmet, contradicted, or wrongly implemented
- **high** — required behavior breaks at a boundary the intent covers (explicitly or by obvious implication)
- **medium** — divergence on secondary behavior, or a `spec-gap` where the silent choice is risky
- **low** — `spec-gap` where the choice made is defensible but unconfirmed
