# CI — pnpm Monorepo

Load when `pnpm-workspace.yaml` is present. Goal: don't rebuild/redeploy every app on every push — only the ones that changed.

## Path filtering (no task orchestrator)

The stack is plain pnpm workspaces — no Turborepo/Nx affected-graph — so use path filters on triggers:

```yaml
on:
  push:
    branches: [main]
    paths:
      - 'apps/api/**'
      - 'packages/**'
```

Per-app workflows (`ci-api.yml`, `ci-web.yml`) each filter on their app's directory **plus** `packages/**` — a shared package change should retrigger every app that depends on it. This is coarser than true dependency-graph detection (a `packages/ui` change retriggers the API too, even if unused there), but matches the no-orchestrator decision — precise affected-detection needs Turborepo/Nx, which is out of scope.

If this coarseness becomes a real cost (frequent unnecessary rebuilds), that's a signal to revisit the no-task-orchestrator decision — surface it, don't silently add `turbo` to solve a CI problem.

## Shared install step

Quality gates and builds both need `pnpm install` at the workspace root, even when testing/building a single app:

```yaml
steps:
  - uses: actions/checkout@v4
  - uses: pnpm/action-setup@v4
  - uses: actions/setup-node@v4
    with:
      node-version: 22
      cache: pnpm
  - run: pnpm install --frozen-lockfile
  - run: pnpm --filter=<app-name> test
```

`cache: pnpm` (via `actions/setup-node`) caches the pnpm store keyed on the lockfile — the same store-cache principle as the Docker build, applied to the CI runner.

## Per-app jobs

```yaml
jobs:
  test-api:
    runs-on: ubuntu-latest
    steps: # ... pnpm install, pnpm --filter=api test

  build-api:
    needs: test-api
    # ... see targets/vps-docker.md — docker build -f apps/api/Dockerfile . (root context)
```

Each app's build job uses its own target file from `RULES.md`'s dispatch table — a frontend on `vps-docker` and a desktop app on `tauri-release` in the same repo get entirely different `build`/`push` steps, with the same `test` shape.
