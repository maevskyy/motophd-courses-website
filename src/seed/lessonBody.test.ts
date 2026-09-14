import { describe, expect, it } from 'vitest';

import { getFlatLessons, locales, type Locale } from './contentSeedData';
import { localizedCourses } from './fixtures/courses';
import { playerContent } from './fixtures/player';
import { getLessonBody } from './lessonBody';

const courseBySlug = (slug: string, locale: Locale) => {
  const course = localizedCourses[locale].find((candidate) => candidate.slug === slug);

  if (!course) {
    throw new Error(`No ${locale} fixture for "${slug}"`);
  }

  return course;
};

const textOf = (node: Record<string, unknown>) =>
  (node.children as { text: string }[]).map(({ text }) => text).join('');

describe('getLessonBody', () => {
  it.each(locales)('builds a %s body from the player fixture for lean lessons', (locale) => {
    const lesson = getFlatLessons('lean', locale)[1];
    const copy = playerContent[locale];
    const { root } = getLessonBody(courseBySlug('lean', locale), lesson, locale);
    const [lead, keyPoints, ...rest] = root.children;
    const feelHeading = rest[copy.notes.length];
    const feel = rest[copy.notes.length + 1];

    expect(root.children).toHaveLength(copy.notes.length + 4);

    expect(lead.type).toBe('paragraph');
    expect(textOf(lead)).toContain(lesson.name);
    expect(textOf(lead)).toContain(lesson.moduleTitle);
    expect(textOf(lead)).toContain(copy.overviewCopy);

    expect(keyPoints).toMatchObject({ tag: 'h2', type: 'heading' });
    expect(rest.slice(0, copy.notes.length).map(textOf)).toEqual(copy.notes);

    expect(feelHeading).toMatchObject({ tag: 'h2', type: 'heading' });
    expect(feel.type).toBe('paragraph');
    expect(textOf(feel)).toBe(copy.feel);
  });

  it('uses Russian headings under the ru locale and English ones under en', () => {
    const headingsOf = (locale: Locale) =>
      getLessonBody(courseBySlug('lean', locale), getFlatLessons('lean', locale)[0], locale)
        .root.children.filter((node) => node.type === 'heading')
        .map(textOf);

    expect(headingsOf('ru')).toEqual(['Главное', 'Что ты должен почувствовать']);
    expect(headingsOf('en')).toEqual(['Key points', 'What you should feel']);
  });

  it.each(locales)('gives every lean lesson a %s body with both sections', (locale) => {
    const course = courseBySlug('lean', locale);
    const lessons = getFlatLessons('lean', locale);

    expect(lessons.length).toBeGreaterThan(0);

    for (const lesson of lessons) {
      const { root } = getLessonBody(course, lesson, locale);

      expect(root.children.filter((node) => node.type === 'heading')).toHaveLength(2);
      expect(textOf(root.children[0])).toContain(lesson.name);
    }
  });

  it('falls back to the module + lesson title stub for other courses', () => {
    const lesson = getFlatLessons('counter-steering', 'ru')[0];
    const { root } = getLessonBody(courseBySlug('counter-steering', 'ru'), lesson, 'ru');

    expect(root.children.map((node) => node.type)).toEqual(['paragraph', 'paragraph']);
    expect(root.children.map(textOf)).toEqual([lesson.moduleTitle, lesson.name]);
  });
});
