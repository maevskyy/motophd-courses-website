import type { Lesson } from '@/payload-types';
import { lessonOrder } from './types';

export const lessonHref = (courseSlug: string, lesson: Pick<Lesson, 'order'>) =>
  `/learn/${courseSlug}/${lessonOrder(lesson)}`;
