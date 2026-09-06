# Task 15 — Замок на кабинет и плеер

**Depends on:** 14 (нужен `getCurrentUser`/`requireUser`)
**Goal:** приватные страницы недоступны анониму, просмотр курса — только при оплаченной покупке.

## Контекст

`/dashboard` и `/learn/[slug]` сейчас открываются кому угодно: в `src/app/(app)/[locale]/layout.tsx` проверяется только локаль, а `dashboard/layout.tsx` и `learn/[slug]/layout.tsx` — однострочные ре-экспорты пустого layout'а логина. Серверной проверки доступа нет ни на одной странице.

Отдельная причина, почему замка нет и на уровне данных: все запросы в `src/lib/data/courses.ts` идут с `overrideAccess: false`, но **без `user`** → внутри access-правил коллекций `req.user === undefined`, то есть каждый рендер выполняется как аноним.

`hasPaidAccess(payload, user, course)` уже написан и покрыт тестами (`src/lib/access/hasPaidAccess.ts`), но вызывается ровно из одного места — access-правила `Lessons`, куда исполнение не доходит.

Доступ к курсу пока выдаётся вручную в админке (`Purchases`, `provider: 'manual'` — предусмотрено ТЗ), потому что оплаты ещё нет.

## Scope

- `src/app/(app)/[locale]/layout.tsx` — `await requireUser()` перед рендером (одна точка на всю группу). Редирект на вход должен нести адрес возврата (`/login?next=…`, решение из task 14). В серверном layout текущего пути нет напрямую — проставить его заголовком в `middleware.ts` и читать через `headers()`.
- `src/app/(app)/[locale]/learn/[slug]/page.tsx` — дополнительно проверка `hasPaidAccess`; без покупки — понятный отказ с уходом на страницу курса.
- Удалить ре-экспортные `dashboard/layout.tsx` и `learn/[slug]/layout.tsx`.
- `src/lib/data/courses.ts` — передавать `user` во все `payload.find` (сохраняя `overrideAccess: false`), чтобы access-правила коллекций начали работать.
- `getDashboardCourses` перестаёт быть алиасом `getPublishedCourses`: возвращает курсы, на которые у пользователя есть `Purchase{status:'paid'}`. Иначе кабинет показывает курсы, в которые не пускает.
- `messages/*.json`: ключи «нужно войти» и «нет доступа к курсу».

## Acceptance criteria

- Аноним на `/dashboard` и `/learn/<slug>` уходит на страницу входа, а после входа возвращается на тот адрес, куда шёл.
- Вошедший без покупки (`guest@motophd.com`) в плеер не попадает; с оплаченной покупкой (`student@motophd.com`) — попадает.
- В кабинете видны только купленные курсы.
- E2E на все четыре случая (аноним → редирект; вход без покупки → отказ; вход с покупкой → плеер открыт; выход → снова редирект).
- `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm test:e2e` зелёные.

## Out of scope

- Утечка защищённых полей урока через `/api/lessons` — task 16.
- Оплата и автоматическое создание `Purchase` — `task_payments_skeleton_6`.
- Хардкод статистики в `DashboardPanels` («1 курс», «40%»): прогресса в продукте нет по ADR-9, чистится отдельно.
- Выдача PDF и видео-токенов — `task_media_stream_5` / F7.

## References

- [TZ.md F6, F7](../../TZ.md) · [ARCHITECTURE.md — Инварианты](../../ARCHITECTURE.md) («никаких решений о доступе на клиенте»)
- Правило доступа: контент курса открыт ⇔ `Purchase{user, course, status:'paid'}`.
