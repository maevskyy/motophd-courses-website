import type { MetadataRoute } from 'next';

import { getSitemapCourses, getSitemapLegalPages } from '@/lib/data';
import { buildSitemapEntries, getSiteUrl } from '@/lib/seo';

// Динамика, а не ISR: у сборки в CI/Docker нет базы, а статический
// пререндер sitemap ходил бы в Payload прямо на `next build`.
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courses, legalPages] = await Promise.all([getSitemapCourses(), getSitemapLegalPages()]);

  return buildSitemapEntries({ courses, legalPages, siteUrl: getSiteUrl() });
}
