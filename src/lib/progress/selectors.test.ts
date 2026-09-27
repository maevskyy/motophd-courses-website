import { describe, expect, it } from 'vitest';

import { lessonHref } from './href';
import { getNextLesson, getProgressSummary } from './selectors';
import { EMPTY_PROGRESS, type CourseProgress, type ProgressLesson } from './types';

const lessons: ProgressLesson[] = [
  { order: 3, durationSec: 300 },
  { order: 1, durationSec: 120 },
  { order: 2, durationSec: null }
];

const progressWith = (done: number[]): CourseProgress => ({ done, updatedAt: '2026-01-01' });

describe('lessonHref', () => {
  it('builds /learn/[slug]/[order]', () => {
    expect(lessonHref('lean', { order: 4 })).toBe('/learn/lean/4');
  });

  it('falls back to 0 when order is missing', () => {
    expect(lessonHref('lean', { order: null })).toBe('/learn/lean/0');
  });
});

describe('getNextLesson', () => {
  it('returns the first lesson by order for empty progress', () => {
    expect(getNextLesson(lessons, EMPTY_PROGRESS)).toEqual({ order: 1, durationSec: 120 });
  });

  it('skips done lessons', () => {
    expect(getNextLesson(lessons, progressWith([1, 2]))).toEqual({ order: 3, durationSec: 300 });
  });

  it('returns the last lesson when everything is done', () => {
    expect(getNextLesson(lessons, progressWith([1, 2, 3]))).toEqual({ order: 3, durationSec: 300 });
  });

  it('returns undefined without lessons', () => {
    expect(getNextLesson([], EMPTY_PROGRESS)).toBeUndefined();
  });
});

describe('getProgressSummary', () => {
  it('counts every lesson as remaining for empty progress', () => {
    expect(getProgressSummary(lessons, EMPTY_PROGRESS)).toEqual({
      done: 0,
      total: 3,
      remainingSec: 420
    });
  });

  it('sums durationSec of not-done lessons only', () => {
    expect(getProgressSummary(lessons, progressWith([1]))).toEqual({
      done: 1,
      total: 3,
      remainingSec: 300
    });
  });

  it('ignores done orders that are not in the lesson list', () => {
    expect(getProgressSummary(lessons, progressWith([1, 2, 3, 99]))).toEqual({
      done: 3,
      total: 3,
      remainingSec: 0
    });
  });
});
