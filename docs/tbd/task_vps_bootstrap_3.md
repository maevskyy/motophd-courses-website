# Task 3 — VPS, домены, Cloudflare

**Depends on:** — (параллельно task 1)
**Goal:** Коробка готова принять приложение: Docker, Caddy, домены через Cloudflare, админ-поверхности за Access.

## Scope

- Hetzner VPS (~4 vCPU / 8 GB): не-root пользователь, ssh-ключи, отключён password-login, ufw (22/80/443), fail2ban, unattended-upgrades, Docker + compose.
- Cloudflare: DNS `motophd.com`, `admin.`, `grafana.` (proxied), SSL Full (strict) + origin-сертификат.
- Прод `docker-compose.yml` (пока: caddy + postgres + placeholder-app; app-сервисы дополнятся в task 4).
- Caddy: `motophd.com` → app-site c блоком `/admin*` (404); `admin.motophd.com` → app-admin; `grafana.motophd.com` → grafana.
- Cloudflare Access: политики на `admin.*` и `grafana.*` (email-allowlist: Дима, Аня).
- Postgres: volume, healthcheck, пароль из env.

## Acceptance criteria

- Домены резолвятся через CF-прокси (origin-IP скрыт), TLS валиден.
- `https://motophd.com/admin` → 404; `admin.motophd.com` без прохождения Access не открывается.
- SSH только по ключу; ufw активен.

## Out of scope

- Деплой приложения (task 4), мониторинг (task 7), бэкапы (task 8).

## References

- [ARCHITECTURE.md — Топология](../../ARCHITECTURE.md#топология) · ADR-1, ADR-2 в [DECISIONS.md](../../DECISIONS.md)
