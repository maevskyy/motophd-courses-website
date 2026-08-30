# Спринт-координация: параллельные потоки (2026-08-20)

> ⚠️ **ПОПРАВКА ПО ХОДУ СПРИНТА (обязательна для всех потоков):** все сессии работают
> в ОДНОМ рабочем дереве. Поэтому git НЕ ТРОГАТЬ ВООБЩЕ: никаких `git checkout`,
> `git branch`, `git commit`, `git stash`. Только редактирование файлов строго в своей
> зоне. Ветки из таблицы ниже — имена зон, а не команды. Красный `pnpm typecheck`
> из-за чужих недоделанных файлов вне твоей зоны — норма, не чини чужое: гоняй
> `pnpm vitest run <свои файлы>` и lint по своим файлам. Сборку и коммиты делает
> интеграция после финиша всех потоков.

Максимум работы параллельно за один заход. Каждый поток — отдельная сессия агента,
строго своя файловая зона.

## Потоки

| # | Ветка | Бриф | Зона файлов (только она!) |
|---|---|---|---|
| S1 | `feature/media-r2-stream` | `stream_media.md` | `payload.config.ts`, `collections/Media.ts`, `lib/media/`, `lib/video/`, `api/lessons/[id]/pdf/`, `components/player/`, `lib/data/types.ts`+`adapters.ts` (только PlayerContent), миграция media |
| S2 | `feature/payments-core` | `stream_payments.md` | `lib/payments/`, `collections/Purchases.ts`, новая `collections/PromoCodes.ts`, `components/prototype/PricingBox/`, роуты `checkout/*` и `api/payments/*`, миграция purchases/promocodes |
| S3 | `feature/emails-f9` | `stream_emails_f9.md` | `lib/email/`, `app/(app)/[locale]/feedback/`, `lib/auth/passwordReset.ts` (новый), `app/(marketing)/[locale]/login/forgot/` |
| S4 | `feature/cabinet-f6` | `stream_cabinet.md` | `components/dashboard/`, `app/(app)/[locale]/dashboard/`, `lib/auth/account.ts` (новый), `collections/Users.ts` (+миграция users, если нужна) |
| S5 | `feature/consent-analytics` | `stream_consent.md` | `components/consent/` (новая), вставка одного компонента в корневые layout'ы |
| S6 | `feature/observability` | `stream_observability.md` | `deploy/docker-compose.prod.yml`, `deploy/monitoring/**`, `deploy/backup/**`, `docs/RESTORE.md` |
| S7 | `feature/hardening` | `stream_hardening.md` | `.github/workflows/**`, `deploy/Caddyfile`, `docs/RUNBOOK_VPS.md` |

Чужую зону не трогаем вообще. Нужно что-то в чужой зоне — пиши в финальном отчёте
«для интеграции», не делай сам.

## Общие правила (для каждого потока)

1. Прочитай `AGENTS.md` (canary-правила действуют) и указанные в брифе доки.
2. Conventional Commits, ветка своя, в `main`/`dev` не коммитить.
3. Тесты на своё — обязательны (образцы: `src/lib/access/hasPaidAccess.test.ts`,
   `src/components/prototype/FaqAccordion/FaqAccordion.test.tsx`). Перед завершением:
   `pnpm lint`, `pnpm typecheck`, `pnpm test` зелёные. Полный `pnpm test:e2e` гоняет
   только интеграция — свои e2e-кейсы добавь в `e2e/`, но прогон всех не требуется.
4. UI-строки — только через `messages/en.json` + `messages/ru.json`, каждый поток пишет
   **только в своём namespace** (указан в брифе), ключи добавляет в конец файла своим блоком.
5. Новые env-переменные — блок в `.env.example` с комментарием `# --- <ветка> ---`.
   `deploy/.env.prod.example` трогает только S6/S7.
6. Новые зависимости — только явно разрешённые в брифе (считаются одобренными Димой).
7. Финальный ответ в чат: что сделано, что НЕ сделано и почему, список «для интеграции»,
   команды проверки.

## Контракты между потоками

- **Checkout action** (владелец S2): `src/lib/payments/checkout.ts`, server action
  `createCheckout` — вход: `{ courseSlug, tier: 'standard'|'feedback'|'feedback_upgrade',
  email?, promoCode?, locale }`, выход: redirect на страницу оплаты либо `{ error }`-стейт
  формы. S4 (докупка feedback) вызывает его по этой сигнатуре; если S2 ещё не влит —
  S4 пишет вызов по контракту, компиляция сойдётся на интеграции.
- **Email API** (владелец S3): `src/lib/email/index.ts` экспортирует
  `sendAccountCredentials({ to, password, locale })`,
  `sendPurchaseConfirmation({ to, courseTitle, tier, locale })`,
  `sendFeedbackInstructions({ to, locale })`,
  `sendPasswordReset({ to, resetUrl, locale })`.
  Без `RESEND_API_KEY` — лог в консоль, не ошибка. S2 писем НЕ шлёт: в вебхуке оставляет
  `console.log('TODO(email): ...')` — интеграция заменит на вызовы S3.
- **PlayerContent** (владелец S1): описан в task_media_stream_5, никто больше
  `lib/data/types.ts` не трогает.
- **Миграции** (`src/migrations/`): каждый поток генерирует свою через
  `pnpm payload migrate:create`, руками не пишет. Конфликт в `migrations/index.ts` чинит
  интеграция. Порядок применения: media → purchases/promocodes → users.

## Порядок мержа (интеграция, строго последовательно)

S1 медиа → S2 платежи → S3 письма → S4 кабинет → S5 consent. S6 и S7 — независимо,
в любой момент. После каждого мержа: `pnpm typecheck`; после всех: чистая БД →
`pnpm payload migrate` → `pnpm seed` → `pnpm build` → полный `pnpm test:e2e`.

Интеграционные шаги после мержей:
1. Вменить вызовы Email API из S3 в вебхук S2 (замена TODO(email)-логов).
2. Кнопку докупки feedback (S4) проверить против реального `createCheckout` (S2).
3. Разрулить `messages/*.json` и `.env.example`, если блоки столкнулись.
4. Хозяйство: карточки 14/15/16 из `docs/kanban/todo/` → `done/` (код давно в main).
