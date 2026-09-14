import { describe, expect, it } from 'vitest';

import type { Course, Lesson } from '@/payload-types';
import { paragraph, toLexical } from '@/seed/lexical';
import { getPlayerLesson, parseLessonOrder, toPlayerContent } from './adapters';

const course = {
  commonMistakes: 'Looking at the front wheel\nStiff arms',
  createdAt: '',
  currency: 'EUR',
  id: 1,
  priceFeedback: 1,
  priceStandard: 1,
  slug: 'braking',
  status: 'published',
  title: 'Braking',
  updatedAt: '',
  whatYouShouldFeel: 'Calm hands'
} satisfies Course;

const makeLesson = (order: number, overrides: Partial<Lesson> = {}): Lesson => ({
  course: course.id,
  createdAt: '',
  id: order * 10,
  order,
  title: `Lesson ${order}`,
  type: 'video',
  updatedAt: '',
  ...overrides
});

describe('parseLessonOrder', () => {
  it.each([
    ['3', 3],
    ['15', 15]
  ])('accepts %s', (value, expected) => {
    expect(parseLessonOrder(value)).toBe(expected);
  });

  it.each(['03', '0', '-1', '1.5', 'abc', ''])('rejects %j', (value) => {
    expect(parseLessonOrder(value)).toBeNull();
  });
});

describe('getPlayerLesson', () => {
  const lessons = [makeLesson(1), makeLesson(2), makeLesson(3)];

  it('picks the lesson by order', () => {
    expect(getPlayerLesson(lessons, 3)?.title).toBe('Lesson 3');
  });

  it('returns undefined for an order the course does not have', () => {
    expect(getPlayerLesson(lessons, 99)).toBeUndefined();
  });
});

describe('toPlayerContent', () => {
  const playbackUrl = (id: Lesson['streamVideoId']) => (id ? `https://stream.test/${id}` : null);

  it('sorts lessons by order and resolves body, video and PDF per lesson', () => {
    const lessons = [
      makeLesson(2, {
        pdf: { createdAt: '', filename: 'prep.pdf', id: 5, updatedAt: '' },
        type: 'pdf'
      }),
      makeLesson(1, { body: toLexical([paragraph('Intro')]), streamVideoId: 'vid-1' }),
      makeLesson(3, { body: { root: { children: [], direction: null, format: '', indent: 0, type: 'root', version: 1 } } })
    ];

    const player = toPlayerContent(course, lessons, 'en', { playbackUrl });

    expect(player.lessons.map((lesson) => lesson.order)).toEqual([1, 2, 3]);
    expect(player.lessons[0]).toMatchObject({
      download: null,
      module: 1,
      videoEmbedUrl: 'https://stream.test/vid-1'
    });
    expect(player.lessons[0].body).not.toBeNull();
    expect(player.lessons[1]).toMatchObject({
      body: null,
      download: { fileName: 'prep.pdf', url: '/api/lessons/20/pdf?locale=en' },
      videoEmbedUrl: null
    });
    // Пустой root без текста считается отсутствующим телом.
    expect(player.lessons[2].body).toBeNull();
    expect(player).toMatchObject({
      courseSlug: 'braking',
      feel: 'Calm hands',
      keyTakeaways: ['Looking at the front wheel', 'Stiff arms']
    });
  });

  it('numbers modules by the lean curriculum levels', () => {
    const lessons = Array.from({ length: 15 }, (_, index) => makeLesson(index + 1));

    const player = toPlayerContent({ ...course, slug: 'lean' }, lessons, 'ru', { playbackUrl });

    expect(player.lessons.map((lesson) => lesson.module)).toEqual([
      1, 2, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 5
    ]);
  });
});
