# VPS Runbook

Manual owner steps for the first production box.

## Server

- Provider: OVH VPS.
- OS: Ubuntu 24.04 LTS.
- User: `ubuntu`.
- SSH alias: `motophd`.
- App directory: `~/motophd`.

## Hardening

1. Confirm key-based SSH works before changing SSH settings.
2. Create a non-root sudo user if the provider only gave root.
3. Disable root/password SSH login:

   ```bash
   sudo sed -i 's/^#\\?PermitRootLogin .*/PermitRootLogin no/' /etc/ssh/sshd_config
   sudo sed -i 's/^#\\?PasswordAuthentication .*/PasswordAuthentication no/' /etc/ssh/sshd_config
   sudo systemctl reload ssh
   ```

4. Enable firewall:

   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   sudo ufw status
   ```

5. Install security basics:

   ```bash
   sudo apt update
   sudo apt install -y fail2ban unattended-upgrades ca-certificates curl
   sudo dpkg-reconfigure --priority=low unattended-upgrades
   ```

## Docker

Install Docker Engine and the compose plugin from Docker's official Ubuntu repository.

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "${UBUNTU_CODENAME:-$VERSION_CODENAME}") stable" |
  sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
sudo systemctl enable --now docker
```

Log out and reconnect after adding the user to the `docker` group.

Verify:

```bash
docker --version
docker compose version
docker info >/dev/null
```

## App Files

Create the app directory:

```bash
mkdir -p ~/motophd
```

Copy these files to `~/motophd`:

- `deploy/docker-compose.prod.yml` as `docker-compose.prod.yml`.
- `deploy/.env.prod.example` as `.env`, then replace every secret placeholder.

Production `.env` must include:

```bash
GHCR_IMAGE=ghcr.io/maevskyy/motophd
IMAGE_TAG=latest
POSTGRES_DB=motophd
POSTGRES_USER=motophd
POSTGRES_PASSWORD=...
DATABASE_URI=postgres://motophd:...@postgres:5432/motophd
PAYLOAD_SECRET=...
```

Generate secrets locally with:

```bash
openssl rand -hex 32
```

Use the hex value for `POSTGRES_PASSWORD` and insert the exact same value into
`DATABASE_URI`. Hex avoids URL-reserved characters. Generate `PAYLOAD_SECRET`
separately with the same command.

## GHCR Access

Create a GitHub PAT with `read:packages` and add it on the server:

```bash
echo '<GHCR_READ_TOKEN>' | docker login ghcr.io -u '<github-user>' --password-stdin
```

Also add GitHub repository secrets:

- `VPS_HOST`
- `VPS_USER`
- `VPS_SSH_KEY`
- `GHCR_READ_TOKEN`

## First Deploy

Run GitHub Actions workflow `Deploy` without a tag. Enable the `seed` input only
for the first deployment or when intentionally restoring the fixture content.

It will:

1. Verify required GitHub secrets and all VPS prerequisites before building.
2. Build the Docker image with the GitHub Actions layer cache.
3. Push `latest` and `sha-xxxxxxx` tags to GHCR.
4. Pull the image and start Postgres.
5. Apply Payload migrations.
6. Optionally run the idempotent seed.
7. Start the app and check `http://127.0.0.1/api/health`.

Verify on the server:

```bash
cd ~/motophd
docker compose -f docker-compose.prod.yml ps
curl -fsS http://127.0.0.1/api/health
```

## Manual Seed

The workflow applies migrations on every deployment. To seed manually:

```bash
cd ~/motophd
docker compose -f docker-compose.prod.yml run --rm app pnpm seed
```

Repeated seed runs must not create duplicates.

## Rollback

Open GitHub Actions workflow `Deploy`, click `Run workflow`, and pass an older image tag like:

```text
sha-1a2b3c4
```

The server should pull that tag and restart the app with the previous image.

## M2 / M3 Follow-Up

- M2: Cloudflare DNS, Caddy, HTTPS.
- M3: public `/admin` isolation, `admin.motophd.com` behind Cloudflare Access, migration button.
