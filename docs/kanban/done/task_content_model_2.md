# Task 2 — Content model: domain collections + access

**Depends on:** Task 12 (Payload/DB/admin bring-up)
**Статус:** done.

## Goal

Описать бизнес-сущности MotoPhD в Payload, чтобы админка могла редактировать контент, а Local API имел базовую модель доступа.

## Scope

- Добавить коллекции `Courses`, `Lessons`, `Media`, `LegalPages`, `Purchases`.
- Локализовать EN/RU поля контента и ассеты (`cover`, `pdf`, `streamVideoId`) через Payload localization.
- Оставить `Media` на локальном Payload-хранилище до `task_media_stream_5`.
- Добавить `Purchases` как схему доступа без платёжной логики и вебхуков.
- Добавить `hasPaidAccess(payload, user, course)` для проверки `Purchase{status:'paid'}`.
- Настроить access control:
  - admin CRUD для доменных коллекций;
  - гости/студенты читают опубликованные courses/lessons и legal pages;
  - media читается публично, запись только admin.
- Добавить idempotent seed из текущих фикстур: первые 2 курса + плоские lessons из `curriculum.ts`.
- Зарегистрировать коллекции в `payload.config.ts` и сгенерировать `payload-types.ts`.

## Acceptance

- `pnpm generate:types`, `pnpm lint`, `pnpm typecheck` проходят.
- `pnpm seed` создаёт 2 курса и уроки; повторный запуск не дублирует курсы.
- Local API отдаёт seeded courses по `locale:'ru'`.
- Public `lessons` read проходит через access-фильтр опубликованного курса.
- `hasPaidAccess` возвращает `true` для paid purchase и `false` для pending / чужого пользователя.

## Out of scope

- `PromoCodes` и вся платёжная логика/вебхуки — `task_payments_skeleton_6`.
- Подключение сайта к Payload вместо `src/lib/content/*` — следующая отдельная задача.
- R2/Cloudflare Stream — `task_media_stream_5`.
- Реальная студенческая auth и полное гейтование плеера/PDF.
- Unit/e2e test runner setup.

## References

- [TZ.md §5](../../TZ.md) · [BUSINESS_RULES.md](../../BUSINESS_RULES.md) · [DECISIONS.md](../../DECISIONS.md)
