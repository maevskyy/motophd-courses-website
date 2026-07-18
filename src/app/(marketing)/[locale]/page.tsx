import { getTranslations } from 'next-intl/server';
import { LandingBottom } from '@/components/landing/LandingBottom';
import { LandingTop } from '@/components/landing/LandingTop';
import { localizedCourses, prototypeContent } from '@/lib/content';
import type { Locale } from '@/i18n/routing';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (locale === 'ru' ? 'ru' : 'en') satisfies Locale;
  const t = await getTranslations({ locale: safeLocale, namespace: 'actions' });
  const content = prototypeContent[safeLocale].home;
  const courses = localizedCourses[safeLocale];

  return (
    <>
      <LandingTop
        content={content}
        courses={courses}
        labels={{ startLearning: t('startLearning'), viewCourses: t('viewCourses') }}
      />
      <LandingBottom
        content={content}
        labels={{ browseAllCourses: t('browseAllCourses'), enrollNow: t('enrollNow') }}
      />
    </>
  );
}
