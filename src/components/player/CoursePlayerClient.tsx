'use client';

import { useTranslations } from 'next-intl';
import { AppShell } from '@/components/app/AppShell';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import type { CurriculumModule, PlayerContent } from '@/lib/data';
import { LessonTabs } from './LessonTabs';
import { LessonVideo } from './LessonVideo';
import { PlayerRail } from './PlayerRail';
import { PlayerSidebar } from './PlayerSidebar';
import { usePlayerSidebar } from './usePlayerSidebar';
import styles from './CoursePlayer.module.scss';

interface Props {
  courseSlug: string;
  curriculum: CurriculumModule[];
  player: PlayerContent;
}

// Текущий урок выбирает сервер по ?lesson=<order> (см. learn/[slug]/page.tsx):
// клиент только рисует его и оглавление, где уроки — ссылки на тот же плеер.
export function CoursePlayerClient({ courseSlug, curriculum, player }: Props) {
  const t = useTranslations('player');
  const sidebar = usePlayerSidebar(player.currentLessonOrder ?? 0);
  // На узком экране свёрнутость не действует: там оглавление — drawer.
  const showRail = sidebar.collapsed && !sidebar.narrow;

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
              activeOrder={player.currentLessonOrder}
              courseSlug={courseSlug}
              curriculum={curriculum}
              onExpand={sidebar.toggleCollapsed}
            />
          ) : (
            <PlayerSidebar
              courseSlug={courseSlug}
              curriculum={curriculum}
              narrow={sidebar.narrow}
              onHide={sidebar.narrow ? sidebar.closeDrawer : sidebar.toggleCollapsed}
              player={player}
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

            <div className={styles.videoContainer}>
              <LessonVideo player={player} />
            </div>

            <header className={styles.lessonHeader}>
              <p className={styles.lessonMeta}>
                {t('lessonMeta', { current: player.lessonNumber, total: player.lessonCount })}
              </p>
              <h1 className={styles.lessonTitle}>{player.title}</h1>
              <p className={styles.lessonSub}>{player.subtitle}</p>
            </header>

            <LessonTabs player={player} />
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
