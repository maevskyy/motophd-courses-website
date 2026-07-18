# Task 6 — Платёжный каркас: PaymentProvider, mock, вебхук

**Depends on:** 2
**Goal:** Полный флоу покупки работает на mock-провайдере: заказ → «оплата» → колбэк → paid Purchase → доступ. WayForPay подключается позже сменой провайдера, без переписывания.

## Scope

- `lib/payments/`: интерфейс `PaymentProvider` (`createCheckout`, `verifyCallback`, `name`).
- `MockProvider`: мгновенный success/fail (для dev и e2e).
- `WayForPayProvider` (скелет): формирование запроса, HMAC-подпись/проверка `merchantSignature` — на sandbox-ключах из env; TODO-маркеры для боевых.
- Checkout server action: тариф (`standard|feedback|feedback_upgrade`) + промокод → серверный расчёт цены → `Purchase{pending}` → редирект провайдера.
- `app/api/payments/[provider]/callback`: проверка подписи → идемпотентность по `orderReference` (уникальный индекс) → `paid` → создание/линковка Users → письмо-заглушка (лог; Resend — отдельно).
- Расчёт цены в `lib/payments/pricing.ts`: тарифы, промокод (percent/fixed, лимиты, срок), апгрейд = разница. Только сервер.

## Acceptance criteria

- E2e на mock: покупка гостем создаёт аккаунт и paid Purchase; контент-гейт `hasPaidAccess` открывается.
- Повторный колбэк с тем же `orderReference` — no-op (200, без второй Purchase).
- Неверная подпись — 400, Purchase не меняется.
- Unit: pricing (тарифы × промокоды × апгрейд, граничные), подпись WayForPay (вектор из доки).

## Out of scope

- Боевые ключи (блокер: ФОП Влада), PayPal, UI чекаута, реальные письма.

## References

- [TZ.md §8](../../TZ.md#8-платежи-детали) · [BUSINESS_RULES.md — Деньги](../../BUSINESS_RULES.md#деньги) · инварианты в [AGENTS.md](../../../AGENTS.md)
