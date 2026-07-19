import { connection } from 'next/server';
import { CourseCard } from '@/components/prototype/CourseCard';
import { Footer } from '@/components/prototype/Footer';
import { getPublishedCourses, toAppLocale, toCourseCardCourse } from '@/lib/data';
import type { Locale } from '@/i18n/routing';
import styles from '@/components/catalog/CatalogPage.module.scss';

export const dynamic = 'force-dynamic';

const catalogContent = {
  en: {
    label: 'All Courses',
    title: 'The MotoPhD Curriculum',
    sub: 'Each course targets one specific problem. Master it completely. Then move to the next.'
  },
  ru: {
    label: 'Все курсы',
    title: 'Программа MotoPhD',
    sub: 'Каждый курс решает одну конкретную проблему. Разбери её полностью и переходи к следующей.'
  }
};

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  await connection();

  const { locale } = await params;
  const safeLocale = toAppLocale(locale) satisfies Locale;
  const content = catalogContent[safeLocale];
  const payloadCourses = await getPublishedCourses(safeLocale);
  const courses = payloadCourses.map((course, index) => toCourseCardCourse(course, index, safeLocale));

  return (
    <>
      <main className={styles.catalogShell}>
        <section className={styles.catalogInner}>
          <div className={styles.section__label}>{content.label}</div>
          <h1 className={styles.section__title}>{content.title}</h1>
          <p className={styles.section__sub}>{content.sub}</p>
          <div className={styles.coursesGrid}>
            {courses.map((course) => (
              <CourseCard catalog course={course} key={course.slug} />
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
