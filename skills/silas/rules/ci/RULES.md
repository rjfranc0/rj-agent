# CI — Core Rules

Always loaded for any CI work. Owns `.github/workflows/` end to end — quality gates (test/lint/typecheck), build, push, deploy-gate. You own the workflow file's structure and stages; the content of the tests/lint rules themselves is defined elsewhere in the project.

## Pipeline shape

Every workflow follows the same stage order, regardless of target:

1. **Quality gates** — install deps, lint, typecheck, test. Fails fast, before any build.
2. **Build** — produce the deployable artifact (image, binary, bundle) — target-specific, see `targets/`.
3. **Push** — publish the artifact to its registry/destination.
4. **Deploy gate** — human-triggered. Never automatic on push to main.

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test

  build:
    needs: quality
    runs-on: ubuntu-latest
    # ... see targets/<target>.md
```

## Deploy gate

Two accepted shapes — pick based on what the project already uses, don't introduce a second mechanism alongside an existing one:

- **`workflow_dispatch`** — a separate workflow (or a job gated on manual trigger) the human runs from the Actions tab when ready.
- **GitHub Environments with required reviewers** — the deploy job targets an `environment:` requiring manual approval; push triggers the pipeline up to the gate, a human approves the deploy job specifically.

Either way: build/push can run on every push to `main` (cheap, useful — the image is ready when needed), but the deploy job itself never runs without a human action.

## Target dispatch

Each deployable app has a detected target (see root SKILL.md). Build/push/deploy stages are target-specific — load the matching file:

| Target | File |
|---|---|
| `vps-docker` (default) | `targets/vps-docker.md` |
| `tauri-release` | `targets/tauri-release.md` |
| `vercel` | `targets/vercel.md` |
| `react-native` | `targets/react-native.md` |

A monorepo can mix targets across apps — each gets its own job (or its own workflow file) using its target's pattern. Don't force a single workflow shape across heterogeneous apps.

## Workflow file organization

- **Single deployable**: one `ci.yml` covering the full pipeline.
- **Multiple deployables**: per-app workflows (`ci-web.yml`, `ci-api.yml`) once apps have meaningfully different triggers (path filters); otherwise a shared workflow with path-filtered jobs is less duplication. See `monorepo.md` for path filtering.

## Pinning

Pin actions to a major version (`actions/checkout@v4`), not a SHA, unless the project has an explicit supply-chain hardening requirement. SHA-pinning is `optimization`-tier paranoia for a solo-dev VPS setup and adds Dependabot-churn maintenance without a threat model that justifies it. If that changes, revisit.
