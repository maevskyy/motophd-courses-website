'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import type { CurriculumModule } from '@/lib/data';
import { cx } from '@/lib/classNames';
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
    <div className={styles.curriculumList}>
      {modules.map((module) => (
        <div
          className={cx(styles.curriculumModule, openModules.has(module.number) && styles.moduleOpen)}
          key={module.number}
        >
          <button className={styles.curriculumHeader} onClick={() => toggle(module.number)} type="button">
            <div className={styles.moduleNum}>{module.number}</div>
            <div className={styles.moduleInfo}>
              <div className={styles.moduleTitle}>{module.title}</div>
            </div>
            <span className={styles.moduleArrow}>›</span>
          </button>
          <div className={styles.curriculumLessons}>
            {module.lessons.map((lesson) => (
              <button
                className={styles.lessonItem}
                key={lesson.name}
                onClick={() => router.push('/learn/lean')}
                type="button"
              >
                <span className={styles.lessonName}>{lesson.name}</span>
                <span className={styles.lessonDuration}>{lesson.duration}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
