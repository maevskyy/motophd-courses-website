import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { AppSidebar } from '@/components/app/AppShell';
import { Icon } from '@/components/ui/Icon';
import type { PlayerContent } from '@/lib/data';
import { getProgressSummary, type CourseProgress } from '@/lib/progress';
import { PlayerModules } from './PlayerModules';
import styles from './PlayerSidebar.module.scss';

interface Props {
  activeOrder: number;
  // Узкий экран: сайдбар — drawer, кнопка в шапке закрывает его, а не сворачивает.
  narrow: boolean;
  onHide: () => void;
  player: PlayerContent;
  progress: CourseProgress;
}

// Оглавление курса на общей колонке AppSidebar (как в кабинете): шапка со
// ссылкой «← Мой курс», названием и прогрессом, дерево модулей, «На сайт».
export function PlayerSidebar({
  activeOrder,
  narrow,
  onHide,
  player,
  progress
}: Props) {
  const t = useTranslations();
  const summary = getProgressSummary(player.lessons, progress);

  const header = (
    <>
      <div className={styles.head}>
        <Link className={styles.back} href="/dashboard">
          <Icon name="arrowLeft" size={16} />
          {t('dashboard.myCourse')}
        </Link>
        <button
          aria-label={narrow ? t('player.closeContents') : t('player.collapseSidebar')}
          className={styles.hide}
          onClick={onHide}
          type="button"
        >
          {narrow ? (
            <Icon name="close" size={18} />
          ) : (
            <Icon className={styles.hideIcon} name="chevronRight" size={18} />
          )}
        </button>
      </div>
      <p className={styles.title}>{player.courseTitle}</p>
      <progress
        aria-label={t('player.courseProgress')}
        className={styles.bar}
        max={Math.max(summary.total, 1)}
        value={summary.done}
      />
      <p className={styles.meta}>
        {t('player.lessonsComplete', { done: summary.done, total: summary.total })}
      </p>
    </>
  );

  const footer = (
    <Link className={styles.siteLink} href="/">
      <Icon name="arrowLeft" size={16} />
      {t('actions.backToWebsite')}
    </Link>
  );

  return (
    <AppSidebar footer={footer} header={header} navLabel={t('player.contents')}>
      <PlayerModules
        activeOrder={activeOrder}
        player={player}
        progress={progress}
      />
    </AppSidebar>
  );
}
