import type { Metadata } from 'next';
import { CourseCard } from '@/components/prototype/CourseCard';
import { Footer } from '@/components/prototype/Footer';
import { Section, SectionHeader } from '@/components/ui/Section';
import { getPublishedCourses, toCourseCardCourse } from '@/lib/data';
import { withRegionalPrice } from '@/lib/pricing/regionalPrice';
import { getVisitorCountry } from '@/lib/pricing/visitorCountry';
import { buildPageMetadata, resolveSeoLocale } from '@/lib/seo';
import type { Locale } from '@/i18n/locales';
import { requireLocale } from '@/i18n/requireLocale';
import styles from '@/components/catalog/CatalogPage.module.scss';

// Цены зависят от страны посетителя (regionalPrice.ts), поэтому страница
// собирается на каждый запрос, а не кэшируется одна на всех.
export const dynamic = 'force-dynamic';

// Record<Locale, …>: новая локаль без своего текста не пройдёт typecheck.
const catalogContent: Record<Locale, { label: string; title: string; sub: string }> = {
  en: {
    label: 'All Courses',
    title: 'The MotoPhD Curriculum',
    sub: 'Each course targets one specific problem. Master it completely. Then move to the next.'
  },
  ru: {
    label: 'Все курсы',
    title: 'Программа MotoPhD',
    sub: 'Каждый курс решает одну конкретную проблему. Разбери её полностью и переходи к следующей.'
  },
  uk: {
    label: 'Усі курси',
    title: 'Програма MotoPhD',
    sub: 'Кожен курс розв’язує одну конкретну проблему. Розбери її повністю і переходь до наступної.'
  }
};

// Title/description каталога — заголовок и подзаголовок самой страницы.
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

  const content = catalogContent[seoLocale];

  return buildPageMetadata({
    description: content.sub,
    locale: seoLocale,
    path: '/courses',
    title: content.title
  });
}

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = requireLocale(locale);
  const content = catalogContent[safeLocale];
  const payloadCourses = await getPublishedCourses(safeLocale);
  const country = await getVisitorCountry();
  const courses = payloadCourses.map((course, index) =>
    toCourseCardCourse(withRegionalPrice(course, country), index)
  );

  return (
    <>
      <main className={styles.shell}>
        <Section>
          <SectionHeader as="h1" kicker={content.label} lead={content.sub} title={content.title} />
          <div className={styles.grid}>
            {courses.map((course) => (
              <CourseCard catalog course={course} key={course.slug} titleAs="h2" />
            ))}
          </div>
        </Section>
      </main>
      <Footer />
    </>
  );
}
