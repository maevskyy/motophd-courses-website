import { Link } from '@/i18n/routing';
import { FaqAccordion } from '@/components/prototype/FaqAccordion';
import { Footer } from '@/components/prototype/Footer';
import type { HomeContent } from '@/lib/content';
import { landingStyles as styles } from './styles';

interface Props {
  content: HomeContent;
  labels: {
    joinCommunity?: string;
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
        {labels.joinCommunity ? (
          <Link className={`${styles.button} ${styles.ctaButton}`} href="/courses">
            {labels.joinCommunity}
          </Link>
        ) : null}
      </section>
      <Footer socialLinks={content.socialLinks} />
    </>
  );
}
