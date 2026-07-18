import { CourseCard } from '@/components/prototype/CourseCard';
import { Footer } from '@/components/prototype/Footer';
import { localizedCourses, prototypeContent } from '@/lib/content';
import type { Locale } from '@/i18n/routing';
import styles from '@/components/catalog/CatalogPage.module.scss';

export default async function CoursesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (locale === 'ru' ? 'ru' : 'en') satisfies Locale;
  const content = prototypeContent[safeLocale].courses;
  const courses = localizedCourses[safeLocale];

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
