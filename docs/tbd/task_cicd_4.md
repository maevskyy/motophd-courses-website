# Task 4 — CI/CD: чеки, образ, деплой-кнопка

**Depends on:** 1, 3
**Goal:** PR прогоняет проверки; образ собирается в CI; деплой и откат — кнопкой в GitHub Actions.

## Scope

- `ci.yml`: на PR — lint, typecheck, unit/component; e2e — на merge в main (или nightly).
- `build.yml`: на push в main — Docker-образ → GHCR, теги `sha` + `latest`.
- `deploy.yml`: `workflow_dispatch` с input `tag` (default latest) — по SSH на VPS: pull образа, `docker compose up -d app-site app-admin`, миграции, healthcheck `/api/health`; при провале healthcheck — не переключать (выход с ошибкой).
- Rollback = запуск `deploy.yml` с предыдущим тегом; процедура описана в README.
- `main` защищён: PR + зелёный CI обязательны.
- Секреты в GitHub Secrets (SSH-ключ деплоя, env приложения — через `.env` на VPS).

## Acceptance criteria

- PR с падающим тестом не мержится.
- Кнопка Run workflow выкатывает свежий образ на прод; сайт и админка отвечают.
- Деплой предыдущего тега возвращает прошлую версию (проверено руками).
- В `AGENTS.md`/README описан флоу деплоя для Ани (скриншот-инструкция «куда нажать»).

## Out of scope

- Preview-окружения, автодеплой на push (осознанно: деплой только ручной).

## References

- ADR-5 в [DECISIONS.md](../../DECISIONS.md) · [ARCHITECTURE.md — Окружения](../../ARCHITECTURE.md#окружения-и-деплой)
