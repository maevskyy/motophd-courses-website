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
  getCourseLessons,
  toAppLocale,
  toCurriculumModules,
  toSalesContent
} from '@/lib/data';
import type { Locale } from '@/i18n/routing';
import styles from '@/components/courseSales/CourseSalesPage.module.scss';

export const dynamic = 'force-dynamic';

export default async function CourseSalesPage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  await connection();

  const [{ locale, slug }, user] = await Promise.all([params, getCurrentUser()]);
  const safeLocale = toAppLocale(locale) satisfies Locale;
  const course = await getCourseBySlug(slug, safeLocale);

  if (!course) {
    notFound();
  }

  const t = await getTranslations({ locale: safeLocale, namespace: 'actions' });
  const lessons = await getCourseLessons(course.id, safeLocale);
  const sales = toSalesContent(course, safeLocale);
  const curriculum = toCurriculumModules(course, lessons);

  return (
    <>
      <section className={styles.salesHero}>
        <div className={styles.salesHero__inner}>
          <div>
            <Link className={styles.salesBreadcrumb} href="/courses">
              ← <span className={styles.red}>{sales.breadcrumb}</span> / {course.title}
            </Link>
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
        <h2 className={styles.salesSection__title}>Course Curriculum</h2>
        <p className={styles.section__sub}>{sales.curriculumIntro}</p>
        <div className={styles.hero__buttons}>
          <Link className={styles.buttonGhost} href={`/learn/${course.slug}`}>
            Preview player
          </Link>
        </div>
        <CurriculumAccordion modules={curriculum} />
      </section>

      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>
          {sales.bottomTitle.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
          <span className={styles.red}>{sales.bottomAccent}</span>
        </h2>
        <p className={styles.ctaSub}>{sales.bottomSub}</p>
        <Link className={`${styles.button} ${styles.buttonLarge}`} href={`/courses/${course.slug}`}>
          {t('enrollNow')} — €{course.priceStandard}
        </Link>
      </section>

      <Footer compact />
    </>
  );
}
