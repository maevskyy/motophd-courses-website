'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Icon } from '@/components/ui/Icon';
import type { CurriculumModule } from '@/lib/data';
import { cx } from '@/lib/classNames';
import styles from './CurriculumAccordion.module.scss';

export function CurriculumAccordion({ modules }: { modules: CurriculumModule[] }) {
  const t = useTranslations('course');
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
              <span className={styles.count}>
                {t('lessonCount', { count: module.lessons.length })}
              </span>
              <Icon className={styles.arrow} name="chevronDown" size={18} />
            </button>
            {/* На странице продажи программа — витрина, а не навигация: уроки
                открываются только из плеера после покупки. */}
            <ul className={styles.lessons}>
              {module.lessons.map((lesson) => (
                <li className={styles.lesson} key={lesson.name}>
                  <Icon className={styles.lessonIcon} name="play" size={14} />
                  <span className={styles.lessonName}>{lesson.name}</span>
                  {lesson.duration ? (
                    <span className={styles.lessonDuration}>{lesson.duration}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

