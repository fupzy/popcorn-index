# Popcorn Index — Deployment

All packaging and deployment material is centralized in this folder.

## Contents

| File                          | Purpose                                                                                             |
| ----------------------------- | --------------------------------------------------------------------------------------------------- |
| `docker-compose.yml`          | Orchestrates the three services (`db`, `api`, `ui`)                                                 |
| `api.Dockerfile`              | .NET 10 API image (multi-stage: SDK → ASP.NET runtime)                                              |
| `ui.Dockerfile`               | Angular app built then served by nginx                                                              |
| `nginx.conf`                  | nginx config for the `ui` container (SPA fallback + `/popcorn-index/*` reverse-proxy to `api:8080`) |
| `api.Dockerfile.dockerignore` | Build exclusions for the API image (read by BuildKit)                                               |
| `ui.Dockerfile.dockerignore`  | Build exclusions for the UI image                                                                   |
| `.env.example`                | Template for the required environment variables                                                     |

## Runtime architecture

```
[ Internet ]
     │
     ▼
[ ui : nginx :80 ]  ── serves the Angular SPA
     │                + reverse-proxies /popcorn-index/* to api:8080
     ▼
[ api : .NET 10 :8080 ]  ── ASP.NET Core
     │                     EF migrations applied at startup (MIGRATE_DATABASE=true)
     ▼
[ db : postgres 15 ]  ── `pgdata` volume, `popcorn_index` schema
```

The API is **not exposed** on the host; the frontend reaches it only through the internal Docker network. The browser uses the relative URL `/popcorn-index/*`, consistent with `ui/local.proxy.conf.json`.

## Prerequisites

- Docker Engine 24+ with BuildKit (enabled by default on recent Docker Desktop versions)
- Docker Compose v2 plugin (`docker compose ...`)

## Quick start

From the repo root (Windows PowerShell):

```powershell
Copy-Item deploy/.env.example deploy/.env
# Edit deploy/.env (at minimum JWT_KEY and the Postgres passwords)

docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build
```

Linux / macOS:

```bash
cp deploy/.env.example deploy/.env
$EDITOR deploy/.env

docker compose -f deploy/docker-compose.yml --env-file deploy/.env up -d --build
```

UI available at http://localhost:8080 (port configurable via `UI_PORT`).

### Useful commands

```bash
# Tail logs
docker compose -f deploy/docker-compose.yml logs -f api

# Rebuild + restart a single service
docker compose -f deploy/docker-compose.yml up -d --build api

# Stop
docker compose -f deploy/docker-compose.yml down

# Stop + drop the Postgres volume (data loss)
docker compose -f deploy/docker-compose.yml down -v
```

## Environment variables

See `.env.example`. Summary:

| Variable                                              | Required | Description                                               |
| ----------------------------------------------------- | :------: | --------------------------------------------------------- |
| `POSTGRES_ROOT_PASSWORD`                              |    no    | `postgres` superuser password (init only)                 |
| `POSTGRES_DB` / `POSTGRES_USER` / `POSTGRES_PASSWORD` |    no    | Application credentials (created by `database/init.sql`)  |
| `JWT_KEY`                                             | **yes**  | JWT signing key — generate with `openssl rand -base64 64` |
| `UI_PORT`                                             |    no    | Host port mapped to the `ui` container (default 8080)     |

The compose file injects these into the API using the `Section__Key` format recognized by .NET (e.g. `Jwt__Key`), which **overrides** values from `appsettings.json` — mandatory for `Jwt:Key`, since the default value lives in the public repo.

## Migrations

EF migrations are applied at API startup via `DatabaseMigrator<MigrationDbContext>` (triggered by `IBeforeRun` when `MIGRATE_DATABASE=true`). No separate job is needed.

To **disable** automatic migrations (e.g. when the environment is managed separately), remove `MIGRATE_DATABASE: "true"` from the `api` service in the compose file.

## Manual image build

```bash
docker build -f deploy/api.Dockerfile -t popcorn-index-api .
docker build -f deploy/ui.Dockerfile  -t popcorn-index-ui  .
```

The build context is always the **repo root** — both Dockerfiles need access to several sibling folders.

## Deploying on a Debian VPS — step by step

Target setup: a fresh Debian 12 VPS, a domain pointing to it, HTTPS via Let's Encrypt, the app built from sources directly on the VPS. Run everything below over SSH as a non-root sudoer.

### 1. Provision and harden the VPS

