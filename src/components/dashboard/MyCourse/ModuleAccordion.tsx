import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import { isLessonDone, lessonHref, type CourseProgress } from '@/lib/progress';
import type { MyCourseModule } from './MyCourse.types';
import styles from './MyCourse.module.scss';

interface Props {
  // Модуль со следующим уроком раскрыт по умолчанию, пока пользователь сам
  // его не свернул.
  activeModule?: string;
  courseSlug: string;
  modules: MyCourseModule[];
  progress: CourseProgress;
}

export function ModuleAccordion({ activeModule, courseSlug, modules, progress }: Props) {
  const t = useTranslations('dashboard');
  const [toggled, setToggled] = useState<Record<string, boolean>>({});

  const isOpen = (number: string) => toggled[number] ?? number === activeModule;
  const toggle = (number: string) =>
    setToggled((current) => ({ ...current, [number]: !isOpen(number) }));

  return (
    <div className={styles.modules}>
      {modules.map((module) => {
        const open = isOpen(module.number);
        const done = module.lessons.filter((lesson) => isLessonDone(lesson, progress)).length;

        return (
          <div className={cx(styles.module, open && styles.moduleOpen)} key={module.number}>
            <button
              aria-expanded={open}
              className={styles.module__header}
              onClick={() => toggle(module.number)}
              type="button"
            >
              <span className={styles.module__number}>{module.number}</span>
              <span className={styles.module__title}>{module.title}</span>
              <span className={styles.module__count}>
                {t('moduleDone', { done, total: module.lessons.length })}
              </span>
              <Icon className={styles.module__arrow} name="chevronDown" size={18} />
            </button>
            <ul className={styles.module__lessons} hidden={!open}>
              {module.lessons.map((lesson) => {
                const lessonDone = isLessonDone(lesson, progress);

                return (
                  <li className={styles.lesson} key={lesson.order}>
                    <Link className={styles.lesson__link} href={lessonHref(courseSlug, lesson)}>
                      <span
                        className={cx(styles.lesson__mark, lessonDone && styles.lesson__markDone)}
                      >
                        {lessonDone ? <Icon name="check" size={12} title={t('lessonDone')} /> : null}
                      </span>
                      <span className={styles.lesson__title}>{lesson.title}</span>
                      {lesson.hasPdf ? (
                        <Icon
                          className={styles.lesson__doc}
                          name="document"
                          size={16}
                          title={t('lessonPdf')}
                        />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
