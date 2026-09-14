import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import type { CurriculumModule, PlayerContent } from '@/lib/data';
import { lessonHref } from '@/lib/progress';
import styles from './PlayerSidebar.module.scss';

interface Props {
  activeOrder: number;
  curriculum: CurriculumModule[];
  onExpand: () => void;
  player: PlayerContent;
}

// Свёрнутое оглавление: узкий рейл с кнопкой «развернуть» и номерами
// модулей — каждый ведёт на первый урок своего модуля.
export function PlayerRail({ activeOrder, curriculum, onExpand, player }: Props) {
  const t = useTranslations('player');
  const activeModule = player.lessons.find((lesson) => lesson.order === activeOrder)?.module;

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
        {curriculum.map((module, index) => {
          const first = player.lessons.find((lesson) => lesson.module === index + 1);

          if (!first) {
            return null;
          }

          const active = index + 1 === activeModule;

          return (
            <Link
              aria-current={active ? 'true' : undefined}
              aria-label={module.title}
              className={cx(styles.railItem, active && styles.railItemActive)}
              href={lessonHref(player.courseSlug, first)}
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