```bash
# As root, or via the provider's web console — create a sudo user
adduser deploy
usermod -aG sudo deploy

# Copy your SSH key to the new user (from your laptop)
ssh-copy-id deploy@<server-ip>

# Then on the server, disable root SSH + password auth
sudo sed -i 's/^#\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sudo sed -i 's/^#\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sudo systemctl reload ssh

# Firewall: only SSH + HTTP + HTTPS
sudo apt update && sudo apt install -y ufw
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. Install Docker

```bash
sudo apt install -y ca-certificates curl gnupg git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/debian/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/debian $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Use docker without sudo
sudo usermod -aG docker $USER
newgrp docker

# Make sure the daemon restarts on boot
sudo systemctl enable --now docker
```

### 3. Get the code on the server

```bash
sudo mkdir -p /opt/popcorn-index
sudo chown $USER:$USER /opt/popcorn-index
git clone https://github.com/<user>/popcorn-index.git /opt/popcorn-index
cd /opt/popcorn-index
```

### 4. Configure environment variables

```bash
cp deploy/.env.example deploy/.env
# Generate strong secrets
echo "JWT_KEY=$(openssl rand -base64 64 | tr -d '\n')" >> deploy/.env
# Edit the file to set POSTGRES_PASSWORD, POSTGRES_ROOT_PASSWORD, UI_PORT
nano deploy/.env
chmod 600 deploy/.env
```

### 5. Add a TLS reverse proxy in front of the stack

The current `ui` service listens on plain HTTP. To expose it to the internet on `https://app.example.com`, put **Caddy** in front — it handles Let's Encrypt automatically.

Create `/opt/popcorn-index/deploy/Caddyfile`:

```caddy
app.example.com {
    reverse_proxy ui:80
}
```

Create `/opt/popcorn-index/deploy/docker-compose.prod.yml` as a compose **override**:

```yaml
services:
  ui:
    # Stop publishing port 8080 on the host; only Caddy exposes the network
    ports: !reset []

  caddy:
    image: caddy:2-alpine
    restart: unless-stopped
    depends_on:
      - ui
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile:ro
      - caddy_data:/data
      - caddy_config:/config

volumes:
  caddy_data:
  caddy_config:
```

Point your DNS `A` record `app.example.com` to the VPS IP **before** starting, otherwise Let's Encrypt's HTTP-01 challenge fails.

### 6. First boot

```bash
cd /opt/popcorn-index
docker compose \
  -f deploy/docker-compose.yml \
  -f deploy/docker-compose.prod.yml \
  --env-file deploy/.env \
  up -d --build
```

First build takes a few minutes (.NET SDK + node_modules). Watch the logs:

```bash
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.prod.yml logs -f
```

Once Caddy logs say `certificate obtained successfully`, the app is live at `https://app.example.com`.

The compose services have `restart: unless-stopped`, so they come back up after a reboot — Docker's systemd unit handles that. No extra systemd unit needed.

### 7. Updating

```bash
cd /opt/popcorn-index
git pull
docker compose \
  -f deploy/docker-compose.yml \
  -f deploy/docker-compose.prod.yml \
  --env-file deploy/.env \
  up -d --build
docker image prune -f
```

EF migrations are applied automatically at API startup, so no extra step.

### 8. Postgres backups

Daily `pg_dump` to `/var/backups/popcorn`, kept 14 days. Run once to install:

```bash
sudo mkdir -p /var/backups/popcorn
sudo tee /etc/cron.daily/popcorn-backup > /dev/null <<'EOF'
#!/bin/bash
set -e
TS=$(date +%Y%m%d-%H%M%S)
cd /opt/popcorn-index
docker compose -f deploy/docker-compose.yml exec -T db \
  pg_dump -U popcorn popcorn | gzip > /var/backups/popcorn/popcorn-$TS.sql.gz
find /var/backups/popcorn -name 'popcorn-*.sql.gz' -mtime +14 -delete
EOF
sudo chmod +x /etc/cron.daily/popcorn-backup
```

For off-site copies, add a `rclone copy` line to the script pushing to Backblaze B2, OVH Object Storage, or any S3-compatible bucket.

### 9. Quick checks

```bash
# Services up
docker compose -f deploy/docker-compose.yml -f deploy/docker-compose.prod.yml ps

# API logs
docker compose -f deploy/docker-compose.yml logs --tail=100 api

# Tables created by the migrations
docker compose -f deploy/docker-compose.yml exec db \
  psql -U popcorn -d popcorn -c "\dt popcorn_index.*"
```

If the API loops on startup, the most common cause is Postgres credentials mismatching between `.env` and what `database/init.sql` created during the first volume init. Wipe the volume (`docker compose down -v`) and start over with the right values **before** the first boot — `init.sql` only runs on an empty data directory.
