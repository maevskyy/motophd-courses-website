'use client';

import { getNextLesson, getProgressSummary, useCourseProgress } from '@/lib/progress';
import { ModuleAccordion } from './ModuleAccordion';
import { ResumeCard } from './ResumeCard';
import type { MyCourseData } from './MyCourse.types';
import styles from './MyCourse.module.scss';

interface Props {
  course: MyCourseData;
}

// Купленный курс в кабинете: resume-карточка и аккордеон модулей делят один
// прогресс из localStorage, поэтому хук живёт здесь, а не в каждом блоке.
export function MyCourse({ course }: Props) {
  const { progress } = useCourseProgress(course.slug);
  const lessons = course.modules.flatMap((module) => module.lessons);
  const summary = getProgressSummary(lessons, progress);
  const nextLesson = getNextLesson(lessons, progress);
  const moduleIndex = course.modules.findIndex((module) =>
    module.lessons.some((lesson) => lesson.order === nextLesson?.order)
  );
  const next =
    nextLesson && moduleIndex >= 0
      ? {
          lesson: nextLesson,
          lessonNumber:
            course.modules[moduleIndex].lessons.findIndex(
              (lesson) => lesson.order === nextLesson.order
            ) + 1,
          moduleNumber: moduleIndex + 1
        }
      : undefined;

  return (
    <section aria-labelledby={`course-${course.slug}`} className={styles.course}>
      <ResumeCard course={course} next={next} started={progress.done.length > 0} summary={summary} />
      <ModuleAccordion
        activeModule={moduleIndex >= 0 ? course.modules[moduleIndex].number : undefined}
        courseSlug={course.slug}
        modules={course.modules}
        progress={progress}
      />
    </section>
  );
}
