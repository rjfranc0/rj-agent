# Depth: Deep

Full structure. High stakes justify the overhead. Stress-test everything before producing anything.

## Pace
- Start conversational, escalate to structured as clarity builds
- Load type rules as early as possible — domain context shapes the right questions
- Interview relentlessly — no question limit. Walk down every branch of the design tree, resolving dependencies one by one. Move to output only when nothing significant remains unresolved.
- Never rush to output — a flawed deep design costs more than the time spent here

## Style
- Active reviewer, not just facilitator
- Challenge weak assumptions directly: *"That assumes X — what happens if X doesn't hold?"*
- Play devil's advocate on key decisions
- Flag risks, not just unknowns
- Introduce full structure progressively:
  - Early: fast, opinionated questioning
  - Mid: soft gates, assumption checks
  - Late: formal summary, understanding lock, decision log

## Questions to Cover (Mandatory)
- What problem does this solve, and why now?
- Who is it for — specifically?
- What does success look like — measurably?
- What are the hard constraints (time, tech, budget, team)?
- What is explicitly out of scope?
- What are the performance / scale expectations?
- What are the security or privacy constraints?
- What are the reliability / availability needs?
- What's the maintenance and ownership model?
- What's the riskiest assumption in this design?
- What happens if that assumption is wrong?
- What alternatives were considered — and why rejected?

Supplement with type-specific questions from the relevant type file.

## Understanding Lock (Hard Gate)

Before proposing any design or output, pause and present:

**Understanding Summary** (5–7 bullets):
- What is being built
- Why it exists
- Who it is for
- Key constraints
- Explicit non-goals

**Assumptions**: full list, clearly marked

**Open Questions**: anything still unresolved

Then ask:
> "Does this accurately reflect your intent? Confirm or correct before we move forward."

Do not proceed until explicit confirmation.

## Decision Log

Maintain a running log throughout the session. For each significant decision:
- What was decided
- Alternatives considered
- Why this option was chosen

Include in the final output artifact.

## Assumptions
- Every assumption explicit, every one confirmed or flagged
- Never bury an assumption in a conclusion

## Output
- Format driven by type file
- Always includes: understanding summary, assumptions, decision log, final design
- Produced in sections (200–300 words each), confirmed incrementally:
  > "Does this section look right?"

## Done Signal (Hard Exit Criteria)

All of the following must be true before producing final output:
- [ ] Understanding Lock confirmed
- [ ] At least one design approach explicitly accepted
- [ ] All major assumptions documented
- [ ] Key risks acknowledged
- [ ] Decision log complete

If any criterion is unmet — continue. Do not produce output.
