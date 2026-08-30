import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { AccessNotice } from '@/components/courseSales/AccessNotice';
import { CurriculumAccordion } from '@/components/prototype/CurriculumAccordion';
import { Footer } from '@/components/prototype/Footer';
import { PricingBox } from '@/components/prototype/PricingBox';
import {
  getCourseBySlug,
  getCourseCurriculum,
  toCurriculumModules,
  toSalesContent
} from '@/lib/data';
import { requireLocale } from '@/i18n/requireLocale';
import styles from '@/components/courseSales/CourseSalesPage.module.scss';

export const revalidate = 300;

// Пустой список: страницы рендерятся при первом заходе и кэшируются (ISR),
// чтобы сборка в CI обходилась без работающей базы. Персональное (логин,
// ?access=denied) добирают клиентские AccessNotice и PricingBox.
export function generateStaticParams() {
  return [];
}

export default async function CourseSalesPage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { locale, slug } = await params;
  const safeLocale = requireLocale(locale);
  const course = await getCourseBySlug(slug, safeLocale);

  if (!course) {
    notFound();
  }

  const t = await getTranslations({ locale: safeLocale, namespace: 'actions' });
  const lessons = await getCourseCurriculum(course.id, safeLocale);
  const sales = toSalesContent(course, safeLocale);
  const curriculum = toCurriculumModules(course, lessons, safeLocale);

  return (
    <>
      <section className={styles.salesHero}>
        <div className={styles.salesHero__inner}>
          <div>
            <Link className={styles.salesBreadcrumb} href="/courses">
              ← <span className={styles.red}>{sales.breadcrumb}</span> / {course.title}
            </Link>
            <AccessNotice />
            <div className={styles.salesTag}>{sales.tag}</div>
            <h1 className={styles.salesTitle}>
              {sales.title.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h1>
            <p className={styles.salesPain}>{sales.pain}</p>
            <div className={styles.outcomes}>
              {sales.outcomes.map((outcome) => (
                <div className={styles.outcome} key={outcome}>
                  {outcome}
                </div>
              ))}
            </div>
          </div>
          <PricingBox
            courseSlug={course.slug}
            loginHref={`/${safeLocale}/login?next=${encodeURIComponent(`/${safeLocale}/courses/${course.slug}`)}`}
            sales={sales}
          />
        </div>
      </section>

      <section className={styles.salesSection}>
        <h2 className={styles.salesSection__title}>{sales.modulesTitle}</h2>
        <CurriculumAccordion modules={curriculum} />
      </section>

      <section className={styles.ctaSection}>
        <Link className={styles.button} href={`/courses/${course.slug}`}>
          {sales.enrollCta}
        </Link>
      </section>

      <Footer compact />
    </>
  );
}
