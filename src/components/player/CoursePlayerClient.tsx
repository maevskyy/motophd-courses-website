'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { SidebarLesson } from '@/components/prototype/CurriculumAccordion';
import type { CurriculumModule, PlayerContent } from '@/lib/data';
import { cx } from '@/lib/classNames';
import { LessonDownloads } from './LessonDownloads';
import { LessonVideo } from './LessonVideo';
import styles from './CoursePlayer.module.scss';

type PlayerTab = 'notes' | 'downloads' | 'overview';

export function CoursePlayerClient({
  curriculum,
  player
}: {
  curriculum: CurriculumModule[];
  player: PlayerContent;
}) {
  const t = useTranslations();
  const [tab, setTab] = useState<PlayerTab>('notes');

  return (
    <main className={styles.playerLayout}>
      <section className={styles.playerMain}>
        <div className={styles.videoContainer}>
          <LessonVideo player={player} />
        </div>
        <div className={styles.videoInfo}>
          <div className={styles.videoInfo__meta}>{t('player.lessonMeta')}</div>
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
        {curriculum.map((module, moduleIndex) => (
          <div className={styles.sidebarModule} key={module.number}>
            <div className={styles.sidebarModuleHeader}>
              Module {module.number}: {module.title} <span>›</span>
            </div>
            {module.lessons.map((lesson, lessonIndex) => (
              <SidebarLesson
                active={moduleIndex === 0 && lessonIndex === 1}
                done={moduleIndex === 0 && lessonIndex === 0}
                key={lesson.name}
                label={lesson.name}
                toast={
                  moduleIndex === 0 && lessonIndex === 0
                    ? t('toast.opening', { name: lesson.name })
                    : moduleIndex === 0 && lessonIndex === 1
                      ? t('toast.nowPlaying')
                      : t('toast.loadingLesson')
                }
              />
            ))}
          </div>
        ))}
        <div className={styles.sidebarProgress}>
          <div className={styles.sidebarProgressCard}>
            <div className={styles.sidebarProgressLabel}>{t('player.courseProgress')}</div>
            <div className={styles.progressBar}>
              <div className={`${styles.progressFill} ${styles.progressFillSmall}`} />
            </div>
            <div className={styles.sidebarProgressText}>{t('player.lessonsComplete')}</div>
          </div>
          <Link className={styles.sidebarBack} href="/dashboard">
            ← {t('actions.backToDashboard')}
          </Link>
        </div>
      </aside>
    </main>
  );
}
