# Поток S3 — Письма (Resend) + Feedback-инструкция (F9)

Ветка `feature/emails-f9`. Сначала прочитай `docs/tbd/sprint/COORDINATION.md`.
Затем: `AGENTS.md`, `docs/BUSINESS_RULES.md` (Аккаунты, Feedback-тариф),
`docs/TZ.md` F4 и F9, `src/lib/auth/` (как устроены server actions и куки),
`src/collections/Purchases.ts` (tier), `src/lib/access/hasPaidAccess.ts`.

**Зачем:** весь продажный флоу кончается письмом — креды после покупки гостем,
инструкция feedback-тарифа, восстановление пароля. Сейчас email-слоя нет вообще.

## Scope

1. **`src/lib/email/`** — модуль отправки. Разрешённая зависимость: `resend`
   (+ строка в `docs/DECISIONS.md`). Провайдер выбирается по env: есть
   `RESEND_API_KEY` + `EMAIL_FROM` → шлём через Resend; нет → лог в консоль
   с полным телом письма (dev/CI-режим, НЕ ошибка). Публичный API — ровно четыре
   функции из COORDINATION.md «Email API» (сигнатуры не менять — их будет звать
   вебхук платежей на интеграции).
2. **Шаблоны** — простые текст+минимальный HTML, EN и RU по `locale`:
   креды нового аккаунта (email, пароль, ссылка на вход), подтверждение покупки
   (курс, тариф, ссылка в кабинет), инструкция feedback (контакт WhatsApp/Telegram —
   значения из env `FEEDBACK_CONTACT_URL`, плейсхолдер если пусто; что прислать;
   «1 видео-разбор + 1 Zoom 45 мин»), восстановление пароля (ссылка). Тексты писем
   живут в шаблонах модуля (это не UI-строки сайта), но без хардкода в компонентах.
3. **F9 — страница инструкции**: `src/app/(app)/[locale]/feedback/page.tsx` —
   `requireUser()` + доступ только при наличии `Purchase{status:'paid',
   tier: feedback|feedback_upgrade}`; остальным — редирект в dashboard. Контент =
   та же инструкция, что в письме. Namespace в `messages/*.json` — `feedback`.
4. **Восстановление пароля** (если остаётся время, иначе — честно в отчёт):
   `src/lib/auth/passwordReset.ts` (новый файл, existing-файлы auth не менять) на
   `payload.forgotPassword()` / `payload.resetPassword()`; страницы
   `app/(marketing)/[locale]/login/forgot/` и обработка токена. Ответ формы всегда
   «если такой аккаунт есть — письмо отправлено» (не раскрывать существование email).

## Тесты
Юнит: выбор провайдера по env (без ключа — лог, не throw); рендер шаблонов в обеих
локалях (снапшот или проверка подстановок); гейт страницы feedback (нет тарифа → нет
доступа). Свой e2e-кейс на страницу feedback добавь в `e2e/`.

## Не делать
`src/lib/payments/` не трогать (вебхук подключит интеграция). Зону S4
(`components/dashboard/`) не трогать. Rate-limit — нет.
