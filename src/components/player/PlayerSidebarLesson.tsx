import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import styles from './PlayerSidebar.module.scss';

interface Props {
  active: boolean;
  courseSlug: string;
  label: string;
  order: number;
}

// Урок в оглавлении плеера — обычная ссылка на тот же плеер с ?lesson=<order>.
// Отметок «пройдено» нет: прогресса прохождения в продукте нет (ADR-9),
// значок ▶ только у текущего урока.
export function PlayerSidebarLesson({ active, courseSlug, label, order }: Props) {
  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={cx(styles.lesson, active && styles.lessonActive)}
      href={`/learn/${courseSlug}?lesson=${order}`}
    >
      <span aria-hidden className={styles.lessonMark}>
        {active ? <Icon name="play" size={10} /> : null}
      </span>
      <span className={styles.lessonLabel}>{label}</span>
    </Link>
  );
}
