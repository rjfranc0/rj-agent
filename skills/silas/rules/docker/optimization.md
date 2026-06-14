# Docker — Optimization

Load when image size or build speed becomes an explicit concern, not by default. A working multi-stage build per `RULES.md` is the baseline; this file is for when that's not enough.

## BuildKit cache mounts

```dockerfile
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

Persists the package manager's download cache across builds without baking it into a layer — speeds up CI runners with cache wired up, and local iteration. Requires `# syntax=docker/dockerfile:1` and BuildKit (default on recent Docker/GHA).

For pnpm, see `monorepo.md` — same idea, scoped to the pnpm content-addressable store.

**Caveat**: cache mounts persist between builds of the same image on the same runner/host. On ephemeral GHA runners, the mount helps within a single build (parallel stages) but won't survive across workflow runs unless cache export/import is configured — see the registry cache note below.

## Image size

- **Distroless / scratch** for compiled binaries (Go, Rust) with no runtime deps — smallest attack surface. Not applicable to Node apps, which need a JS runtime.
- **Combine `RUN` layers** that belong together (`apt-get update && apt-get install -y x && rm -rf /var/lib/apt/lists/*` in one layer) — cleanup only shrinks the image if it's in the *same* layer as the install.
- **Audit what's copied into the production stage.** `COPY --from=build /app/dist` is precise; `COPY --from=build /app .` drags the whole build context including source, tests, and dev configs.

## Registry cache (CI)

`docker/build-push-action` supports `cache-from`/`cache-to` (`type=gha` or `type=registry`) — speeds up CI builds across workflow runs without a persistent runner. Concrete usage in `rules/ci/targets/vps-docker.md`.
