import { describe, expect, it } from 'vitest';

import type { PlayerLesson } from '@/lib/data';
import { EMPTY_PROGRESS } from '@/lib/progress';
import { getActiveLesson } from './activeLesson';

const lessons: PlayerLesson[] = [1, 2, 3].map((order) => ({
  body: null,
  download: null,
  id: order,
  module: 1,
  order,
  title: `L${order}`,
  type: 'video',
  videoEmbedUrl: null
}));

describe('getActiveLesson', () => {
  it('takes the lesson from the URL order', () => {
    expect(getActiveLesson(lessons, 2, EMPTY_PROGRESS)?.title).toBe('L2');
  });

  it('is undefined for an order the course does not have', () => {
    expect(getActiveLesson(lessons, 99, EMPTY_PROGRESS)).toBeUndefined();
  });

  it('starts from the first lesson when there is no progress', () => {
    expect(getActiveLesson(lessons, undefined, EMPTY_PROGRESS)?.title).toBe('L1');
  });

  it('continues from the first unfinished lesson', () => {
    expect(getActiveLesson(lessons, undefined, { done: [1, 2], updatedAt: '' })?.title).toBe('L3');
  });

  it('stays on the last lesson once everything is done', () => {
    expect(getActiveLesson(lessons, undefined, { done: [1, 2, 3], updatedAt: '' })?.title).toBe(
      'L3'
    );
  });
});
