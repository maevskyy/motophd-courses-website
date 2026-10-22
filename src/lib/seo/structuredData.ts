import type { Locale } from '@/i18n/locales';

import { SITE_NAME } from './pageMetadata';
import { toAbsoluteUrl } from './urls';

// Название бренда для Google: по разметке WebSite он подписывает выдачу
// «MotoPhD» и понимает, что запрос «motophd» — это главная, а не случайная
// страница сайта.
const BRAND = 'MotoPhD';

// Соцсети школы (не личные Влада): по ним Google связывает бренд с сайтом.
const ORGANIZATION_PROFILES = [
  'https://www.instagram.com/motophd/',
  'https://www.youtube.com/@MotoPhD'
];

export const buildHomeStructuredData = (locale: Locale, siteUrl: string) => {
  const homeUrl = `${siteUrl}/`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@id': `${homeUrl}#website`,
        '@type': 'WebSite',
        alternateName: [SITE_NAME, 'Moto PhD'],
        inLanguage: locale,
        name: BRAND,
        publisher: { '@id': `${homeUrl}#organization` },
        url: homeUrl
      },
      {
        '@id': `${homeUrl}#organization`,
        '@type': 'Organization',
        alternateName: SITE_NAME,
        logo: toAbsoluteUrl(siteUrl, '/logo.png'),
        name: BRAND,
        sameAs: ORGANIZATION_PROFILES,
        url: homeUrl
      }
    ]
  };
};

// Для <script type="application/ld+json">: «<» экранируем, чтобы строка в
// данных не могла закрыть тег.
export const serializeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');
