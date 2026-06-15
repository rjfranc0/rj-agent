# Type: Infra

Infrastructure, DevOps, deployment, or system-level decisions.

## Domain Questions
- What system or service does this affect?
- What's the current state — what exists today?
- What's the failure mode if this goes wrong?
- What are the scale expectations (traffic, data volume, growth)?
- What are the availability / reliability requirements (uptime, RTO, RPO)?
- What are the security constraints?
- Who owns this in production — who gets paged?
- What's the rollback plan?
- What's the cost implication?
- Is this reversible? How hard to undo?

## Preferred Output
- **Light**: brief summary of the change + main tradeoff
- **Medium**: description + constraints + rollout approach + rollback plan
- **Deep**: start with an ADR (Architecture Decision Record), then ask the user — *"Do you also need a spec or an issue for tracking this change?"* — and produce accordingly.

## Output & Handoff
Handoff summary should emphasize: the decision being made, alternatives considered, constraints, failure modes, and rollback plan. For a tracking artifact, add: change scope, dependencies, rollback triggers.
If the prefered output is an issue, use the `brief` skill. However, note that this skill is an issue redactor, not a brainstormer, so make sure to give it the right context, the right instructions and summary to convert into an issue.

## Notes
Infra decisions are often high-stakes even when they seem simple. Default toward deep tier when reversibility is low.
