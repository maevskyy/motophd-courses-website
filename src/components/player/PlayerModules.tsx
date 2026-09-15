import { useEffect, useState } from 'react';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import type { CurriculumModule } from '@/lib/data';
import { PlayerSidebarLesson } from './PlayerSidebarLesson';
import styles from './PlayerSidebar.module.scss';

interface Props {
  // order текущего урока; null — в курсе нет уроков.
  activeOrder: number | null;
  courseSlug: string;
  curriculum: CurriculumModule[];
}

// Модуль, в котором лежит урок с данным order.
export const findModuleNumber = (curriculum: CurriculumModule[], order: number | null) =>
  curriculum.find((module) => module.lessons.some((lesson) => lesson.order === order))?.number;

// Модули аккордеоном: как в main, все уроки видны сразу — модули раскрыты,
// пользователь сворачивает лишние сам; переход на урок свёрнутого модуля
// раскрывает его обратно.
export function PlayerModules({ activeOrder, courseSlug, curriculum }: Props) {
  const activeModule = findModuleNumber(curriculum, activeOrder);
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (activeModule !== undefined) {
      setToggled((current) => ({ ...current, [activeModule]: true }));
    }
  }, [activeModule]);

  const isOpen = (number: string) => toggled[number] ?? true;
  const toggle = (number: string) =>
    setToggled((current) => ({ ...current, [number]: !isOpen(number) }));

  return (
    <div className={styles.tree}>
      {curriculum.map((module) => {
        const open = isOpen(module.number);

        return (
          <section className={styles.module} key={module.number}>
            <button
              aria-expanded={open}
              className={styles.moduleHeader}
              onClick={() => toggle(module.number)}
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
              {module.lessons.map((lesson) => (
                <li key={lesson.order}>
                  <PlayerSidebarLesson
                    active={lesson.order === activeOrder}
                    courseSlug={courseSlug}
                    label={lesson.name}
                    order={lesson.order}
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
