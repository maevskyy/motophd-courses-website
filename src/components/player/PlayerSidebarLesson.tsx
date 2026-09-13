import { Link } from '@/i18n/routing';
import { cx } from '@/lib/classNames';
import styles from './CoursePlayer.module.scss';

interface Props {
  active: boolean;
  courseSlug: string;
  label: string;
  order: number;
}

// Урок в боковой панели плеера — обычная ссылка на тот же плеер с
// ?lesson=<order>. Отметок «пройдено» нет: прогресса прохождения в продукте
// нет (ADR-9), значок ▶ только у текущего урока.
export function PlayerSidebarLesson({ active, courseSlug, label, order }: Props) {
  return (
    <Link
      aria-current={active ? 'page' : undefined}
      className={cx(styles.sidebarLesson, active && styles.sidebarLessonActive)}
      href={`/learn/${courseSlug}?lesson=${order}`}
    >
      <span aria-hidden className={styles.sidebarLessonCheck}>
        {active ? '▶' : ''}
      </span>
      {label}
    </Link>
  );
}
