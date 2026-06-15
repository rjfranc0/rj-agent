# Target: vps-docker

Default target. Build a Docker image, push to GHCR, deploy to a VPS via SSH + docker compose. The only fully-specified target — others are stubs.

## Build & push job

```yaml
  build:
    needs: quality
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v6
        with:
          context: .
          file: ./Dockerfile          # apps/<name>/Dockerfile in a monorepo
          push: true
          tags: |
            ghcr.io/${{ github.repository }}:latest
            ghcr.io/${{ github.repository }}:sha-${{ github.sha }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

`GITHUB_TOKEN` is sufficient for GHCR push within the same repo/org — no separate registry secret needed. `cache-from`/`cache-to: type=gha` uses GitHub's Actions cache for Docker layer caching across runs (see `docker/optimization.md`).

## Deploy job (human-gated)

```yaml
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: production   # requires manual approval if configured in repo settings
    steps:
      - uses: appleboy/ssh-action@v1
        with:
          host: ${{ secrets.VPS_HOST }}
          username: ${{ secrets.VPS_USER }}
          key: ${{ secrets.VPS_SSH_KEY }}
          script: |
            cd /opt/<app-name>
            docker compose pull
            docker compose up -d
            docker image prune -f
```

If using `workflow_dispatch` instead of an environment gate, set the trigger on this job's workflow accordingly — pick one mechanism per `ci/RULES.md`'s Deploy gate section, don't layer both.

## Required secrets (document these, never set values)

| Secret | Contains |
|---|---|
| `VPS_HOST` | VPS hostname or IP |
| `VPS_USER` | SSH user for deploys |
| `VPS_SSH_KEY` | Private key for `VPS_USER` — ideally a deploy-only key restricted to `docker compose` via a forced command; note as a hardening suggestion, not a requirement |

`GITHUB_TOKEN` is automatic, no setup needed.

## VPS-side setup (human, not you)

You write the workflow and compose file; the human provisions the VPS:

- Docker + docker compose installed
- `/opt/<app-name>/docker-compose.yml` and `.env.production` present — you write the compose file content; the human places `.env.production` with real values — you never see or write real secret values
- The deploy SSH key's public half added to the VPS user's `authorized_keys`
- GHCR pull access — none needed for public images; for private images, `docker login ghcr.io` on the VPS with a PAT, a secret the human manages on the VPS side, outside this repo

Your Phase C plan and Phase D report both surface this list — it's the "human follow-up" half of every `vps-docker` plan.
