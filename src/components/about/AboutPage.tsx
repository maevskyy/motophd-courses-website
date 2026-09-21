import { Icon } from '@/components/ui/Icon';
import { Section, SectionHeader } from '@/components/ui/Section';
import type { HomeContent } from '@/lib/content';
import styles from './AboutPage.module.scss';

interface Props {
  content: HomeContent;
}

export function AboutPage({ content }: Props) {
  return (
    <main>
      <Section>
        <SectionHeader
          as="h1"
          kicker={content.heroBadge}
          lead={content.heroSub}
          title={content.instructorLabel}
        />
        <div className={styles.school}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={content.instructorName} className={styles.schoolImage} src="/vlad-training.jpg" />
          <div className={styles.schoolContent}>
            <dl className={styles.stats}>
              {content.stats.map((stat) => (
                <div className={styles.stat} key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
            {content.instructorCopy.map((paragraph) => (
              <p className={styles.prose} key={paragraph}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </Section>

      <Section bordered tone="alt">
        <div className={styles.instructor}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt={content.instructorName} className={styles.portrait} src="/vlad.jpg" />
          <div className={styles.instructorContent}>
            <p className={styles.name}>{content.instructorName}</p>
            <p className={styles.role}>{content.instructorRole}</p>
            {content.instructorCredentials ? (
              <ul className={styles.credentials}>
                {content.instructorCredentials.map((credential) => (
                  <li key={credential}>
                    <Icon aria-hidden="true" name="check" size={16} />
                    <span>{credential}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className={styles.socials}>
              {content.socialLinks.map((social) => (
                <a
                  aria-label={social.label}
                  className={styles.social}
                  href={social.href}
                  key={social.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon aria-hidden="true" name={social.platform} size={18} />
                  {social.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Section>
    </main>
  );
}
