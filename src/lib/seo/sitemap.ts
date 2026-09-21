import type { MetadataRoute } from 'next';

import { locales } from '@/i18n/locales';
import { buildLanguageAlternates, canonicalUrl } from './urls';

export type SitemapDocument = {
  slug: string;
  updatedAt?: string | null;
};

export type SitemapSource = {
  siteUrl: string;
  courses: SitemapDocument[];
  legalPages: SitemapDocument[];
};

type SitemapPage = {
  path: string;
  changeFrequency: 'weekly' | 'monthly';
  priority: number;
  lastModified?: Date;
};

const toDate = (value?: string | null) => {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
};

const collectPages = ({ courses, legalPages }: SitemapSource): SitemapPage[] => [
  { changeFrequency: 'weekly', path: '/', priority: 1 },
  { changeFrequency: 'weekly', path: '/courses', priority: 0.9 },
  ...courses.map<SitemapPage>((course) => ({
    changeFrequency: 'weekly',
    lastModified: toDate(course.updatedAt),
    path: `/courses/${course.slug}`,
    priority: 0.8
  })),
  ...legalPages.map<SitemapPage>((page) => ({
    changeFrequency: 'monthly',
    lastModified: toDate(page.updatedAt),
    path: `/${page.slug}`,
    priority: 0.3
  }))
];

// Каждая страница — по записи на локаль, и в каждой записи полный набор
// hreflang-альтернатив (en, ru, uk, x-default), как требует Google для sitemap.
export const buildSitemapEntries = (source: SitemapSource): MetadataRoute.Sitemap =>
  collectPages(source).flatMap((page) => {
    const languages = buildLanguageAlternates(source.siteUrl, page.path);

    return locales.map((locale) => ({
      alternates: { languages },
      changeFrequency: page.changeFrequency,
      lastModified: page.lastModified,
      priority: page.priority,
      url: canonicalUrl(source.siteUrl, locale, page.path)
    }));
  });
