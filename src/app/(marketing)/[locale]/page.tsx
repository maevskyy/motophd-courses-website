import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { CourseCard } from '@/components/prototype/CourseCard';
import { FaqAccordion } from '@/components/prototype/FaqAccordion';
import { Footer } from '@/components/prototype/Footer';
import { localizedCourses, prototypeContent } from '@/lib/content/prototype';
import type { Locale } from '@/i18n/routing';
import styles from '@/components/prototype/Prototype.module.scss';

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const safeLocale = (locale === 'ru' ? 'ru' : 'en') satisfies Locale;
  const t = await getTranslations({ locale: safeLocale, namespace: 'actions' });
  const content = prototypeContent[safeLocale].home;
  const courses = localizedCourses[safeLocale];

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.hero__bg} />
        <div className={styles.hero__grid} />
        <div className={styles.hero__glow} />
        <div className={styles.hero__content}>
          <div className={styles.hero__badge}>{content.heroBadge}</div>
          <h1 className={styles.hero__title}>
            {content.heroTitle.map((line) => (
              <span key={line}>
                {line}
                <br />
              </span>
            ))}
            <span className={styles.red}>{content.heroRed}</span>
            <br />
            {content.heroAfterRed}
          </h1>
          <p className={styles.hero__sub}>{content.heroSub}</p>
          <div className={styles.hero__buttons}>
            <Link className={styles.button} href="/courses">
              {t('startLearning')}
            </Link>
            <Link className={styles.buttonGhost} href="/courses">
              {t('viewCourses')}
            </Link>
          </div>
          <div className={styles.hero__stats}>
            {content.stats.map((stat) => (
              <div key={stat.label}>
                <div className={styles.stat__num}>
                  {stat.accent ? (
                    <>
                      <span className={styles.red}>{stat.accent}</span>
                      {stat.value.replace(stat.accent, '')}
                    </>
                  ) : (
                    stat.value
                  )}
                </div>
                <div className={styles.stat__label}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className={styles.authority}>
        <div className={styles.authority__inner}>
          {content.stats.map((stat) => (
            <div className={styles.authority__item} key={stat.label}>
              <div className={styles.authority__num}>
                {stat.accent ? <span className={styles.red}>{stat.accent}</span> : stat.value}
                {stat.accent ? stat.value.replace(stat.accent, '') : null}
              </div>
              <div className={styles.authority__label}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section className={styles.section}>
        <div className={styles.section__label}>{content.coursesLabel}</div>
        <h2 className={styles.section__title}>
          {content.coursesTitle.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </h2>
        <p className={styles.section__sub}>{content.coursesSub}</p>
        <div className={styles.coursesGrid}>
          {courses.map((course) => (
            <CourseCard course={course} key={course.slug} />
          ))}
        </div>
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <div className={styles.section__label}>{content.methodLabel}</div>
        <h2 className={styles.section__title}>{content.methodTitle}</h2>
        <p className={styles.section__sub}>{content.methodSub}</p>
        <div className={styles.methodGrid}>
          {content.method.map((item) => (
            <div className={styles.methodCard} key={item.title}>
              <div className={styles.methodIcon}>{item.icon}</div>
              <div className={styles.methodNum}>{item.num}</div>
              <div className={styles.methodTitle}>{item.title}</div>
              <div className={styles.methodDesc}>{item.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <div className={styles.section__label}>{content.testimonialsLabel}</div>
        <h2 className={styles.section__title}>
          {content.testimonialsTitle.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </h2>
        <div className={styles.testimonialsGrid}>
          {content.testimonials.map((testimonial) => (
            <article className={styles.testiCard} key={testimonial.name}>
              <div className={styles.testiStars}>★★★★★</div>
              <blockquote className={styles.testiQuote}>“{testimonial.quote}”</blockquote>
              <div className={styles.testiAuthor}>
                <div className={styles.testiAvatar}>{testimonial.initial}</div>
                <div>
                  <div className={styles.testiName}>{testimonial.name}</div>
                  <div className={styles.testiCountry}>{testimonial.country}</div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <div className={styles.section__label}>{content.howLabel}</div>
        <h2 className={styles.section__title}>
          {content.howTitle.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </h2>
        <div className={styles.howSteps}>
          {content.steps.map((step) => (
            <div className={styles.howStep} key={step.num}>
              <div className={styles.howStep__num}>{step.num}</div>
              <div className={styles.howStep__title}>{step.title}</div>
              <div className={styles.howStep__desc}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <div id="about-anchor" />
      <hr className={styles.divider} />

      <section className={styles.section}>
        <div className={styles.section__label}>{content.instructorLabel}</div>
        <div className={styles.instructorGrid}>
          <div>
            <h2 className={styles.section__title}>
              {content.instructorTitle.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
            {content.instructorCopy.map((paragraph) => (
              <p className={styles.instructorCopy} key={paragraph}>
                {paragraph}
              </p>
            ))}
            <Link className={styles.button} href="/courses">
              {t('browseAllCourses')}
            </Link>
          </div>
          <div className={styles.instructorCard}>
            <div className={styles.instructorIcon}>👨‍🏫</div>
            <div className={styles.instructorName}>{content.instructorName}</div>
            <div className={styles.instructorRole}>{content.instructorRole}</div>
            <div className={styles.miniStats}>
              <div className={styles.miniStat}>
                <div className={styles.miniStat__num}>5K+</div>
                <div className={styles.miniStat__label}>Riders Coached</div>
              </div>
              <div className={styles.miniStat}>
                <div className={styles.miniStat__num}>10+</div>
                <div className={styles.miniStat__label}>Years Experience</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className={styles.divider} />

      <section className={styles.section}>
        <div className={styles.section__label}>{content.faqLabel}</div>
        <h2 className={styles.section__title}>{content.faqTitle}</h2>
        <FaqAccordion items={content.faq} />
      </section>

      <section className={styles.ctaSection}>
        <h2 className={styles.ctaTitle}>
          {content.ctaTitle.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
          <span className={styles.red}>{content.ctaAccent}</span>
        </h2>
        <p className={styles.ctaSub}>{content.ctaSub}</p>
        <Link className={`${styles.button} ${styles.buttonLarge}`} href="/courses">
          {t('enrollNow')}
        </Link>
      </section>

      <Footer />
    </>
  );
}
