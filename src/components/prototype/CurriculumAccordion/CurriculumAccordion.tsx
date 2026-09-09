'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useToast } from '@/components/providers/ToastProvider';
import { Icon } from '@/components/ui/Icon';
import type { CurriculumModule } from '@/lib/data';
import { cx } from '@/lib/classNames';
import playerStyles from '@/components/player/CoursePlayer.module.scss';
import styles from './CurriculumAccordion.module.scss';

export function CurriculumAccordion({ modules }: { modules: CurriculumModule[] }) {
  const router = useRouter();
  const [openModules, setOpenModules] = useState<Set<string>>(
    () => new Set(modules.filter((module) => module.open).map((module) => module.number))
  );

  function toggle(number: string) {
    setOpenModules((current) => {
      const next = new Set(current);

      if (next.has(number)) {
        next.delete(number);
      } else {
        next.add(number);
      }

      return next;
    });
  }

  return (
    <div className={styles.list}>
      {modules.map((module) => {
        const open = openModules.has(module.number);

        return (
          <div className={cx(styles.module, open && styles.moduleOpen)} key={module.number}>
            <button
              aria-expanded={open}
              className={styles.header}
              onClick={() => toggle(module.number)}
              type="button"
            >
              <span className={styles.number}>{module.number}</span>
              <span className={styles.title}>{module.title}</span>
              <Icon className={styles.arrow} name="chevronDown" size={18} />
            </button>
            <ul className={styles.lessons}>
              {module.lessons.map((lesson) => (
                <li key={lesson.name}>
                  <button
                    className={styles.lesson}
                    onClick={() => router.push('/learn/lean')}
                    type="button"
                  >
                    <Icon className={styles.lessonIcon} name="play" size={14} />
                    <span className={styles.lessonName}>{lesson.name}</span>
                    <span className={styles.lessonDuration}>{lesson.duration}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

export function SidebarLesson({
  active,
  done,
  label,
  toast
}: {
  active?: boolean;
  done?: boolean;
  label: string;
  toast: string;
}) {
  const { showToast } = useToast();

  return (
    <button
      aria-current={active ? 'true' : undefined}
      className={cx(playerStyles.sidebarLesson, active && playerStyles.sidebarLessonActive)}
      onClick={() => showToast(toast)}
      type="button"
    >
      <span className={cx(playerStyles.sidebarLessonMark, done && playerStyles.sidebarLessonMarkDone)}>
        {done ? <Icon name="check" size={12} /> : active ? <Icon name="play" size={10} /> : null}
      </span>
      <span className={playerStyles.sidebarLessonLabel}>{label}</span>
    </button>
  );
}
