import { describe, expect, it } from 'vitest';
import type { Course, Lesson } from '@/payload-types';
import { toMyCourse } from './toMyCourse';

const course = {
  currency: 'EUR',
  id: 1,
  priceFeedback: 129,
  priceStandard: 29,
  slug: 'braking',
  title: 'The Art of Braking'
} as Course;

const lesson = (overrides: Partial<Lesson>): Lesson =>
  ({ course: 1, id: 1, title: 'Lesson', type: 'video', ...overrides }) as Lesson;

describe('toMyCourse', () => {
  it('maps lessons into flat DTOs sorted by order', () => {
    const result = toMyCourse(
      course,
      [
        lesson({ id: 2, order: 2, pdf: 7, title: 'Drill sheet', type: 'pdf' }),
        lesson({ durationSec: 300, id: 1, order: 1, title: 'Intro' })
      ],
      'en'
    );

    expect(result).toMatchObject({
      currency: 'EUR',
      slug: 'braking',
      title: 'The Art of Braking',
      upgradePrice: 100
    });
    expect(result.modules).toHaveLength(2);
    expect(result.modules.flatMap((module) => module.lessons)).toEqual([
      { durationSec: 300, hasPdf: false, order: 1, title: 'Intro' },
      { durationSec: null, hasPdf: true, order: 2, title: 'Drill sheet' }
    ]);
  });

  it('returns no modules for a course without lessons', () => {
    expect(toMyCourse(course, [], 'en').modules).toEqual([]);
  });

  it('never returns a negative upgrade price', () => {
    expect(toMyCourse({ ...course, priceFeedback: 10 }, [], 'en').upgradePrice).toBe(0);
  });
});
