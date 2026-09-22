import { Icon } from '@/components/ui/Icon';
import { Section, SectionHeader } from '@/components/ui/Section';
import type { HomeContent } from '@/lib/content';
import blocks from '@/components/landing/styles/MarketingBlocks.module.scss';
import styles from './AboutPage.module.scss';

interface Props {
  content: HomeContent;
}

/*
  Отдельная страница «о школе»: та же композиция, что у секции инструктора на
  главной и на проде — портрет с регалиями слева, рассказ от первого лица и
  кадр с тренировки справа. Добавлены только цифры школы и соцсети. Тексты —
  те же поля HomeContent: их утвердил заказчик, переписывать их нельзя.
*/
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
        <div className={blocks.instructor}>
          <div className={blocks.instructorAside}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={content.instructorName} className={blocks.instructorPhoto} src="/vlad.jpg" />
            <div className={blocks.instructorCard}>
              <p className={blocks.instructorName}>{content.instructorName}</p>
              <p className={blocks.instructorRole}>{content.instructorRole}</p>
              {content.instructorCredentials ? (
                <ul className={blocks.checkList}>
                  {content.instructorCredentials.map((credential) => (
                    <li className={blocks.checkItem} key={credential}>
                      <Icon className={blocks.checkIcon} name="check" size={16} />
                      <span>{credential}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
          <div className={blocks.instructorBody}>
            {content.instructorTitle.length > 0 ? (
              <h2 className={blocks.instructorTitle}>{content.instructorTitle.join(' ')}</h2>
            ) : null}
            <dl className={styles.stats}>
              {content.stats.map((stat) => (
                <div className={styles.stat} key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
            {content.instructorCopy.map((paragraph) => (
              <p className={blocks.prose} key={paragraph}>
                {paragraph}
              </p>
            ))}
            <div className={styles.socials}>
              {content.socialLinks.map((social) => (
                <a
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt={content.instructorName}
              className={blocks.instructorActionPhoto}
              src="/vlad-training.jpg"
            />
          </div>
        </div>
      </Section>
    </main>
  );
}
