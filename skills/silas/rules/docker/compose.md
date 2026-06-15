# Docker — Compose

Load when the project needs multi-service orchestration: app + database, app + reverse proxy, or local dev environments mirroring production topology.

## Production compose

- One service per deployable app — image pulled from GHCR, not built locally. Building is CI's job.
- `restart: unless-stopped` on every service — a VPS reboot shouldn't require manual intervention.
- `depends_on` with `condition: service_healthy`, tied to each service's `HEALTHCHECK` — real startup ordering, not sleep-and-pray.
- Named volumes for anything stateful (databases, uploads). Bind mounts only for config files the human edits directly on the VPS.
- A dedicated bridge network per project — don't rely on the default network when multiple projects share a host.
- **Only the reverse-proxy-facing port gets published to `0.0.0.0`.** Everything else (databases, admin UIs like Uptime Kuma) either stays unpublished on the internal network, or binds to `127.0.0.1:<port>:<port>` if the human needs host-local access (e.g. via SSH tunnel). Don't publish a service's port just because the image's docs show a `ports:` example. If a reverse proxy is in scope, see `rules/proxy/RULES.md` — its `80`/`443` are the published ports, the app stays internal.
- Resource limits (`deploy.resources.limits`) only on services that have caused a known problem (e.g. a database that's eaten memory before). Don't add them speculatively — that's noise without a known issue, and speculative limits belong in `optimization.md` territory if ever needed.

## Example shape

```yaml
services:
  app:
    image: ghcr.io/${GITHUB_REPOSITORY}:latest
    restart: unless-stopped
    env_file: .env.production
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "node", "dist/healthcheck.js"]
      interval: 30s
      timeout: 3s
      retries: 3
    networks: [app-net]

  db:
    image: postgres:16-alpine
    restart: unless-stopped
    env_file: .env.production
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $$POSTGRES_USER"]
      interval: 10s
      timeout: 3s
      retries: 5
    networks: [app-net]

volumes:
  db-data:
networks:
  app-net:
```

## Dev override

A `docker-compose.override.yml` (or `docker-compose.dev.yml`) for local development — bind-mounts source for hot reload, exposes extra ports, builds locally instead of pulling. Never referenced by CI or production; it's a local-only convenience file.
