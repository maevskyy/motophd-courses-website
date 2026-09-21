'use client';

import { getNextLesson, getProgressSummary, useCourseProgress } from '@/lib/progress';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import { isLessonDone, lessonHref } from '@/lib/progress';
import { ResumeCard } from './ResumeCard';
import type { MyCourseData } from './MyCourse.types';
import styles from './MyCourse.module.scss';

interface Props {
  course: MyCourseData;
}

// Купленный курс: resume-карточка и тот же плоский список уроков, что в плеере.
export function MyCourse({ course }: Props) {
  const { progress } = useCourseProgress(course.slug);
  const lessons = course.modules.flatMap((module) => module.lessons);
  const summary = getProgressSummary(lessons, progress);
  const nextLesson = getNextLesson(lessons, progress);
  const next =
    nextLesson
      ? {
          lesson: nextLesson,
          lessonNumber: lessons.findIndex((lesson) => lesson.order === nextLesson.order) + 1,
          moduleNumber: 1
        }
      : undefined;

  return (
    <section aria-labelledby={`course-${course.slug}`} className={styles.course}>
      <ResumeCard course={course} next={next} started={progress.done.length > 0} summary={summary} />
      <ul className={styles.modules}>
        {lessons.map((lesson) => (
          <li className={styles.lesson} key={lesson.order}>
            <Link className={styles.lesson__link} href={lessonHref(course.slug, lesson)}>
              <span className={cx(styles.lesson__mark, isLessonDone(lesson, progress) && styles.lesson__markDone)}>
                {isLessonDone(lesson, progress) ? <Icon name="check" size={12} /> : null}
              </span>
              <span className={styles.lesson__title}>{lesson.title}</span>
              {lesson.hasPdf ? <Icon className={styles.lesson__doc} name="document" size={16} /> : null}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
