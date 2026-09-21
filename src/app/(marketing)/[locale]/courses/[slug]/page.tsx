import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { Link } from '@/i18n/routing';
import { AccessNotice } from '@/components/courseSales/AccessNotice';
import { CourseTeaser } from '@/components/courseSales/CourseTeaser';
import { StickyBuyBar } from '@/components/courseSales/StickyBuyBar';
import { CurriculumAccordion } from '@/components/prototype/CurriculumAccordion';
import { Footer } from '@/components/prototype/Footer';
import { PricingBox } from '@/components/prototype/PricingBox';
import { Icon } from '@/components/ui/Icon';
import {
  getCourseBySlug,
  getCourseCurriculum,
  toCurriculumModules,
  toSalesContent,
  type AppLocale
} from '@/lib/data';
import { getPaymentProvider } from '@/lib/payments';
import { getTeaserEmbedUrl } from '@/lib/video';
import { buildPageMetadata, courseCoverImage, resolveSeoLocale } from '@/lib/seo';
import { requireLocale } from '@/i18n/requireLocale';
import styles from '@/components/courseSales/CourseSalesPage.module.scss';

export const revalidate = 300;

// Пустой список: страницы рендерятся при первом заходе и кэшируются (ISR),
// чтобы сборка в CI обходилась без работающей базы. Персональное (логин,
// ?access=denied) добирают клиентские AccessNotice и PricingBox.
export function generateStaticParams() {
  return [];
}

// Один запрос на рендер: generateMetadata и страница читают тот же курс.
const loadCourse = cache((slug: string, locale: AppLocale) => getCourseBySlug(slug, locale));

// Title/description курса — его название и описание из Payload (локализованы),
// og:image — обложка курса, если загружена; иначе дефолтная картинка сайта.
export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const seoLocale = resolveSeoLocale(locale);
  const course = seoLocale ? await loadCourse(slug, seoLocale) : null;

  if (!seoLocale || !course) {
    return {};
  }

  return buildPageMetadata({
    description: course.description || course.pain,
    image: courseCoverImage(course),
    locale: seoLocale,
    path: `/courses/${course.slug}`,
    title: course.title
  });
}

export default async function CourseSalesPage({
  params
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { locale, slug } = await params;
  const safeLocale = requireLocale(locale);
  const course = await loadCourse(slug, safeLocale);

  if (!course) {
    notFound();
  }

  const lessons = await getCourseCurriculum(course.id, safeLocale);
  const sales = toSalesContent(course, safeLocale);
  const curriculum = toCurriculumModules(course, lessons, safeLocale);

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.intro}>
            <Link className={styles.breadcrumb} href="/courses">
              <Icon name="arrowLeft" size={16} />
              {sales.breadcrumb}
            </Link>
            <AccessNotice />
            <p className={styles.tag}>{sales.tag}</p>
            <h1 className={styles.title}>{sales.title.join(' ')}</h1>
            <p className={styles.pain}>{sales.pain}</p>
            <ul className={styles.outcomes}>
              {sales.outcomes.map((outcome) => (
                <li className={styles.outcome} key={outcome}>
                  <Icon className={styles.outcomeIcon} name="check" size={18} />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </div>
          <PricingBox
            checkoutEnabled={Boolean(getPaymentProvider())}
            className={styles.pricing}
            courseSlug={course.slug}
            locale={safeLocale}
            sales={sales}
          />
          <div className={styles.modules}>
            <CourseTeaser
              courseTitle={course.title}
              embedUrl={getTeaserEmbedUrl(course.teaserVideoId)}
              title={sales.teaserTitle}
            />
            <h2 className={styles.sectionTitle}>{sales.modulesTitle}</h2>
            <CurriculumAccordion modules={curriculum} />
          </div>
        </div>
      </section>

      {/* Закрывающий призыв — как в main: ведёт на ту же страницу, к блоку цены. */}
      <section className={styles.cta}>
        <Link className={styles.ctaButton} href={`/courses/${course.slug}`}>
          {sales.enrollCta}
        </Link>
      </section>

      <Footer compact />
      {/* Единственный дубль главного действия — и только там, где блок цены
          уехал с экрана: на телефоне. */}
      <StickyBuyBar price={sales.options[0].price} targetId="pricing" />
    </>
  );
}
