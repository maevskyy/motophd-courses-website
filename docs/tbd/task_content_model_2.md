# Task 2 — Контент-модель: коллекции, локализация, доступ

**Depends on:** 1
**Goal:** Вся модель данных из ТЗ §5 живёт в Payload; в админке можно завести курс на двух языках; правила доступа enforced.

## Scope

- Коллекции: `Courses`, `Lessons`, `Media`, `Purchases`, `PromoCodes`, `LegalPages` — поля по [TZ.md §5](../../TZ.md#5-модель-данных-коллекции-payload).
- Локализация: текстовые поля и **ассеты** (`streamVideoId`, `pdf`) — `localized: true` (EN/RU-табы).
- Access control: админ — всё; студент — read published; гость — read published marketing-поля. Хелпер `hasPaidAccess(user, course)` в `lib/access/` + unit-тесты.
- Русские labels полей в админке.
- Seed-скрипт: 2 draft-курса с placeholder-уроками (для разработки вёрстки).

## Acceptance criteria

- В админке создаётся курс с уроками на EN и RU, публикуется, черновик на сайте не виден.
- Local API отдаёт контент по локали с fallback на en.
- Тесты access-control: student не может писать; `hasPaidAccess` покрыт (paid/pending/чужая покупка/manual).
- Миграции версионируются и накатываются с нуля.

## Out of scope

- UI сайта, checkout-логика (task 6), реальные медиа (task 5).

## References

- [TZ.md §4–5](../../TZ.md) · [BUSINESS_RULES.md](../../BUSINESS_RULES.md) · ADR-6, ADR-9 в [DECISIONS.md](../../DECISIONS.md)
