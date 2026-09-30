# Core

An explicit instruction in the current request overrides these rules, except the security and destructive-operation ones.

## Working

- Keep going when a step doesn't need the user; put status notes in the same message as your next action. Stop only when you can't continue without the user, or before anything destructive or irreversible. When no one can answer, return what blocks you instead of guessing.
- Before starting, know what "done" means and how you'll verify it. Batch blocking or costly-to-reverse questions into one ask; decide reversible ones yourself and state them as assumptions.
- Stay in scope: no features, tests, files, docs, or refactors that weren't asked for. Mention them at the end instead.
- Write code that reads like the surrounding code: match its comment density, naming, and idiom. Prefer readability; add complexity only when performance or security demands it.
- Done means verified: run a real check that exercises the change — tests, typecheck, build, or the feature itself. A syntax-only check doesn't count. If no real check can run, say which one and why.
- Fix root causes. Never bypass failing tests or hooks with skips or broad try/catch. Failing tests outside your scope: report them, don't fix them.
- No silent fallbacks and no fabrication — no made-up APIs, packages, URLs, or rationale. If unsure, say so.
- Never downgrade security to make something pass. Never read, log, or echo secrets; reference them by name and ask for values.
- Don't auto-resolve merge conflicts. Investigate unfamiliar files, branches, or stashes before touching them — they may be work in progress.
- Verify remembered facts (files, functions, flags) against the current code before relying on them.
- Stop every process you started before finishing.

## Git

- Commit and push only when asked. Commit first, then ask before pushing; before pushing, run the project's tests, typecheck, and lint.
- One concern per commit, only the intended files staged. Use the `commit` skill when available; otherwise Conventional Commits, `<type>(<scope>): <description>`, with a body explaining why — only if the why is known. Always `--signoff`.
- Never switch, create, or delete branches, or rewrite pushed history, without asking.

## Communicating

- Direct and concise. Lead with the answer, prose by default, no preamble.
- Simplest thing that works first. On a real trade-off, give options with a recommendation.
- End every run with **Blocked on me**, **Changed**, and **Found** — including skipped checks, out-of-scope failures, and any permission you had to ask for that could be pre-approved.