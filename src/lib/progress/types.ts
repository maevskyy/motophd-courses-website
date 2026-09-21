import type { Lesson } from '@/payload-types';

// Минимальная форма урока, которую понимают селекторы: подходит и полный
// `Lesson`, и `CourseCurriculumLesson` из `@/lib/data`.
export type ProgressLesson = Pick<Lesson, 'order' | 'durationSec'>;

export type CourseProgress = {
  // Список `order` пройденных уроков.
  done: number[];
  lastOpened?: number;
  updatedAt: string;
};

export type ProgressSummary = {
  done: number;
  total: number;
  remainingSec: number;
};

export const EMPTY_PROGRESS: CourseProgress = Object.freeze({ done: [], updatedAt: '' });

// `order` у урока в Payload необязательный; в URL и в сторе нужен номер.
export const lessonOrder = (lesson: Pick<Lesson, 'order'>) => lesson.order ?? 0;
