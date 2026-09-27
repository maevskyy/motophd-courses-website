import type { PlayerContent } from '@/lib/data';
import { isLessonDone, lessonHref, type CourseProgress } from '@/lib/progress';
import { SidebarLessonLink } from './SidebarLessonLink';
import styles from './PlayerSidebar.module.scss';

interface Props {
  activeOrder: number;
  player: PlayerContent;
  progress: CourseProgress;
}

// Курс состоит из плоского списка уроков: без контейнеров уровней и аккордеона.
export function PlayerModules({ activeOrder, player, progress }: Props) {
  return (
    <ul className={styles.lessons}>
      {player.lessons.map((lesson) => (
        <li key={lesson.id}>
          <SidebarLessonLink
            active={lesson.order === activeOrder}
            done={isLessonDone(lesson, progress)}
            href={lessonHref(player.courseSlug, lesson)}
            label={`${String(lesson.order).padStart(2, '0')} ${lesson.title}`}
            pdf={lesson.download !== null}
          />
        </li>
      ))}
    </ul>
  );
}
