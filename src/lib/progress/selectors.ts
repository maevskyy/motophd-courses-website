import {
  lessonOrder,
  type CourseProgress,
  type ProgressLesson,
  type ProgressSummary
} from './types';

export const isLessonDone = (lesson: ProgressLesson, progress: CourseProgress) =>
  progress.done.includes(lessonOrder(lesson));

// Первый непройденный урок по `order`; если пройдены все — последний.
export const getNextLesson = <L extends ProgressLesson>(
  lessons: L[],
  progress: CourseProgress
): L | undefined => {
  const sorted = [...lessons].sort((a, b) => lessonOrder(a) - lessonOrder(b));

  return sorted.find((lesson) => !isLessonDone(lesson, progress)) ?? sorted[sorted.length - 1];
};

export const getProgressSummary = (
  lessons: ProgressLesson[],
  progress: CourseProgress
): ProgressSummary => {
  const remaining = lessons.filter((lesson) => !isLessonDone(lesson, progress));

  return {
    done: lessons.length - remaining.length,
    total: lessons.length,
    remainingSec: remaining.reduce((sum, lesson) => sum + (lesson.durationSec ?? 0), 0)
  };
};
