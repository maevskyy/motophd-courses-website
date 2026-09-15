import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { AppSidebar } from '@/components/app/AppShell';
import { Icon } from '@/components/ui/Icon';
import type { CurriculumModule, PlayerContent } from '@/lib/data';
import { PlayerModules } from './PlayerModules';
import styles from './PlayerSidebar.module.scss';

interface Props {
  courseSlug: string;
  curriculum: CurriculumModule[];
  // Узкий экран: сайдбар — drawer, кнопка в шапке закрывает его, а не сворачивает.
  narrow: boolean;
  onHide: () => void;
  player: Pick<PlayerContent, 'currentLessonOrder' | 'sidebarTitle'>;
}

// Оглавление курса на общей колонке AppSidebar (как в кабинете): шапка со
// ссылкой «← Назад в кабинет» и названием курса, дерево модулей. Прогресса
// прохождения нет (ADR-9).
export function PlayerSidebar({ courseSlug, curriculum, narrow, onHide, player }: Props) {
  const t = useTranslations();

  const header = (
    <>
      <div className={styles.head}>
        <Link className={styles.back} href="/dashboard">
          <Icon name="arrowLeft" size={16} />
          {t('actions.backToDashboard')}
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
      <p className={styles.title}>{player.sidebarTitle}</p>
    </>
  );

  return (
    <AppSidebar header={header} navLabel={t('player.contents')}>
      <PlayerModules
        activeOrder={player.currentLessonOrder}
        courseSlug={courseSlug}
        curriculum={curriculum}
      />
    </AppSidebar>
  );
}
