import { Link } from '@/i18n/routing';
import { FaqAccordion } from '@/components/prototype/FaqAccordion';
import { Footer } from '@/components/prototype/Footer';
import type { HomeContent } from '@/lib/content';
import { landingStyles as styles } from './styles';

interface Props {
  content: HomeContent;
  labels: {
    browseAllCourses: string;
    enrollNow: string;
  };
}

export function LandingBottom({ content, labels }: Props) {
  return (
    <>
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
              {labels.browseAllCourses}
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
          {labels.enrollNow}
        </Link>
      </section>
      <Footer />
    </>
  );
}
