// Единый список локалей сайта. Роутинг next-intl (routing.ts), локализация
// Payload (payload.config.ts) и поля коллекций (Purchases.locale) читают его
// отсюда, чтобы 'en'/'ru'/'uk' не расползались по коду.
// Файл без зависимостей: его импортируют и коллекции Payload (CLI, миграции).
export const locales = ['en', 'ru', 'uk'] as const;

export type Locale = (typeof locales)[number];

// Аннотация типа обязательна: без неё литерал расширяется до string в объектах.
export const defaultLocale: Locale = 'en';

// Подписи для переключателя языка и админки Payload.
export const localeLabels: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  uk: 'Українська'
};

// Откуда Payload берёт значение, если поле в запрошенной локали пустое.
// Украинского контента (видео, PDF) нет — uk читает русское. en и ru
// подстраховывают друг друга: курс, заполненный в админке на одном языке,
// иначе выходил на другом без названия и описания.
export const localeFallbacks: Record<Locale, Locale> = {
  en: 'ru',
  ru: 'en',
  uk: 'ru'
};

export const getFallbackLocale = (locale: Locale): Locale => localeFallbacks[locale];

export const isLocale = (value: unknown): value is Locale =>
  (locales as readonly unknown[]).includes(value);

// Для значений снаружи (query, FormData): неизвестное → defaultLocale.
export const toLocale = (value: unknown): Locale => (isLocale(value) ? value : defaultLocale);
