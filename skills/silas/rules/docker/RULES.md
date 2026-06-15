# Docker — Core Rules

Always loaded for any app targeting `vps-docker`. Covers the Dockerfile itself — the CI pipeline that builds/pushes/deploys it lives in `rules/ci/targets/vps-docker.md`.

## Multi-stage builds

Every Dockerfile is multi-stage: a build stage with the full toolchain, a production stage with only runtime deps and built artifacts. Never ship dev dependencies, source, or build tools to production.

### Node version

Don't default to a fixed major version. Check, in order: `.nvmrc`, `package.json`'s `engines.node`, then the README/docs. Use that major version for every `FROM node:<version>-...` in the file — base, build, and production stages must match. If none specify a version, say so explicitly and ask, rather than picking one.

Baseline for a single-app Node project (monorepo variant in `monorepo.md`):

```dockerfile
# syntax=docker/dockerfile:1
FROM node:22-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM deps AS build
COPY . .
RUN npm run build

FROM base AS production
ENV NODE_ENV=production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist

RUN addgroup -g 1001 -S app && adduser -S app -u 1001 -G app
USER app

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node dist/healthcheck.js || exit 1

EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Adjust the production stage's `CMD`/runtime to the app's actual entrypoint — don't fabricate one. If the project has no healthcheck script, that's an instrumentation gap: flag it, don't write app code to fill it.

## Security baseline

- **Pin base image versions.** `node:22-alpine`, never `:latest` — reproducibility matters more than always-fresh.
- **Non-root user, explicit UID/GID.** `addgroup -g 1001 -S app && adduser -S app -u 1001 -G app`, then `USER app`. Never run as root in production.
- **Minimal base.** `-alpine` or `-slim` unless the app needs glibc-specific tooling. Distroless is `optimization.md`-tier, not the default.
- **No secrets in layers.** Never `COPY .env*`, never pass a secret value via `ARG` (build args are visible in image history). Runtime config is injected via env vars at `docker run`/compose time — see the root SKILL.md's Secrets section.
- **`COPY --chown`** instead of a separate `chown` layer when copying as the non-root user.

## .dockerignore

Every Dockerfile gets a matching `.dockerignore`. Baseline:

```
node_modules
**/dist
**/.next
.git
.env*
!.env.example
*.md
!README.md
.vscode
.idea
coverage
*.log
```

Adjust per project, but `node_modules`, `.git`, and `.env*` (except `.env.example`) are non-negotiable — the first two bloat the build context, the last one is a secrets leak.

## Healthcheck

Every production image declares a `HEALTHCHECK`. It's the foundation `rules/monitoring/RULES.md` and the compose layer build on (startup ordering, uptime checks). If the app has no `/health` endpoint or healthcheck script, that's an instrumentation contract gap — flag it, don't write it.

## Layer ordering

Order instructions from least-to-most frequently changing: base image → system deps → lockfile + install → source copy → build. This keeps the dependency-install layer cached across most code changes. Deeper cache strategies (BuildKit mounts, registry cache) live in `optimization.md`.
