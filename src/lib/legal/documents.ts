import type { Locale } from '@/i18n/locales';

export type LegalDocument = 'license' | 'offer' | 'privacy';

/*
  Юридические документы лежат готовыми PDF в public/legal и раздаются как
  статика: править их через админку не нужно, а версия у каждого языка своя.
  Имя файла — <документ>-<локаль>.pdf, локали те же, что у сайта (ua = uk).
*/
const fileNames: Record<LegalDocument, string> = {
  license: 'license-agreement',
  offer: 'public-offer',
  privacy: 'privacy-policy'
};

export const legalDocumentHref = (document: LegalDocument, locale: Locale): string =>
  `/legal/${fileNames[document]}-${locale}.pdf`;

/*
  Политика, оферта и лицензия теперь раздаются PDF-файлами, поэтому из базы на
  сайте остались только контакты: остальные записи legal_pages больше никуда
  не ведут. Один список на маршрут и на sitemap, чтобы карта сайта не звала
  страницы, которых нет.
*/
export const legalPageSlugs = ['contact'] as const;

export type LegalPageSlug = (typeof legalPageSlugs)[number];

export const isLegalPageSlug = (slug: string): slug is LegalPageSlug =>
  legalPageSlugs.includes(slug as LegalPageSlug);
