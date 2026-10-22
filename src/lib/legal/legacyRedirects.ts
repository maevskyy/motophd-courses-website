// Без алиаса '@/': файл читает next.config.ts, а там алиасы не работают.
import { defaultLocale, locales } from '../../i18n/locales';

/*
  До 23.09 (MOT-91) юр-документы были страницами /<язык>/privacy, /terms,
  /refund. Их заменили PDF, а старые адреса остались в выдаче Google и
  отдавали 404. Постоянный редирект на PDF того же языка: Google по нему
  сам заменит ссылку в поиске. Правила возврата — в публичной оферте.
*/
const legacyDocuments = {
  privacy: 'privacy-policy',
  refund: 'public-offer',
  terms: 'public-offer'
} as const;

type Redirect = { destination: string; permanent: true; source: string };

export const legacyLegalRedirects: Redirect[] = Object.entries(legacyDocuments).flatMap(
  ([slug, fileName]) => [
    ...locales.map((locale) => ({
      destination: `/legal/${fileName}-${locale}.pdf`,
      permanent: true as const,
      source: `/${locale}/${slug}`
    })),
    {
      destination: `/legal/${fileName}-${defaultLocale}.pdf`,
      permanent: true as const,
      source: `/${slug}`
    }
  ]
);
