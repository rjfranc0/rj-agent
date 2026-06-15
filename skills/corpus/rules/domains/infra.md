# Domain: Infra

Supplements `writing.md` for documenting infrastructure, deployment, and operations.

## Scope

`docs/infra/` covers: environments, deployment pipelines, service topology, configuration, monitoring, and operational runbooks. It does not cover application code behavior — that belongs in `implementation/`.

## What a Complete Infra Doc Must Cover

**Environments**
- What exists (local, staging, production, etc.) and how they differ
- Configuration differences between environments — explicit, not implied
- Access requirements and who has them

**Service Topology**
- What services exist and what each one's responsibility is
- How services communicate — protocols, ports, auth between services
- External dependencies (third-party APIs, managed services) and what happens if they go down

**Deployment**
- How a change gets from code to production — full path
- Manual steps if any — flagged explicitly, never assumed known
- Rollback procedure — how and when to use it

**Configuration**
- What each significant config value controls
- Where it lives (env var, config file, secrets manager)
- What breaks if it is wrong or missing

**Monitoring and Alerts**
- What is being watched and why
- Alert conditions — what triggers them, what they mean
- First-response steps for each alert type

## Writing Rules (Infra-Specific)

**Failure modes are documented** — for every service and dependency, document what happens when it fails. An agent should know the blast radius before touching anything.

**Manual steps are flagged** — any step a human must do by hand is marked explicitly:
```markdown
> 🔧 **Manual step:** [what must be done and why it cannot be automated]
```

**Runbooks are actionable** — operational docs must be executable. No vague "check the logs" — specific commands, specific locations, specific conditions.

**Environment differences are explicit** — never say "same as staging except…" — state the difference directly. Implied parity is a source of incidents.

**Cross-reference implementation** — when infra config directly affects application behavior, reference it:
> See [@/implementation/payments/provider.md] for how this env var affects payment routing.

## Reference Directions

| Direction | Meaning |
|---|---|
| `infra → implementation` | Infrastructure config affects this application behavior |
| `implementation → infra` | This code depends on this infrastructure contract |
| `infra → data` | This service owns or depends on this data store |
| `functional → infra` | This business requirement has infrastructure implications |
