# rj-agent

Franco's personal AI agent config — behaviors and skills managed by [lore](https://github.com/rjfranco/lore-repo).

## Behaviors

| Name | Purpose |
|---|---|
| `core` | Non-negotiables: precedence, security, secrets, destructive ops |
| `communication` | Style and solution-framing rules |
| `planning` | Rules for before starting work (planning, questions, assumptions) |
| `coding` | Rules while coding (style, tool use, comments, secrets) |
| `post-work` | Rules after finishing (review, memory, commits gate) |
| `commits` | Commit discipline and Conventional Commits format |

## Setup

```bash
cd behaviors
lore behavior add core communication planning coding post-work commits
```
