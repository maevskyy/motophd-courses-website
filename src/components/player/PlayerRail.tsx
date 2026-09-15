import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import type { CurriculumModule } from '@/lib/data';
import { findModuleNumber } from './PlayerModules';
import styles from './PlayerSidebar.module.scss';

interface Props {
  activeOrder: number | null;
  courseSlug: string;
  curriculum: CurriculumModule[];
  onExpand: () => void;
}

// Свёрнутое оглавление: узкий рейл с кнопкой «развернуть» и номерами
// модулей — каждый ведёт на первый урок своего модуля.
export function PlayerRail({ activeOrder, courseSlug, curriculum, onExpand }: Props) {
  const t = useTranslations('player');
  const activeModule = findModuleNumber(curriculum, activeOrder);

  return (
    <aside className={styles.rail}>
      <button
        aria-label={t('expandSidebar')}
        className={styles.railBtn}
        onClick={onExpand}
        type="button"
      >
        <Icon name="chevronRight" size={18} />
      </button>
      <nav aria-label={t('contents')} className={styles.railNav}>
        {curriculum.map((module) => {
          const first = module.lessons[0];

          if (!first) {
            return null;
          }

          const active = module.number === activeModule;

          return (
            <Link
              aria-current={active ? 'true' : undefined}
              aria-label={module.title}
              className={cx(styles.railItem, active && styles.railItemActive)}
              href={`/learn/${courseSlug}?lesson=${first.order}`}
              key={module.number}
              title={module.title}
            >
              {module.number}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
