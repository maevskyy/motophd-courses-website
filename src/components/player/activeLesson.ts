import type { PlayerLesson } from '@/lib/data';
import { getNextLesson, type CourseProgress } from '@/lib/progress';

// Активный урок: из URL (order), а без него — первый непройденный по прогрессу.
// До монтирования прогресс пустой → первый урок, разметка совпадает с серверной.
export const getActiveLesson = (
  lessons: PlayerLesson[],
  order: number | undefined,
  progress: CourseProgress
): PlayerLesson | undefined =>
  order === undefined
    ? getNextLesson(lessons, progress)
    : lessons.find((lesson) => lesson.order === order);
