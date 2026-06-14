# Target: vercel (stub)

For a web app deployed to Vercel instead of the VPS — e.g. a marketing site or frontend with no server-side component worth running in Docker.

**Known shape** (for expansion): Vercel's GitHub integration often handles build/deploy natively without a custom workflow, or `vercel deploy` via CLI in a workflow step with `VERCEL_TOKEN`. Quality gates (lint/test) still run in `ci/RULES.md`'s shared job — Vercel only owns build+deploy.

Expand on first real use, same as `tauri-release.md`.
