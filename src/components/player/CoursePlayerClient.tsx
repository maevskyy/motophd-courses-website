'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { AppShell } from '@/components/app/AppShell';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import type { CurriculumModule, PlayerContent } from '@/lib/data';
import { lessonHref, useCourseProgress } from '@/lib/progress';
import { getActiveLesson } from './activeLesson';
import { LessonDownloads } from './LessonDownloads';
import { LessonNav } from './LessonNav';
import { LessonVideo } from './LessonVideo';
import { PlayerRail } from './PlayerRail';
import { PlayerSidebar } from './PlayerSidebar';
import { usePlayerSidebar } from './usePlayerSidebar';
import styles from './CoursePlayer.module.scss';

interface Props {
  // order из URL; без него активный урок — следующий непройденный.
  activeOrder?: number;
  curriculum: CurriculumModule[];
  player: PlayerContent;
}

export function CoursePlayerClient({ activeOrder, curriculum, player }: Props) {
  const t = useTranslations('player');
  const router = useRouter();
  const { markDone, progress } = useCourseProgress(player.courseSlug);
  const lesson = getActiveLesson(player.lessons, activeOrder, progress);
  const sidebar = usePlayerSidebar(lesson?.order ?? 0);

  if (!lesson) {
    return (
      <main className={styles.emptyLayout}>
        <p className={styles.empty}>{t('noLessons')}</p>
      </main>
    );
  }

  const index = player.lessons.indexOf(lesson);
  const prev = player.lessons[index - 1];
  const next = player.lessons[index + 1];
  // На узком экране свёрнутость не действует: там оглавление — drawer.
  const showRail = sidebar.collapsed && !sidebar.narrow;

  // «Завершить и продолжить»: отметка в localStorage и переход на канонический
  // адрес следующего урока; на последнем — в кабинет.
  const complete = () => {
    markDone(lesson.order);
    router.push(next ? lessonHref(player.courseSlug, next) : '/dashboard');
  };

  return (
    <div
      className={cx(
        styles.player,
        showRail && styles.playerCollapsed,
        sidebar.drawerOpen && styles.playerDrawerOpen
      )}
    >
      <AppShell
        sidebar={
          showRail ? (
            <PlayerRail
              activeOrder={lesson.order}
              curriculum={curriculum}
              onExpand={sidebar.toggleCollapsed}
              player={player}
            />
          ) : (
            <PlayerSidebar
              activeOrder={lesson.order}
              narrow={sidebar.narrow}
              onHide={sidebar.narrow ? sidebar.closeDrawer : sidebar.toggleCollapsed}
              player={player}
              progress={progress}
            />
          )
        }
      >
        <div className={styles.content}>
          <div className={styles.column}>
            <button
              aria-expanded={sidebar.drawerOpen}
              className={styles.contentsBtn}
              onClick={sidebar.toggleDrawer}
              ref={sidebar.toggleRef}
              type="button"
            >
              <Icon name="menu" size={16} />
              {t('contents')}
            </button>

            {lesson.type === 'video' ? (
              <div className={styles.videoContainer}>
                <LessonVideo lesson={lesson} />
              </div>
            ) : null}

            <header className={styles.lessonHeader}>
              <p className={styles.lessonMeta}>
                {t('lessonMeta', {
                  current: index + 1,
                  total: player.lessons.length
                })}
              </p>
              <h1 className={styles.lessonTitle}>{lesson.title}</h1>
            </header>

            <LessonDownloads download={lesson.download} />
            <LessonNav
              courseSlug={player.courseSlug}
              hasNext={Boolean(next)}
              onComplete={complete}
              prev={prev}
            />
          </div>
        </div>
      </AppShell>

      {sidebar.drawerOpen ? (
        <button
          aria-label={t('closeContents')}
          className={styles.backdrop}
          onClick={sidebar.closeDrawer}
          tabIndex={-1}
          type="button"
        />
      ) : null}
    </div>
  );
}
