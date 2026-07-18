import { getTranslations } from 'next-intl/server';
import { Link, redirect } from '@/i18n/routing';
import { CurriculumAccordion } from '@/components/prototype/CurriculumAccordion';
import { Footer } from '@/components/prototype/Footer';
import { PricingBox } from '@/components/prototype/PricingBox';
import { curriculum, prototypeContent } from '@/lib/content/prototype';
import type { Locale } from '@/i18n/routing';
import styles from '@/components/prototype/Prototype.module.scss';

export default async function CourseSalesPage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const locale = (await params).locale;
  const safeLocale = (locale === 'ru' ? 'ru' : 'en') satisfies Locale;

  if (slug !== 'lean') {
    redirect({ href: '/courses/lean', locale: safeLocale });
  }

  const t = await getTranslations({ locale: safeLocale, namespace: 'actions' });
  const sales = prototypeContent[safeLocale].sales;

  return (
    <>
      <section className={styles.salesHero}>
        <div className={styles.salesHero__inner}>
          <div>
            <Link className={styles.salesBreadcrumb} href="/courses">
              ← <span className={styles.red}>{sales.breadcrumb}</span> / Stop Being Afraid to Lean
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
          <PricingBox sales={sales} />
        </div>
      </section>

      <section className={styles.salesSection}>
        <h2 className={styles.salesSection__title}>Course Curriculum</h2>
        <p className={styles.section__sub}>{sales.curriculumIntro}</p>
        <div className={styles.hero__buttons}>
          <Link className={styles.buttonGhost} href="/learn/lean">
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
        <Link className={`${styles.button} ${styles.buttonLarge}`} href="/courses/lean">
          {t('enrollNow')} — €29
        </Link>
      </section>

      <Footer compact />
    </>
  );
}
