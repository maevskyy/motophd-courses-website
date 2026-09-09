'use client';

import { useTranslations } from 'next-intl';
import { useId, useState } from 'react';
import { Link } from '@/i18n/routing';
import { SidebarLesson } from '@/components/prototype/CurriculumAccordion';
import { Icon } from '@/components/ui/Icon';
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
  const tabsId = useId();

  const tabs: Array<[PlayerTab, string]> = [
    ['notes', t('player.notes')],
    ['downloads', t('player.downloads')],
    ['overview', t('player.overview')]
  ];

  return (
    <div className={styles.layout}>
      <main className={styles.main}>
        <div className={styles.videoContainer}>
          <LessonVideo player={player} />
        </div>

        {/*
          Текст урока держится в колонке читаемой ширины и центрируется:
          раньше он прижимался влево и справа оставалось полэкрана пустого фона.
        */}
        <div className={styles.column}>
          <header className={styles.lessonHeader}>
            <p className={styles.lessonMeta}>{t('player.lessonMeta')}</p>
            <h1 className={styles.lessonTitle}>{player.title}</h1>
            <p className={styles.lessonSub}>{player.subtitle}</p>
          </header>

          <div className={styles.tabs} role="tablist">
            {tabs.map(([id, label]) => (
              <button
                aria-controls={`${tabsId}-${id}`}
                aria-selected={tab === id}
                className={cx(styles.tab, tab === id && styles.tabActive)}
                id={`${tabsId}-tab-${id}`}
                key={id}
                onClick={() => setTab(id)}
                role="tab"
                type="button"
              >
                {label}
              </button>
            ))}
          </div>

          <div
            aria-labelledby={`${tabsId}-tab-${tab}`}
            className={styles.panel}
            id={`${tabsId}-${tab}`}
            role="tabpanel"
          >
            {tab === 'notes' ? (
              <>
                <h2 className={styles.panelTitle}>{t('player.keyTakeaways')}</h2>
                <ul className={styles.takeaways}>
                  {player.notes.map((note) => (
                    <li className={styles.takeaway} key={note}>
                      <Icon className={styles.takeawayIcon} name="check" size={16} />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
                <div className={styles.callout}>
                  <p className={styles.calloutLabel}>{t('player.feelLabel')}</p>
                  <p className={styles.calloutText}>{player.feel}</p>
                </div>
              </>
            ) : null}

            {tab === 'downloads' ? <LessonDownloads player={player} /> : null}

            {tab === 'overview' ? (
              <>
                <h2 className={styles.panelTitle}>{player.overviewTitle}</h2>
                <p className={styles.prose}>{player.overviewCopy}</p>
                <div className={styles.callout}>
                  <p className={styles.calloutLabel}>{t('player.moduleOutcome')}</p>
                  <ul className={styles.takeaways}>
                    {player.moduleOutcome.map((outcome) => (
                      <li className={styles.takeaway} key={outcome}>
                        <Icon className={styles.takeawayIcon} name="check" size={16} />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </main>

      <aside className={styles.sidebar}>
        <p className={styles.sidebarTitle}>{player.sidebarTitle}</p>
        <div className={styles.sidebarScroll}>
          {curriculum.map((module, moduleIndex) => (
            <section className={styles.sidebarModule} key={module.number}>
              <h2 className={styles.sidebarModuleHeader}>
                <span className={styles.sidebarModuleNum}>{module.number}</span>
                <span>{module.title}</span>
              </h2>
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
            </section>
          ))}
        </div>
        <div className={styles.sidebarFooter}>
          <div className={styles.progressCard}>
            <p className={styles.progressLabel}>{t('player.courseProgress')}</p>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} />
            </div>
            <p className={styles.progressText}>{t('player.lessonsComplete')}</p>
          </div>
          <Link className={styles.backLink} href="/dashboard">
            <Icon name="arrowLeft" size={16} />
            {t('actions.backToDashboard')}
          </Link>
        </div>
      </aside>
    </div>
  );
}
