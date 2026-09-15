import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import type { PlayerContent } from '@/lib/data';
import { LessonDownloads } from './LessonDownloads';
import styles from './LessonContent.module.scss';

type PlayerTab = 'notes' | 'downloads' | 'overview';

interface Props {
  player: PlayerContent;
}

// Вкладки под видео — как в main: заметки урока, материалы, обзор модуля.
export function LessonTabs({ player }: Props) {
  const t = useTranslations('player');
  const [tab, setTab] = useState<PlayerTab>('notes');
  const tabs: Array<[PlayerTab, string]> = [
    ['notes', t('notes')],
    ['downloads', t('downloads')],
    ['overview', t('overview')]
  ];

  return (
    <>
      <div className={styles.tabs} role="tablist">
        {tabs.map(([id, label]) => (
          <button
            aria-selected={tab === id}
            className={cx(styles.tab, tab === id && styles.tabActive)}
            key={id}
            onClick={() => setTab(id)}
            role="tab"
            type="button"
          >
            {label}
          </button>
        ))}
      </div>
      <div className={styles.tabContent}>
        {tab === 'notes' ? (
          <div className={styles.lessonText}>
            <section>
              <h2 className={styles.sectionTitle}>{t('keyTakeaways')}</h2>
              <ul className={styles.takeaways}>
                {player.notes.map((note) => (
                  <li className={styles.takeaway} key={note}>
                    <Icon className={styles.takeawayIcon} name="check" size={16} />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </section>
            <div className={styles.callout}>
              <p className={styles.calloutLabel}>{t('feelLabel')}</p>
              <p className={styles.calloutText}>{player.feel}</p>
            </div>
          </div>
        ) : null}

        {tab === 'downloads' ? <LessonDownloads player={player} /> : null}

        {tab === 'overview' ? (
          <div className={styles.lessonText}>
            <section>
              <h2 className={styles.sectionTitle}>{player.overviewTitle}</h2>
              <p className={styles.prose}>{player.overviewCopy}</p>
            </section>
            <div className={styles.callout}>
              <p className={styles.calloutLabel}>{t('moduleOutcome')}</p>
              <p className={styles.calloutText}>After completing this module you will:</p>
              <ul className={styles.takeaways}>
                {player.moduleOutcome.map((outcome) => (
                  <li className={styles.takeaway} key={outcome}>
                    <Icon className={styles.takeawayIcon} name="check" size={16} />
                    <span>{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
