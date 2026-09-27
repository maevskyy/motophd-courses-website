import { describe, expect, it } from 'vitest';

import type { Course, Lesson } from '@/payload-types';

import { getPlayerLesson, parseLessonOrder, toCurriculumModules, toPlayerContent } from './adapters';

const makeLesson = (order: number, overrides: Partial<Lesson> = {}): Lesson => ({
  course: 1,
  createdAt: '2026-01-01T00:00:00.000Z',
  id: order,
  order,
  title: `Lesson ${order}`,
  type: 'pdf',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides
});

const course = {
  currency: 'EUR',
  id: 1,
  order: 1,
  priceFeedback: 200,
  priceStandard: 100,
  slug: 'braking',
  status: 'published',
  title: 'Braking',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z'
} as Course;

// Список специально не по порядку: плеер не должен зависеть от того, как
// пришли уроки, а первый — это первый по order.
const lessons = [
  makeLesson(3, { type: 'video' }),
  makeLesson(1, { type: 'pdf' }),
  makeLesson(2, { type: 'video' })
];

describe('getPlayerLesson', () => {
  it('opens the first lesson by order when nothing is requested', () => {
    expect(getPlayerLesson(lessons)?.order).toBe(1);
  });

  it('opens the lesson whose order was requested', () => {
    expect(getPlayerLesson(lessons, 3)?.order).toBe(3);
    expect(getPlayerLesson(lessons, 2)?.title).toBe('Lesson 2');
  });

  it('falls back to the first lesson for an unknown order', () => {
    expect(getPlayerLesson(lessons, 42)?.order).toBe(1);
    expect(getPlayerLesson(lessons, 0)?.order).toBe(1);
  });

  it('returns undefined for a course without lessons', () => {
    expect(getPlayerLesson([], 1)).toBeUndefined();
  });
});

describe('parseLessonOrder', () => {
  it('reads a numeric query value', () => {
    expect(parseLessonOrder('3')).toBe(3);
  });

  it('ignores garbage, empty and repeated values', () => {
    expect(parseLessonOrder(undefined)).toBeUndefined();
    expect(parseLessonOrder('')).toBeUndefined();
    expect(parseLessonOrder('abc')).toBeUndefined();
    expect(parseLessonOrder('-1')).toBeUndefined();
    expect(parseLessonOrder('1.5')).toBeUndefined();
    expect(parseLessonOrder(['1', '2'])).toBeUndefined();
  });
});

describe('toPlayerContent', () => {
  const media = { downloads: [], videoEmbedUrl: null };

  it('describes the current lesson by its position among all lessons', () => {
    const currentLesson = getPlayerLesson(lessons, 3);
    const player = toPlayerContent(course, lessons, { currentLesson, ...media });

    expect(player.lessons[2].title).toBe('Lesson 3');
    expect(player.currentLessonOrder).toBe(3);
    expect(player.lessonNumber).toBe(3);
    expect(player.lessonCount).toBe(3);
  });

  it('falls back to the course title without lessons', () => {
    const player = toPlayerContent(course, [], { currentLesson: undefined, ...media });

    expect(player.courseTitle).toBe('Braking');
    expect(player.currentLessonOrder).toBeNull();
    expect(player.lessonNumber).toBe(0);
    expect(player.lessonCount).toBe(0);
  });
});

describe('toCurriculumModules', () => {
  it('keeps the lesson order so the sidebar can link to ?lesson=<order>', () => {
    const modules = toCurriculumModules(course, lessons, 'en');

    expect(modules.map((module) => module.lessons[0].order)).toEqual([3, 1, 2]);
    expect(modules[0].lessons[0]).toEqual({ duration: '', name: 'Lesson 3', order: 3 });
  });
});
