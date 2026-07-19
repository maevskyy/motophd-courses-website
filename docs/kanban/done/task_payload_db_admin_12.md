# Task 12 — Payload/DB/admin bring-up

**Depends on:** Task 1 (порт, done), Task 11 (рефактор, done)
**Статус:** done.

## Goal

Поднять минимальный CMS-хребет внутри существующего Next-приложения: Payload 3, локальный Postgres и `/admin`.

## Context

Порт прототипа и рефактор закрыли Next-init/i18n/lint/SCSS-часть исходного `task_init_repo_1`, но фронт всё ещё жил на фикстурах, а реального бэкенда не было. Эта задача закрывает оставшуюся практическую половину: Payload + Postgres + админку без доменных коллекций.

## Scope

- Установить Payload 3 в текущий Next 15 App Router проект без повторного скаффолда.
- Подключить `@payloadcms/next`, `@payloadcms/db-postgres`, `@payloadcms/richtext-lexical`, `sharp`.
- Обернуть `next.config.ts` через `withPayload(...)`, сохранив `next-intl` и `output: 'standalone'`.
- Добавить `src/payload.config.ts` с Postgres adapter, Lexical editor, `en/ru` localization и генерацией типов в `src/payload-types.ts`.
- Добавить коллекцию `Users` с `auth: true`, ролью `student|admin`, доступом в админку только для `admin`.
- Добавить route-группу `src/app/(payload)` для `/admin`, REST API, GraphQL и import map.
- Добавить `docker-compose.dev.yml` с Postgres и заполнить `.env.example`.
- Пробросить Postgres на host-порт `5433`, чтобы не конфликтовать с системным `localhost:5432`.
- Добавить скрипты `payload`, `generate:types`, `db:up`.

## Acceptance criteria

- `pnpm generate:types` создаёт `src/payload-types.ts`.
- `pnpm payload generate:importmap` создаёт import map для админки.
- `pnpm lint`, `pnpm typecheck`, `pnpm build` — зелёные.
- `docker compose -f docker-compose.dev.yml up -d && pnpm dev` поднимают сайт и `/admin` при запущенном Docker daemon.
- `/en` и `/ru` продолжают рендериться как раньше.

## Out of scope

- Доменные коллекции `Courses/Lessons/Media/Purchases/PromoCodes/LegalPages` — следующая задача `task_content_model_2`.
- Реальная студенческая auth на сайте.
- R2/Cloudflare Stream, платежи, CI, Dockerfile, production split site/admin.
- Настройка Vitest/RTL/Playwright.

## References

- [ARCHITECTURE.md](../../ARCHITECTURE.md) · [DECISIONS.md](../../DECISIONS.md) · [AGENTS.md](../../../AGENTS.md)
