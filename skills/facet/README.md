# facet

> **Depth is where we eat. Type is what we eat.**

A universal thinking partner that turns raw ideas into clear, validated pictures — before any implementation begins. Works for any domain: code, product, business, infra, AI skills, random thoughts.

Replaces [`grill-me`](https://github.com/mattpocock/skills/blob/main/skills/productivity/grill-me/SKILL.md) and [`brainstorming`](https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/brainstorming/SKILL.md). Their logic lives here.

## What it does

1. You give it any idea — vague or specific, big or small
2. It reads context, infers **tier + type + likely output**
3. It confirms: *"Treating this as [light/medium/deep] [type] — I'd produce [output]. Sound right?"*
4. Your response locks or overrides the mode
5. It questions, challenges, and shapes — then produces a clear artifact or hands off to the right skill

---

## Three Tiers

| Tier | Stakes | Style | Decision Log | Output |
|---|---|---|---|---|
| **Light** | Low, reversible | `grill-me` pace — fast, sharp, opinionated | None | Summary, framing, rough next step |
| **Medium** | Moderate | Conversational → light structure | None | Description + goals + rough plan |
| **Deep** | High, costly to reverse | Full structure, gates, stress-testing | Yes | Spec, ADR, issue, design doc, business case |

Tiers are **fluid**. A light session escalates naturally if complexity surfaces. The skill follows, never forces.

## Folder Structure

```
facet/
├── SKILL.md                        # Core behavior + router
├── README.md                       # This file
├── rules/
│   ├── depth/
│   │   ├── light.md                # Fast, conversational, minimal structure
│   │   ├── medium.md               # Purposeful, light structure, type-aware
│   │   └── deep.md                 # Full structure, hard gates, decision log
│   └── types/
│       ├── feature/
│       │   └── RULES.md
│       ├── business/
│       │   └── RULES.md
│       ├── infra/
│       │   └── RULES.md
│       ├── ai-skill/
│       │   └── RULES.md
│       ├── code-project/
│       │   └── RULES.md
│       └── misc.md                 # Fallback for uncategorized ideas
```

## Separation of Concerns

- **Depth rules** → how the conversation runs (pace, structure, gates, challenge intensity, done signal)
- **Type rules** → what gets asked (domain questions, preferred output, which skills to call)

They stack. Type never overrides depth.

## Loading Model

- **Depth file** → loaded at tier confirmation (shapes the conversation immediately)
- **Type file** → loaded once the idea is classifiable (usually 2–3 questions in)
- **Type ambiguity** → dominant type loaded, overlap flagged: *"This reads mostly as a feature, but there's an infra angle. Want me to factor that in?"*

## Handoff Model

When output requires another skill:
- The type file declares intent and what to emphasize
- `facet` builds a structured, skill-aware summary (not raw history)
- The summary is shaped for the target skill — `issue-writer` needs different emphasis than `write-spec`
- Called skills handle actual artifact generation — `facet` facilitates, doesn't author

## Key Principles

- One question at a time, always with a recommendation
- Infer + confirm — never make the user configure the tool
- User intent always wins over inference
- Challenge assumptions at deep tier — don't just nod along
- YAGNI ruthlessly — no speculative features, no future-proofing
- Propose completion — never silently stop
- Hard gates only at deep tier. You always have final word.

## Adding a New Type

1. Create `rules/types/<name>/RULES.md`
2. Define: domain questions, preferred output per tier, skills to call, handoff emphasis
3. Add the entry to the router table in `SKILL.md`

The skill picks it up immediately — no other changes needed.
