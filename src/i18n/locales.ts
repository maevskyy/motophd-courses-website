// Единый список локалей сайта. Роутинг next-intl (routing.ts) и поля Payload
// (Purchases.locale) читают его отсюда, чтобы 'en'/'ru' не расползались по коду.
// Файл без зависимостей: его импортируют и коллекции Payload (CLI, миграции).
export const locales = ['en', 'ru'] as const;

export type Locale = (typeof locales)[number];

// Аннотация типа обязательна: без неё литерал расширяется до string в объектах.
export const defaultLocale: Locale = 'en';
