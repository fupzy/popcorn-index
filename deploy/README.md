# Popcorn Index — Deployment

A 4-service Docker stack. A single container (`proxy`) is exposed on the host; the host's
nginx reverse proxy terminates TLS and forwards the domain to that port.

## Architecture

```
[ host nginx: TLS + domain ]  ──►  127.0.0.1:HTTP_PORT
                                          │
                                   [ proxy: nginx ]
                                     ├─ /popcorn-index/*  →  api:8080  (prefix stripped)
                                     └─ /                 →  ui:80     (Angular SPA)
                                          │
                                   [ api: .NET 10 ]  ──►  db:5432  (EF migrations at boot)
                                   [ db: postgres 15 ]    pgdata volume, popcorn_index schema
```

- `api`, `ui`, `db` remain **internal** to the Docker network; only `proxy` publishes `HTTP_PORT`.
- The browser calls the API with a relative path `/popcorn-index/*`; the `proxy` container strips
  the prefix (the API serves `api/v{n}/...`). The host therefore has no `/popcorn-index` rule to manage.

| File                                | Role                                            |
| ----------------------------------- | ----------------------------------------------- |
| `docker-compose.yml`                | Orchestrates `db`, `api`, `ui`, `proxy`         |
| `proxy.conf`                        | nginx for the `proxy` container (API vs UI routing) |
| `api.Dockerfile` / `ui.Dockerfile`  | API (.NET 10) and UI (Angular → nginx) images   |
| `nginx.conf`                        | nginx for the `ui` container (SPA only)         |
| `.env.example`                      | Environment variable template                   |

## Environment variables

| Variable                                              | Required | Description                                                               |
| ----------------------------------------------------- | :------: | ------------------------------------------------------------------------- |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` |    no    | Application credentials (the image creates user + database on first boot) |
| `JWT_KEY`                                             | **yes**  | JWT signing key — `openssl rand -base64 64`                               |
| `TMDB_API_KEY`                                        | **yes**  | TMDB v3 key proxied by the backend                                        |
| `HTTP_PORT`                                           |    no    | Host port for the `proxy` container (default 8080)                        |

> The Postgres password is baked into the `pgdata` volume on the **first** startup. To
> change it later, you must start from an empty volume (`docker compose down -v`).

## Deployment

### 1. Code + variables

```bash
git clone https://github.com/fupzy/popcorn-index.git /opt/popcorn-index
cd /opt/popcorn-index
cp deploy/.env.example deploy/.env
echo "JWT_KEY=$(openssl rand -base64 64 | tr -d '\n')" >> deploy/.env
nano deploy/.env          # TMDB_API_KEY, POSTGRES_PASSWORD, HTTP_PORT
chmod 600 deploy/.env
```

### 2. Build + run

```bash
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build
docker compose -f deploy/docker-compose.yml logs -f
```

The first build is long (.NET SDK + npm). EF migrations are applied when the API starts
(`MIGRATE_DATABASE=true`). The services have `restart: unless-stopped` → automatic restart on reboot.

### 3. nginx reverse proxy (host) + certbot

Real-world example: domain `popcornindex.socoolmen.me`, `HTTP_PORT=8087`.

`/etc/nginx/sites-available/popcornindex.socoolmen.me`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name popcornindex.socoolmen.me;

    location / {
        proxy_pass http://127.0.0.1:8087;
        proxy_http_version 1.1;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 10m;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/popcornindex.socoolmen.me /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

Verify that DNS points to the server (`dig +short popcornindex.socoolmen.me`) **before**
running certbot, then issue the certificate — the nginx plugin adds the TLS block + the
HTTP→HTTPS redirect automatically:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d popcornindex.socoolmen.me \
  --redirect --agree-tos -m <mail> --no-eff-email
```

Auto-renewal via the systemd timer: `sudo certbot renew --dry-run`.

> Keep `HTTP_PORT` reachable only locally (nginx runs on the same machine): the
> firewall only opens 80/443, and ideally the docker port is bound to `127.0.0.1`.

## Operations

```bash
# Logs / status
docker compose -f deploy/docker-compose.yml logs -f api
docker compose -f deploy/docker-compose.yml ps

# Update
git pull
docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build
docker image prune -f

# End-to-end check (TMDB key OK if JSON is not empty)
curl -s "http://localhost:${HTTP_PORT:-8080}/popcorn-index/api/v1/tmdb/search/movie?query=matrix" | head

# One-off backup
docker compose -f deploy/docker-compose.yml exec -T db \
  pg_dump -U popcorn popcorn | gzip > popcorn-$(date +%F).sql.gz
```
