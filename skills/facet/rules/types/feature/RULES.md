# Type: Feature

A new capability added to an existing product or codebase.

## Domain Questions
- What user problem does this solve — in the user's words?
- Where does it live in the existing product/codebase?
- Who triggers it, and how?
- What's the happy path?
- What are the edge cases and failure modes?
- What's the acceptance criteria — how do you know it's done?
- Does this touch any existing behavior? What breaks?
- What's the scope boundary — what is explicitly not part of this feature?

## Preferred Output
- **Light**: feature summary (1 paragraph + bullet list of scope)
- **Medium**: feature description + acceptance criteria + rough implementation notes
- **Deep**: before producing, ask the user — *"Do you need a spec, an issue, or both?"* — then produce accordingly

## Output & Handoff
At deep tier, produce the chosen artifact(s) then hand off with a summary emphasizing:
- For a spec: acceptance criteria, edge cases, scope boundaries, technical constraints
- For an issue: the user problem, success criteria, explicit non-goals — requirements-focused, not implementation
