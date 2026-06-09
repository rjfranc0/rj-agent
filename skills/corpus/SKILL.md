---
name: corpus
description: "Write, maintain, and audit functional and each technical domain (design, infra, data, implementation) documentation for a project. Use when bootstrapping docs from scratch, updating docs after code changes, writing targeted documentation, auditing doc quality, or rewriting messy docs. Triggers on: 'document this', 'bootstrap docs', 'update docs', 'audit my docs', 'rewrite docs', 'docs are outdated', 'are my docs good', 'write the spec for', 'no docs yet', 'docs are messy', 'clean up docs', or any request to create, update, or evaluate project documentation."
---

# Corpus

Generate, maintain, and audit structured project documentation designed as a lazy-loading reference graph — AI-first, token-optimized, and complete enough to serve as the cognitive model of the system.

## Core Philosophy

Docs are the cognitive model of the system. Code is the implementation detail.

A doc tree built with this skill should allow any AI agent to:
- Answer what the system does and why (functional)
- Answer how it works, what breaks if changed (technical)
- Implement a feature from an incomplete spec using doc context alone
- Act as an interactive wiki — without codebase access

## Step 1 — Detect Mode

Infer the mode from context. Present it for confirmation before doing anything else.

| Mode | Signal |
|---|---|
| **Bootstrap** | No `docs/` folder, or explicitly asked to start from scratch |
| **Update** | Code changed (feature, bugfix, refactor, config, schema) and docs need syncing |
| **Targeted** | User points at a specific module, feature, or domain to document |
| **Audit** | Docs exist, nothing changed — quality review requested |
| **Rewrite** | Docs exist and are messy, outdated structure, or reorganization needed |

Confirmation line:
> "Looks like [Mode] — [one-line reason]. Confirm?"

**Hard stop** (always confirm, never proceed without explicit yes): Bootstrap, Rewrite
**Soft stop** (confirm, proceed on no objection): Update, Targeted, Audit

## Step 2 — Load Rules

After mode is confirmed, load:
1. `rules/core/structure.md` — always
2. `rules/modes/<mode>.md` — matched to confirmed mode
3. Additional core files declared inside the mode file
4. `rules/domains/<domain>.md` — if the target domain is implementation, design, infra, or data

## Step 3 — Execute

Follow the mode file precisely. The mode file owns the workflow from this point.
