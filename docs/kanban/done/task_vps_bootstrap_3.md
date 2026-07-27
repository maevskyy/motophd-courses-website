# Task 3 — VPS, домен, Cloudflare, TLS

**Depends on:** —
**Статус:** done (26.07.2026). Закрыта одним инфра-заходом вместе с task 4.

## Goal

Коробка принимает приложение: Docker, Caddy, домен через Cloudflare, честный TLS, hardening.

## Что сделано (факты)

- **VPS: OVH** (в черновике был Hetzner — по факту куплен OVH, для нас эквивалентно):
  Ubuntu 24.04, `ubuntu@145.239.76.139`, ssh-алиас `motophd` у Димы. Ядро/пакеты обновлены.
- **Hardening:** вход только по ключу (`PasswordAuthentication no`, `PermitRootLogin no` в
  `/etc/ssh/sshd_config.d/00-hardening.conf`), `ufw` active (22/80/443), `fail2ban` (sshd-jail),
  Docker + compose-plugin. `unattended-upgrades` — дефолт Ubuntu.
- **Cloudflare:** DNS A `@`, `www`, `grafana` → VPS, все **proxied** (origin-IP скрыт);
  SSL/TLS **Full (strict)**; **Origin Certificate** (15 лет, `motophd.com` + `*.motophd.com`)
  лежит на боксе в `~/motophd/certs/`; Always Use HTTPS включён.
- **Caddy** ([deploy/Caddyfile](../../../deploy/Caddyfile)): терминация TLS origin-сертом;
  `motophd.com`+`www` → `app:3000`; `grafana.motophd.com` → `grafana:3000`; gzip.
- **Прод-компоуз** ([deploy/docker-compose.prod.yml](../../../deploy/docker-compose.prod.yml)):
  `postgres` (volume, healthcheck, без внешнего порта) + `app` (образ из GHCR, наружу только
  `127.0.0.1:3000`) + `caddy` (80/443) + `grafana` (пароль из env). Placeholder не понадобился —
  сразу реальное приложение (task 4 тем же заходом).
- Конфиги на боксе: `~/motophd/` (compose, Caddyfile, `.env`, certs). Обновляются **scp вручную**;
  после правки Caddyfile нужен `docker compose restart caddy` (перечитывает конфиг только на старте).

## Отклонения от черновика

- `admin.motophd.com` + `/admin*`→404 + Cloudflare Access — **не сделано**, вынесено в
  [task_infra_leftovers_13](../../tbd/task_infra_leftovers_13.md). Пока админка на
  `motophd.com/admin` за логином Payload (первый админ создан — Дима).

## Acceptance (проверено 26.07)

- `https://motophd.com`, `https://www.motophd.com`, `https://grafana.motophd.com` — отвечают,
  TLS валиден; `dig` отдаёт Cloudflare-IP, origin не светится.
- SSH по паролю отклоняется (`Permission denied (publickey)`); `ufw status` active;
  fail2ban банит (3 IP за первые полчаса жизни сервера).
- `docker ps` — postgres/app healthy, caddy/grafana up.

## References

- [ARCHITECTURE.md — Топология](../../ARCHITECTURE.md) · ADR-2, ADR-3 в [DECISIONS.md](../../DECISIONS.md)
- Хвосты: [task_infra_leftovers_13](../../tbd/task_infra_leftovers_13.md)
