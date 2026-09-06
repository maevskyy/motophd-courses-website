export const DEFAULT_SITE_URL = 'https://motophd.com';

// Абсолютные URL для canonical/hreflang/sitemap. Переменные не плодим:
// APP_URL уже задан в проде (ссылки в письмах) и читается в рантайме,
// NEXT_PUBLIC_SITE_URL — локальный/платёжный вариант. Без обеих — прод-домен:
// в Docker-сборке env нет, а метаданные ISR-страниц считаются на сервере.
export const getSiteUrl = () => {
  const candidate = process.env.APP_URL || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;

  try {
    return new URL(candidate).origin;
  } catch {
    return DEFAULT_SITE_URL;
  }
};
