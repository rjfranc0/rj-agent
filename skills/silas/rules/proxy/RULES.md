# Reverse Proxy — nginx + certbot

Lazy-loaded — only when reverse proxy, nginx, TLS/SSL, or domain routing is requested. Not part of the greenfield default; pulled on request like the rest of `monitoring/`.

## Two shapes this covers

- **Sidecar in an app repo**: nginx + certbot run alongside the app in the same compose file, terminating TLS for that one app.
- **Dedicated proxy repo**: the whole project *is* the proxy layer — nginx + certbot routing to one or more app services that live in other compose projects on the same host. nginx joins those projects' networks as `external`.

Same compose shape and server-block template either way; the difference is just which network the upstream lives on.

## Compose shape

```yaml
services:
  nginx:
    image: nginx:1.27-alpine
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./conf.d:/etc/nginx/conf.d:ro
      - certbot-webroot:/var/www/certbot:ro
      - certbot-certs:/etc/letsencrypt:ro
    networks:
      - proxy-net
      - app-net          # external: true if the app lives in another compose project

  certbot:
    image: certbot/certbot
    restart: unless-stopped
    volumes:
      - certbot-webroot:/var/www/certbot
      - certbot-certs:/etc/letsencrypt
    entrypoint: >
      sh -c 'trap exit TERM; while :; do
        certbot renew --webroot -w /var/www/certbot;
        sleep 12h & wait $${!};
      done'

volumes:
  certbot-webroot:
  certbot-certs:

networks:
  proxy-net:
  app-net:
    external: true        # omit external/name if the app is in this same compose file
```

`ports: ["80:80", "443:443"]` on the nginx service **is** the reverse-proxy-facing port from `docker/compose.md`'s port-binding rule — every other service in the topology stays internal.

## Certbot — initial issuance

The self-renewing loop above handles ongoing renewal, but the **first** certificate requires the domain to already resolve to the VPS and port 80 to be reachable — that's a one-time command the human runs on the VPS, not something validated locally:

```bash
docker compose run --rm certbot certonly --webroot -w /var/www/certbot -d example.com -d www.example.com
docker compose exec nginx nginx -s reload
```

Document this in the plan's human-follow-up section, same as VPS secrets/setup steps for `vps-docker`.

## Server block template

One file per domain in `conf.d/`. HTTP server handles the ACME challenge and redirects everything else; HTTPS server does the actual proxying.

```nginx
server {
    listen 80;
    server_name example.com www.example.com;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name example.com www.example.com;

    ssl_certificate     /etc/letsencrypt/live/example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/javascript application/xml image/svg+xml;

    location /health {
        access_log off;
        proxy_pass http://app:3000/health;
    }

    # Internal only — never expose metrics through the public proxy
    location /metrics {
        deny all;
    }

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

`app:3000` is the upstream — the app's compose service name and port. Single upstream, no load-balancing block: one app instance per service at this scale. If that ever changes, that's a re-plan, not a silent upgrade to a weighted `upstream` block.

## What's deliberately left out

- **`proxy_cache`** — caching is an optimization with real invalidation complexity. Not added speculatively; if a specific endpoint needs it, that's a scoped addition then, not a default.
- **Rate limiting (`limit_req_zone`)** — same: add when there's an actual abuse pattern to respond to, not preemptively.
- **Multi-backend load balancing** — one app, one upstream. Revisit if the project actually scales to multiple instances.

## Validation

`nginx -t` against the config tree, without running the stack:

```bash
docker run --rm -v "$(pwd)/conf.d:/etc/nginx/conf.d:ro" nginx:1.27-alpine nginx -t
```

Local, no side effects — part of the standard validation pass.

## Monitoring tie-in

If `monitoring/prometheus-grafana.md` is loaded, nginx's `stub_status` can feed an exporter — but that's only relevant once that tier is active. Don't add `stub_status`/exporter config when nginx is being set up standalone.
