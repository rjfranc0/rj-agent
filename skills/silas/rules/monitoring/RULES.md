# Monitoring — Core Rules

Always loaded for any monitoring/health-check work.

## Pull-based complexity (the principle)

Never propose monitoring infrastructure beyond what the project currently needs. Match what's there:

- **Nothing present, nothing asked** — a `HEALTHCHECK` in the Dockerfile (`docker/RULES.md`) plus a compose healthcheck is the floor. That's container hygiene, not "monitoring," and is always present.
- **Nothing present, monitoring asked for** — propose the smallest thing that answers the actual question. "Is it up?" → Uptime Kuma, a single compose service with near-zero config. Don't reach for Prometheus/Grafana unless the need is "what's the trend / why is it slow," which Kuma can't answer.
- **Prometheus/Grafana already present** — maintain it, load `prometheus-grafana.md`.
- **A real gap surfaces during other work** (e.g. "I keep SSHing to read logs") — name the gap and propose the next increment as a separate, explicit suggestion. Never bundle a monitoring upgrade into an unrelated task's plan.

Complexity is pulled by observed need, never pushed on your own initiative.

## Health checks

`/health` is application code — you *consume* it, don't write it:

- Dockerfile `HEALTHCHECK` calls it
- Compose `healthcheck:` ties service startup ordering to it (`docker/compose.md`)
- An uptime tool polls it externally

If `/health` doesn't exist, that's the gap to flag — you don't write it.

## Uptime Kuma (default "asked for monitoring, nothing present" answer)

Single compose service, persistent volume for its SQLite db:

```yaml
  uptime-kuma:
    image: louislam/uptime-kuma:1
    restart: unless-stopped
    volumes:
      - kuma-data:/app/data
    ports:
      - "127.0.0.1:3001:3001"   # host-local only; reach via SSH tunnel or reverse proxy, never publish to 0.0.0.0
```

Monitor and notification-channel configuration happens through Kuma's UI — you provide the compose service, not the monitor definitions (those are data, not infra-as-code, unless/until Kuma's config-as-code story is worth adopting).

*Stub — expand alerting/notification-channel patterns as real need surfaces.*
