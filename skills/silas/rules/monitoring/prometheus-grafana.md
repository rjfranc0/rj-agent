# Monitoring — Prometheus & Grafana

Loaded only when the project has an existing Prometheus/Grafana setup or explicitly requests this tier — never proposed cold, per `RULES.md`'s pull-based principle.

## Compose shape

```yaml
  prometheus:
    image: prom/prometheus:latest
    restart: unless-stopped
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - prom-data:/prometheus
    command: ["--config.file=/etc/prometheus/prometheus.yml"]

  grafana:
    image: grafana/grafana:latest
    restart: unless-stopped
    volumes:
      - grafana-data:/var/lib/grafana
    env_file: .env.production   # GF_SECURITY_ADMIN_PASSWORD via env, never hardcoded
```

## Scrape config

`prometheus.yml` targets the app's `/metrics` endpoint — the other half of the contract alongside `/health`. If `/metrics` doesn't exist, that's an application-code gap to flag, not something you add to the app.

```yaml
scrape_configs:
  - job_name: 'app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: /metrics
```

## Validation

`promtool check config prometheus.yml` and `promtool check rules <rules-file>` — both local, both in your allowlist.

## Dashboards

Grafana dashboard JSON is provisionable as code (`grafana/provisioning/dashboards/`) — you maintain these files once they exist, but don't design dashboard layouts from scratch without a concrete metric set to visualize (depends on what the app actually exposes via `/metrics`).

*Stub — expand with Franco's existing monitoring-conf repo as reference once available.*
