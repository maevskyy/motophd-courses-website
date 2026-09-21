import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import type { CurriculumModule, PlayerContent } from '@/lib/data';
import { isLessonDone, lessonHref, type CourseProgress } from '@/lib/progress';
import { SidebarLessonLink } from './SidebarLessonLink';
import styles from './PlayerSidebar.module.scss';

interface Props {
  activeOrder: number;
  curriculum: CurriculumModule[];
  player: PlayerContent;
  progress: CourseProgress;
}

// Модули аккордеоном: раскрыт модуль активного урока, остальные пользователь
// открывает сам; переход на урок другого модуля раскрывает и его.
export function PlayerModules({ activeOrder, curriculum, player, progress }: Props) {
  const activeModule = player.lessons.find((lesson) => lesson.order === activeOrder)?.module;
  const [toggled, setToggled] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (activeModule !== undefined) {
      setToggled((current) => ({ ...current, [activeModule]: true }));
    }
  }, [activeModule]);

  const isOpen = (number: number) => toggled[number] ?? number === activeModule;
  const toggle = (number: number) =>
    setToggled((current) => ({ ...current, [number]: !isOpen(number) }));

  return (
    <div className={styles.tree}>
      {curriculum.map((module, index) => {
        const number = index + 1;
        const lessons = player.lessons.filter((lesson) => lesson.module === number);
        const open = isOpen(number);

        return (
          <section className={styles.module} key={module.number}>
            <button
              aria-expanded={open}
              className={styles.moduleHeader}
              onClick={() => toggle(number)}
              type="button"
            >
              <span className={styles.moduleNum}>{module.number}</span>
              <span className={styles.moduleName}>{module.title}</span>
              <Icon
                className={cx(styles.moduleArrow, open && styles.moduleArrowOpen)}
                name="chevronDown"
                size={16}
              />
            </button>
            <ul className={styles.lessons} hidden={!open}>
              {lessons.map((lesson) => (
                <li key={lesson.id}>
                  <SidebarLessonLink
                    active={lesson.order === activeOrder}
                    done={isLessonDone(lesson, progress)}
                    href={lessonHref(player.courseSlug, lesson)}
                    label={lesson.title}
                    pdf={lesson.download !== null}
                  />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
