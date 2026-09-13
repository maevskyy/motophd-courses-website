'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import type { CurriculumModule, PlayerContent } from '@/lib/data';
import { cx } from '@/lib/classNames';
import { LessonDownloads } from './LessonDownloads';
import { LessonVideo } from './LessonVideo';
import { PlayerSidebarLesson } from './PlayerSidebarLesson';
import styles from './CoursePlayer.module.scss';

type PlayerTab = 'notes' | 'downloads' | 'overview';

interface Props {
  courseSlug: string;
  curriculum: CurriculumModule[];
  player: PlayerContent;
}

export function CoursePlayerClient({ courseSlug, curriculum, player }: Props) {
  const t = useTranslations();
  const [tab, setTab] = useState<PlayerTab>('notes');

  return (
    <main className={styles.playerLayout}>
      <section className={styles.playerMain}>
        <div className={styles.videoContainer}>
          <LessonVideo player={player} />
        </div>
        <div className={styles.videoInfo}>
          <div className={styles.videoInfo__meta}>
            {t('player.lessonMeta', { current: player.lessonNumber, total: player.lessonCount })}
          </div>
          <h1>{player.title}</h1>
          <p>{player.subtitle}</p>
        </div>
        <div className={styles.videoTabs}>
          {[
            ['notes', t('player.notes')],
            ['downloads', t('player.downloads')],
            ['overview', t('player.overview')]
          ].map(([id, label]) => (
            <button
              className={cx(styles.videoTab, tab === id && styles.videoTabActive)}
              key={id}
              onClick={() => setTab(id as PlayerTab)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
        <div className={styles.videoTabContent}>
          {tab === 'notes' ? (
            <div className={styles.contentNarrow}>
              <h2 className={styles.lessonHeading}>{t('player.keyTakeaways')}</h2>
              <ul className={styles.takeaways}>
                {player.notes.map((note) => (
                  <li key={note}>✓ {note}</li>
                ))}
              </ul>
              <div className={styles.callout}>
                <div className={styles.calloutLabel}>{t('player.feelLabel')}</div>
                <div className={styles.calloutText}>{player.feel}</div>
              </div>
            </div>
          ) : null}

          {tab === 'downloads' ? (
            <LessonDownloads player={player} />
          ) : null}

          {tab === 'overview' ? (
            <div className={styles.contentNarrow}>
              <h2 className={styles.lessonHeading}>{player.overviewTitle}</h2>
              <p className={styles.instructorCopy}>{player.overviewCopy}</p>
              <div className={styles.moduleOutcomeBox}>
                <div className={styles.calloutLabel}>{t('player.moduleOutcome')}</div>
                <div className={styles.calloutText}>
                  After completing this module you will:
                  {player.moduleOutcome.map((outcome) => (
                    <span key={outcome}>
                      <br />✓ {outcome}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      <aside className={styles.playerSidebar}>
        <div className={styles.playerSidebarTitle}>{player.sidebarTitle}</div>
        {curriculum.map((module) => (
          <div className={styles.sidebarModule} key={module.number}>
            <div className={styles.sidebarModuleHeader}>
              Module {module.number}: {module.title} <span>›</span>
            </div>
            {module.lessons.map((lesson) => (
              <PlayerSidebarLesson
                active={lesson.order === player.currentLessonOrder}
                courseSlug={courseSlug}
                key={lesson.order}
                label={lesson.name}
                order={lesson.order}
              />
            ))}
          </div>
        ))}
        <div className={styles.sidebarFooter}>
          <Link className={styles.sidebarBack} href="/dashboard">
            ← {t('actions.backToDashboard')}
          </Link>
        </div>
      </aside>
    </main>
  );
}
