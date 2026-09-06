import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { LandingBottom } from '@/components/landing/LandingBottom';
import { LandingTop } from '@/components/landing/LandingTop';
import { homeContent } from '@/lib/content';
import { getPublishedCourses, toCourseCardCourse } from '@/lib/data';
import { buildPageMetadata, resolveSeoLocale, SITE_NAME } from '@/lib/seo';
import { requireLocale } from '@/i18n/requireLocale';

export const revalidate = 300;

// Пустой список: страницы рендерятся при первом заходе и кэшируются (ISR),
// чтобы сборка в CI обходилась без работающей базы.
export function generateStaticParams() {
  return [];
}

// Title/description лендинга — из существующего контента hero
// (src/lib/content): бейдж и подзаголовок, без новых полей.
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const seoLocale = resolveSeoLocale(locale);

  if (!seoLocale) {
    return {};
  }

  const content = homeContent[seoLocale];

  return buildPageMetadata({
    absoluteTitle: true,
    description: content.heroSub,
    locale: seoLocale,
    path: '/',
    title: `${SITE_NAME} — ${content.heroBadge}`
  });
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = requireLocale(locale);
  const t = await getTranslations({ locale: safeLocale, namespace: 'actions' });
  const content = homeContent[safeLocale];
  const payloadCourses = await getPublishedCourses(safeLocale);
  const courses = payloadCourses.map((course, index) => toCourseCardCourse(course, index));

  return (
    <>
      <LandingTop
        content={content}
        courses={courses}
        labels={{
          viewCourses: t('viewCourses'),
          browseAllCourses: t('browseAllCourses')
        }}
      />
      <LandingBottom content={content} labels={{ joinCommunity: t('joinCommunity') }} />
    </>
  );
}
