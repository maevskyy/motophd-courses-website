import { describe, expect, it } from 'vitest';

import { buildSitemapEntries } from './sitemap';

const siteUrl = 'https://motophd.com';

const source = {
  courses: [
    { slug: 'lean', updatedAt: '2026-09-01T10:00:00.000Z' },
    { slug: 'counter-steering', updatedAt: 'not-a-date' }
  ],
  // privacy/terms живут в базе, но на сайте их больше нет — в карту не идут.
  legalPages: [{ slug: 'contact', updatedAt: null }, { slug: 'privacy' }, { slug: 'terms' }],
  siteUrl
};

describe('buildSitemapEntries', () => {
  it('lists landing, catalog, every course and the legal pages that still exist', () => {
    const urls = buildSitemapEntries(source).map((entry) => entry.url);

    expect(urls).toEqual([
      'https://motophd.com/en',
      'https://motophd.com/ru',
      'https://motophd.com/uk',
      'https://motophd.com/en/courses',
      'https://motophd.com/ru/courses',
      'https://motophd.com/uk/courses',
      'https://motophd.com/en/about',
      'https://motophd.com/ru/about',
      'https://motophd.com/uk/about',
      'https://motophd.com/en/courses/lean',
      'https://motophd.com/ru/courses/lean',
      'https://motophd.com/uk/courses/lean',
      'https://motophd.com/en/courses/counter-steering',
      'https://motophd.com/ru/courses/counter-steering',
      'https://motophd.com/uk/courses/counter-steering',
      'https://motophd.com/en/contact',
      'https://motophd.com/ru/contact',
      'https://motophd.com/uk/contact'
    ]);
  });

  it('attaches the full hreflang set to every entry', () => {
    const entries = buildSitemapEntries(source);
    const lean = entries.filter((entry) => entry.url.endsWith('/courses/lean'));

    expect(lean).toHaveLength(3);

    for (const entry of lean) {
      expect(entry.alternates?.languages).toEqual({
        en: 'https://motophd.com/en/courses/lean',
        ru: 'https://motophd.com/ru/courses/lean',
        uk: 'https://motophd.com/uk/courses/lean',
        'x-default': 'https://motophd.com/en/courses/lean'
      });
    }
  });

  it('uses updatedAt as lastModified only when it parses', () => {
    const byUrl = Object.fromEntries(
      buildSitemapEntries(source).map((entry) => [entry.url, entry.lastModified])
    );

    expect(byUrl['https://motophd.com/en/courses/lean']).toEqual(
      new Date('2026-09-01T10:00:00.000Z')
    );
    expect(byUrl['https://motophd.com/ru/courses/counter-steering']).toBeUndefined();
    expect(byUrl['https://motophd.com/en/contact']).toBeUndefined();
  });

  it('gives the landing page the highest priority and legal pages the lowest', () => {
    const entries = buildSitemapEntries(source);
    const priority = (url: string) => entries.find((entry) => entry.url === url)?.priority;

    expect(priority('https://motophd.com/en')).toBe(1);
    expect(priority('https://motophd.com/ru/courses')).toBe(0.9);
    expect(priority('https://motophd.com/uk/about')).toBe(0.6);
    expect(priority('https://motophd.com/en/courses/lean')).toBe(0.8);
    expect(priority('https://motophd.com/ru/contact')).toBe(0.3);
  });

  it('only contains what it was given: no courses means only static and legal pages', () => {
    const urls = buildSitemapEntries({ courses: [], legalPages: [], siteUrl }).map(
      (entry) => entry.url
    );

    expect(urls).toEqual([
      'https://motophd.com/en',
      'https://motophd.com/ru',
      'https://motophd.com/uk',
      'https://motophd.com/en/courses',
      'https://motophd.com/ru/courses',
      'https://motophd.com/uk/courses',
      'https://motophd.com/en/about',
      'https://motophd.com/ru/about',
      'https://motophd.com/uk/about'
    ]);
  });
});
