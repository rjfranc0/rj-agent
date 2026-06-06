# rj-agent

Franco's personal AI agent config — behaviors and skills managed by [lore](https://github.com/rjfranco/lore-repo).

## Behaviors

| Name | Purpose |
|---|---|
| `planning` | Rules for before starting work (planning, questions, assumptions) |
| `coding` | Rules while coding (style, tool use, comments, secrets) |
| `post-work` | Rules after finishing (review, memory, commits gate) |
| `commits` | Conventional commit format and types |

## Setup

```bash
cd behaviors
lore behavior add planning coding post-work commits
```
