# CI — Release & Rollback

Loaded when rollback/release strategy is part of the request — not always-on, since most CI work is "make the pipeline work," not "plan for it failing."

## Tagging for rollback

Every image push tags with both `latest` and the commit SHA: `ghcr.io/org/app:sha-<short-sha>`. `latest` moves; the SHA tag is the rollback target and never gets overwritten.

```yaml
tags: |
  ghcr.io/${{ github.repository }}:latest
  ghcr.io/${{ github.repository }}:sha-${{ github.sha }}
```

## Rollback procedure (VPS/compose)

Rollback = repoint the compose file's image tag to a previous SHA and re-run the deploy step — the normal deploy path with a pinned tag instead of `latest`, not a separate "rollback workflow."

```bash
# On the VPS, via the deploy script with an image-tag parameter:
docker compose pull   # pulls the pinned sha if the tag is set to it
docker compose up -d
```

This is still a VPS-touching operation — you write the deploy script to *support* it (accept an image-tag input), but executing a rollback is the human's button, same as any deploy.

## Rollback checklist (write this into deploy docs/script comments — don't execute it)

- [ ] Previous SHA-tagged image still exists in GHCR — registry retention doesn't prune it too aggressively
- [ ] New release's database migrations are backward-compatible, or a migration rollback step exists
- [ ] `.env.production` hasn't changed in a way the previous image can't handle (new required env var)
- [ ] Healthcheck on the rolled-back container passes before traffic is considered restored

## Database migrations

If the deploy includes a migration step, it runs **before** the new container takes traffic, and should be additive/backward-compatible where possible — so the previous image keeps working during a rollback. This is structural: if the project's migration tooling doesn't support it, that's a database/application design concern — flag it, don't design around it silently.
