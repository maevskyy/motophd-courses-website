import { describe, expect, it } from 'vitest';

import {
  getCommonMistakes,
  getCourseData,
  getFlatLessons,
  getKeyPoint,
  getWhatYouShouldFeel,
  locales,
  type Locale
} from './contentSeedData';
import { localizedCourses } from './fixtures/courses';
import { playerContent } from './fixtures/player';

const cyrillic = /[а-яё]/i;

const courseBySlug = (slug: string, locale: Locale) => {
  const course = localizedCourses[locale].find((candidate) => candidate.slug === slug);

  if (!course) {
    throw new Error(`No ${locale} fixture for "${slug}"`);
  }

  return course;
};

describe('player fixture', () => {
  it('has the same shape in both locales', () => {
    expect(playerContent.ru.notes).toHaveLength(playerContent.en.notes.length);
    expect(playerContent.ru.moduleOutcome).toHaveLength(playerContent.en.moduleOutcome.length);
  });

  it('is actually translated', () => {
    for (const text of [
      playerContent.ru.overviewCopy,
      playerContent.ru.feel,
      ...playerContent.ru.notes
    ]) {
      expect(text).toMatch(cyrillic);
    }
  });
});

describe('player copy helpers', () => {
  it.each(locales)('return the %s player fixture for the lean course', (locale) => {
    const course = courseBySlug('lean', locale);

    expect(getKeyPoint(course, locale)).toBe(playerContent[locale].overviewCopy);
    expect(getCommonMistakes(course, locale)).toBe(playerContent[locale].notes.join('\n'));
    expect(getWhatYouShouldFeel(course, locale)).toBe(playerContent[locale].feel);
  });

  it('give Russian copy under ru that differs from en', () => {
    const en = courseBySlug('lean', 'en');
    const ru = courseBySlug('lean', 'ru');

    expect(getKeyPoint(ru, 'ru')).not.toBe(getKeyPoint(en, 'en'));
    expect(getKeyPoint(ru, 'ru')).toMatch(cyrillic);
    expect(getCommonMistakes(ru, 'ru')).toMatch(cyrillic);
    expect(getWhatYouShouldFeel(ru, 'ru')).toMatch(cyrillic);
  });

  it.each(locales)('fall back to the %s course copy for other courses', (locale) => {
    const course = courseBySlug('counter-steering', locale);

    expect(getKeyPoint(course, locale)).toBe(course.includes[0]);
    expect(getCommonMistakes(course, locale)).toBe(course.includes.slice(1).join('\n'));
    expect(getWhatYouShouldFeel(course, locale)).toBe(course.description);
  });
});

describe('getCourseData', () => {
  it.each(locales)('writes the %s player copy into the localized course fields', (locale) => {
    const data = getCourseData(courseBySlug('lean', locale), locale, 1);

    expect(data).toMatchObject({
      commonMistakes: playerContent[locale].notes.join('\n'),
      keyPoint: playerContent[locale].overviewCopy,
      order: 1,
      slug: 'lean',
      status: 'published',
      teaserVideoId: `lean-${locale}-teaser`,
      whatYouShouldFeel: playerContent[locale].feel
    });
  });
});

describe('curriculum fixtures', () => {
  it.each(['lean', 'counter-steering'])('keep %s lessons aligned by index across locales', (slug) => {
    const en = getFlatLessons(slug, 'en');
    const ru = getFlatLessons(slug, 'ru');

    expect(ru).toHaveLength(en.length);
    expect(ru.map(({ icon }) => icon)).toEqual(en.map(({ icon }) => icon));
  });

  it('translates the counter-steering programme instead of reusing the English one', () => {
    const en = getFlatLessons('counter-steering', 'en');
    const ru = getFlatLessons('counter-steering', 'ru');

    for (const [index, lesson] of ru.entries()) {
      expect(lesson.name).toMatch(cyrillic);
      expect(lesson.moduleTitle).toMatch(cyrillic);
      expect(lesson.name).not.toBe(en[index].name);
    }
  });
});
