import { defaultLocale, locales, type Locale } from '@/i18n/locales';

export type HreflangKey = Locale | 'x-default';

export type LanguageAlternates = Record<HreflangKey, string>;

// Путь без локали ('/', '/courses/lean') → путь с префиксом ('/ru/courses/lean').
export const localizedPath = (locale: Locale, path: string) => {
  const trimmed = path.replace(/\/+$/, '');
  const normalized = trimmed === '' || trimmed.startsWith('/') ? trimmed : `/${trimmed}`;

  return `/${locale}${normalized}`;
};

export const toAbsoluteUrl = (siteUrl: string, pathOrUrl: string) =>
  /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${siteUrl}${pathOrUrl}`;

export const resolveSeoLocale = (locale: string): Locale | null =>
  (locales as readonly string[]).includes(locale) ? (locale as Locale) : null;

// Пары hreflang одной страницы: каждая локаль + x-default на дефолтную.
// Без этого Google склеивает языковые версии как дубли.
export const buildLanguageAlternates = (siteUrl: string, path: string): LanguageAlternates => {
  const byLocale = Object.fromEntries(
    locales.map((locale) => [locale, toAbsoluteUrl(siteUrl, localizedPath(locale, path))])
  ) as Record<Locale, string>;

  return {
    ...byLocale,
    'x-default': byLocale[defaultLocale]
  };
};

export const canonicalUrl = (siteUrl: string, locale: Locale, path: string) =>
  toAbsoluteUrl(siteUrl, localizedPath(locale, path));
