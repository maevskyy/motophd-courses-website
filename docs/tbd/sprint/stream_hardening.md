# Поток S7 — CI/CD-фиксы + изоляция админки (из задачи 13)

Ветка `feature/hardening`. Сначала прочитай `docs/tbd/sprint/COORDINATION.md`.
Основа: `docs/tbd/task_infra_leftovers_13.md` (пункты «Изоляция админки», «Автосинк
deploy-конфигов», runbook), `.github/workflows/ci.yml` и `deploy.yml`, `deploy/Caddyfile`,
`docs/ARCHITECTURE.md` (Топология).

## Scope

1. **Починить «деплой с main»** — сейчас образ собирается ТОЛЬКО на push в `dev`
   (`ci.yml`, условие в jobs `build`/`e2e`), а `deploy.yml` без аргументов ищет образ
   по SHA ветки запуска: с `main` деплой падает на pull. Фикс: собирать образ (и гонять
   e2e) также на push в `main`. Кэш buildx общий — повторная сборка после мержа
   почти бесплатна. Проверь, что `await-ci` в `deploy.yml` корректно дождётся такого рана.
2. **Изоляция админки** (`deploy/Caddyfile`): на `motophd.com` и `www` путь `/admin*` →
   404; новый host-блок `admin.motophd.com` → тот же app-контейнер (без блока).
   `grafana.motophd.com` уже есть — не трогай. Cloudflare Access поверх `admin.` и
   `grafana.` включает Дима в консоли CF — в `docs/RUNBOOK_VPS.md` опиши, что именно
   включить (Self-hosted app, email-allowlist, какие hostname).
3. **Автосинк deploy-конфигов**: шаг в `deploy.yml` — scp актуальных `deploy/*` на бокс
   + `docker compose ... exec caddy caddy reload` (или restart caddy) перед `up -d`,
   чтобы правки Caddyfile не требовали ручного scp.
4. **`docs/RUNBOOK_VPS.md`** (новый): фактическая схема бокса (что в `~/motophd/`,
   как устроен деплой, как откатиться на прежний тег через input `tag` в deploy.yml —
   пошагово), инструкция CF Access из п.2.
5. **Branch protection**: сам НЕ настраивай (нужны права) — в отчёт добавь готовые
   `gh api`-команды для Димы: required status checks (checks, build, e2e), PR обязателен.

Зона: `.github/workflows/**`, `deploy/Caddyfile`, `docs/RUNBOOK_VPS.md`. Compose-файл —
зона S6, не трогай; нужна правка — опиши в отчёте «для интеграции».
Новые зависимости: никаких.

## Проверка
`actionlint` для workflow (есть через `brew`/`npx` — если недоступен, вычитка руками),
Caddyfile — `docker run --rm -v $PWD/deploy/Caddyfile:/etc/caddy/Caddyfile caddy:2
caddy validate --config /etc/caddy/Caddyfile` (или вычитка, если Docker недоступен).
В отчёте отдельно: что проверено, что нет.
