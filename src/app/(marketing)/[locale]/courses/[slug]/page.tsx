import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { Link } from '@/i18n/routing';
import { CurriculumAccordion } from '@/components/prototype/CurriculumAccordion';
import { Footer } from '@/components/prototype/Footer';
import { PricingBox } from '@/components/prototype/PricingBox';
import { getCurrentUser } from '@/lib/auth';
import {
  getCourseBySlug,
  getCourseCurriculum,
  toAppLocale,
  toCurriculumModules,
  toSalesContent
} from '@/lib/data';
import type { Locale } from '@/i18n/routing';
import styles from '@/components/courseSales/CourseSalesPage.module.scss';

export const dynamic = 'force-dynamic';

export default async function CourseSalesPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string; locale: string }>;
  searchParams: Promise<{ access?: string }>;
}) {
  await connection();

  const [{ locale, slug }, user, { access }] = await Promise.all([
    params,
    getCurrentUser(),
    searchParams
  ]);
  const safeLocale = toAppLocale(locale) satisfies Locale;
  const course = await getCourseBySlug(slug, safeLocale, user || undefined);

  if (!course) {
    notFound();
  }

  const accessT = await getTranslations({ locale: safeLocale, namespace: 'access' });
  const lessons = await getCourseCurriculum(course.id, safeLocale, user || undefined);
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
            {access === 'denied' ? (
              <p className={styles.salesAccessNotice} role="alert">
                {accessT('courseDenied')}
              </p>
            ) : null}
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
            isLoggedIn={Boolean(user)}
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
