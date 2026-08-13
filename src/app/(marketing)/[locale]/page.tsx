import { getTranslations } from 'next-intl/server';
import { connection } from 'next/server';
import { LandingBottom } from '@/components/landing/LandingBottom';
import { LandingTop } from '@/components/landing/LandingTop';
import { homeContent } from '@/lib/content';
import { getPublishedCourses, toAppLocale, toCourseCardCourse } from '@/lib/data';
import type { Locale } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  await connection();

  const { locale } = await params;
  const safeLocale = toAppLocale(locale) satisfies Locale;
  const t = await getTranslations({ locale: safeLocale, namespace: 'actions' });
  const content = homeContent[safeLocale];
  const payloadCourses = await getPublishedCourses(safeLocale);
  const courses = payloadCourses.map((course, index) => toCourseCardCourse(course, index, safeLocale));

  return (
    <>
      <LandingTop
        content={content}
        courses={courses}
        labels={{
          startLearning: t('startLearning'),
          viewCourses: t('viewCourses'),
          browseAllCourses: t('browseAllCourses')
        }}
      />
      <LandingBottom content={content} labels={{ enrollCta: t('enrollCourse') }} />
    </>
  );
}
