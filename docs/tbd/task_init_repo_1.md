# Task 1 — Скелет проекта: Next + Payload + Postgres

**Depends on:** —
**Goal:** Локально поднимается сайт и админка; линт и тест-раннеры работают; структура — по ARCHITECTURE.md.

## Scope

- pnpm + Next.js (App Router) + TypeScript strict; `output: 'standalone'`.
- Payload 3 (`@payloadcms/next`, `@payloadcms/db-postgres`), `payload.config.ts`, локали `en`/`ru` (fallback en).
- Коллекция Users (auth, role `student|admin`) — минимум для входа в `/admin`.
- Структура папок по [ARCHITECTURE.md](../../ARCHITECTURE.md#репозиторий): route-группы `(marketing)/[locale]`, `(app)/[locale]`, `(payload)`, `api/`; заглушки страниц.
- `docker-compose.dev.yml` — Postgres для локалки. `.env.example` со всеми переменными.
- ESLint + Prettier + `.editorconfig`; SCSS-модули включены.
- Vitest + RTL + Playwright настроены, по одному smoke-тесту каждого типа.
- next-intl (или аналог): роутинг `/en|/ru`, `messages/en.json` + `ru.json` с 2–3 строками.
- `Dockerfile` (multi-stage, standalone) — собирается локально.

## Acceptance criteria

- `docker compose -f docker-compose.dev.yml up -d && pnpm dev` → `/en` открывается, `/admin` даёт создать первого админа и логинит.
- `pnpm lint`, `pnpm test`, `pnpm test:e2e` — зелёные.
- `docker build .` собирает рабочий образ.
- В `AGENTS.md` актуализирована секция «Команды».

## Out of scope

- Контент-коллекции (task 2), вёрстка, платежи, деплой.

## References

- [ARCHITECTURE.md](../ARCHITECTURE.md) · [AGENTS.md](../../AGENTS.md)
