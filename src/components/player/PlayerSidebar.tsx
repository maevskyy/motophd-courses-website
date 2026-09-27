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
  // Узкий экран: сайдбар — drawer, и только там у него есть кнопка закрытия.
  narrow: boolean;
  onClose: () => void;
  player: PlayerContent;
  progress: CourseProgress;
}

// Оглавление курса на общей колонке AppSidebar (как в кабинете): шапка со
// ссылкой «← Мой курс», названием и прогрессом, список уроков. Другого выхода
// здесь нет: на сайт уводят логотип и пункты верхней шапки.
export function PlayerSidebar({
  activeOrder,
  narrow,
  onClose,
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
        {narrow ? (
          <button
            aria-label={t('player.closeContents')}
            className={styles.hide}
            onClick={onClose}
            type="button"
          >
            <Icon name="close" size={18} />
          </button>
        ) : null}
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

  return (
    <AppSidebar header={header} navLabel={t('player.contents')}>
      <PlayerModules
        activeOrder={activeOrder}
        player={player}
        progress={progress}
      />
    </AppSidebar>
  );
}
