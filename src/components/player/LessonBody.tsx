import { RichText } from '@payloadcms/richtext-lexical/react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import type { PlayerLesson } from '@/lib/data';
import styles from './LessonContent.module.scss';

interface Props {
  body: PlayerLesson['body'];
  feel: string;
  keyTakeaways: string[];
}

// Тело урока из CMS сверху (если заполнено), поля курса — ниже.
export function LessonBody({ body, feel, keyTakeaways }: Props) {
  const t = useTranslations('player');

  return (
    <div className={styles.lessonText}>
      {body ? <RichText className={styles.richText} data={body} /> : null}

      {keyTakeaways.length > 0 ? (
        <section>
          <h2 className={styles.sectionTitle}>{t('keyTakeaways')}</h2>
          <ul className={styles.takeaways}>
            {keyTakeaways.map((note) => (
              <li className={styles.takeaway} key={note}>
                <Icon className={styles.takeawayIcon} name="check" size={16} />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {feel ? (
        <div className={styles.callout}>
          <p className={styles.calloutLabel}>{t('feelLabel')}</p>
          <p className={styles.calloutText}>{feel}</p>
        </div>
      ) : null}
    </div>
  );
}
