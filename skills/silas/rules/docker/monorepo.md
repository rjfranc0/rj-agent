# Docker — pnpm Monorepo

Load when `pnpm-workspace.yaml` is present and an app targeting `vps-docker` lives in the workspace. Source: [pnpm's official Docker guide](https://pnpm.io/docker).

## Base image

Either approach works:

- A standard Node image with `corepack` activating pnpm at a pinned version:

  ```dockerfile
  FROM node:22-slim AS base
  ARG PNPM_VERSION=9
  RUN corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
  ```

- `ghcr.io/pnpm/pnpm` — pnpm's official base image (`debian:stable-slim` with only the pnpm standalone binary, no bundled Node), if decoupling the pnpm and Node versions matters.

`corepack` is simpler for most projects; reach for the official image only if there's a concrete reason to pin them independently.

## Filtered install + pnpm deploy

Core pattern for a multi-app workspace: install the full workspace (so pnpm resolves internal package links), build the target app, then use `pnpm deploy` to produce a pruned, production-only directory containing just that app and its resolved dependencies — no sibling workspace packages, no devDependencies.

```dockerfile
FROM base AS build
WORKDIR /app
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    pnpm install --frozen-lockfile
RUN pnpm --filter=<app-name> build
RUN pnpm --filter=<app-name> deploy --prod /prod/<app-name>

FROM node:22-alpine AS production
WORKDIR /app
COPY --from=build /prod/<app-name> .
RUN addgroup -g 1001 -S app && adduser -S app -u 1001 -G app
USER app
CMD ["node", "dist/index.js"]
```

`pnpm deploy` resolves the target package's dependencies — including `workspace:*` deps, which it inlines as real packages — into a self-contained directory. The production stage copies *only* that directory: no monorepo root, no sibling apps, no shared `node_modules` bloat.

## Store cache mount

`--mount=type=cache,id=pnpm,target=/pnpm/store` persists pnpm's content-addressable store across builds — unchanged deps skip the network on re-install. Per pnpm's supply-chain guidance: scope cache mounts to mutually trusted builds. A store cache writable by an untrusted build (e.g. a fork's PR pipeline) shouldn't be reused by trusted main-branch builds — use separate cache IDs/scopes if CI runs untrusted PR code.

## Per-app Dockerfiles

Each deployable app gets its own Dockerfile (typically `apps/<name>/Dockerfile`), but the **build context is the monorepo root** — `docker build -f apps/<name>/Dockerfile .` from the root, so `pnpm install` can see the whole workspace. Document this in the CI workflow; the root `.dockerignore` applies to every app's build.
