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

// Откуда Payload берёт значение, если поле в запрошенной локали пустое:
// первый непустой язык из списка. Цепочка, а не один язык: Payload не идёт
// дальше одного шага, и обложка, загруженная только на английском, на
// украинском пропадала (uk → пустой ru → стоп). Украинского контента мало,
// поэтому uk сначала читает русское.
export const localeFallbacks: Record<Locale, Locale[]> = {
  en: ['ru', 'uk'],
  ru: ['en', 'uk'],
  uk: ['ru', 'en']
};

export const getFallbackLocale = (locale: Locale): Locale[] => localeFallbacks[locale];

export const isLocale = (value: unknown): value is Locale =>
  (locales as readonly unknown[]).includes(value);

// Для значений снаружи (query, FormData): неизвестное → defaultLocale.
export const toLocale = (value: unknown): Locale => (isLocale(value) ? value : defaultLocale);
