# Type: Agent Skill

A new skill or capability to be packaged as a reusable agent behavior definition.

## Domain Questions
- What should this skill enable the agent to do?
- When should it trigger — what user phrases or contexts activate it?
- What's the expected output format?
- Does a similar skill already exist? Is this an extension or a replacement?
- What are the inputs — what does the user provide?
- What are the failure modes — what should it explicitly not do?
- Does it delegate to other skills or external tools?
- Is the output objectively verifiable, or subjective?
- How complex is the workflow — is a single definition file enough, or does it need sub-files?

## Preferred Output
- **Light**: skill concept + trigger description + rough output format
- **Medium**: skill architecture — name, description, behavior summary, sub-file needs, delegation points
- **Deep**: full skill design document — behavior spec, file structure, loading model, delegation map, edge cases

## Output & Handoff
Handoff summary should emphasize: trigger contexts, expected output format, workflow steps, sub-file structure if any, and delegation points. Include the full understanding summary and decision log.

## Notes
Agent skill design is inherently recursive — use facet carefully here to avoid over-engineering. YAGNI ruthlessly.
