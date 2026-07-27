# Task 4 — CI/CD: чеки, образ→GHCR, деплой-кнопка

**Depends on:** 1, 3
**Статус:** done (26.07.2026). Пайплайн собран Димой, закрыта одним заходом с task 3.

## Goal

PR прогоняет проверки; образ собирается в CI; деплой и откат — кнопкой в GitHub Actions;
на сервере живёт **образ**, не исходники. Аня деплоит без знания SSH: push → галки → кнопка.

## Что сделано (факты)

- **`ci.yml`:** на PR/push — install → lint → typecheck → build. (Юнитов/e2e нет, потому что
  тестов в репо ещё нет вообще — добавятся вместе с первыми тестами.)
- **`deploy.yml`** (`workflow_dispatch`, ручная кнопка):
  - input `tag` (пусто = собрать текущий коммит; указан = задеплоить существующий тег → **rollback**);
  - input `seed` (bool) — прогнать сид после миграций;
  - **preflight:** проверка секретов, docker/compose на VPS, валидность compose-конфига,
    соответствие `DATABASE_URI` ↔ Postgres-env, свободный диск ≥ 5 GiB;
  - **build:** buildx → GHCR (`sha-XXXXXXX` + `latest`), GHA-кэш (`type=gha`);
  - **deploy по SSH:** `docker login ghcr` → `compose pull` → `payload migrate` (one-shot) →
    опц. seed → `up -d --remove-orphans` → healthcheck `127.0.0.1:3000/api/health`.
- **`Dockerfile`** multi-stage (standalone) + `.dockerignore`. Образ ~1.6 GB — в runner оставлен
  полный `node_modules` ради `migrate`/`seed`; похудение — в task_infra_leftovers_13.
- **Миграции:** initial-миграция закоммичена (`src/migrations/`), применяется на каждом деплое.
- **Секреты:** GitHub Secrets — `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `GHCR_READ_TOKEN`.
- Первый боевой деплой прошёл: сайт крутится из GHCR-образа, seed прогнан, исходников на боксе нет.

## Отклонения от черновика

- Отдельного `build.yml` (на push в main) нет — сборка живёт внутри `deploy.yml`. Осознанное
  упрощение: деплой всё равно ручной кнопкой, промежуточные образы без деплоя пока не нужны.
- **Branch protection на `main` не включён** (сейчас можно пушить напрямую), rollback руками не
  прогонялся, скриншот-инструкции «куда жать» для Ани нет → всё в
  [task_infra_leftovers_13](../../tbd/task_infra_leftovers_13.md).

## Acceptance (проверено 26.07)

- Кнопка Run workflow: собирает, пушит в GHCR, катит на VPS, healthcheck зелёный.
- На сервере только образ + `~/motophd/{compose,.env,Caddyfile,certs}` — репозиторий не клонирован.
- Миграции применяются деплоем; seed идемпотентен (повторный прогон не плодит дубли).

## References

- ADR-5 в [DECISIONS.md](../../DECISIONS.md) · [ARCHITECTURE.md — Окружения](../../ARCHITECTURE.md)
- Хвосты: [task_infra_leftovers_13](../../tbd/task_infra_leftovers_13.md)
