import { describe, expect, it } from 'vitest';

import { buildPageMetadata, DEFAULT_DESCRIPTION, toDescription } from './pageMetadata';

const siteUrl = 'https://motophd.com';

describe('buildPageMetadata', () => {
  const metadata = buildPageMetadata({
    description: 'Learn to lean.',
    locale: 'ru',
    path: '/courses/lean',
    siteUrl,
    title: 'Наклон без страха'
  });

  it('sets canonical and hreflang alternates for the page', () => {
    expect(metadata.alternates).toEqual({
      canonical: 'https://motophd.com/ru/courses/lean',
      languages: {
        en: 'https://motophd.com/en/courses/lean',
        ru: 'https://motophd.com/ru/courses/lean',
        'x-default': 'https://motophd.com/en/courses/lean'
      }
    });
  });

  it('fills open graph with the localized page data and the default image', () => {
    expect(metadata.openGraph).toMatchObject({
      alternateLocale: ['en_US'],
      description: 'Learn to lean.',
      images: [
        {
          alt: 'MotoPhD Online',
          height: 630,
          url: 'https://motophd.com/og-default.png',
          width: 1200
        }
      ],
      locale: 'ru_RU',
      siteName: 'MotoPhD Online',
      title: 'Наклон без страха',
      type: 'website',
      url: 'https://motophd.com/ru/courses/lean'
    });
  });

  it('mirrors the card into twitter metadata', () => {
    expect(metadata.twitter).toEqual({
      card: 'summary_large_image',
      description: 'Learn to lean.',
      images: ['https://motophd.com/og-default.png'],
      title: 'Наклон без страха'
    });
  });

  it('leaves the title templated unless asked for an absolute one', () => {
    expect(metadata.title).toBe('Наклон без страха');
    expect(
      buildPageMetadata({ absoluteTitle: true, locale: 'en', path: '/', siteUrl, title: 'Home' })
        .title
    ).toEqual({ absolute: 'Home' });
  });

  it('uses a relative page image made absolute and falls back to the title as alt', () => {
    const withImage = buildPageMetadata({
      image: { height: 800, url: '/api/media/file/cover.jpg', width: 1200 },
      locale: 'en',
      path: '/courses/lean',
      siteUrl,
      title: 'Lean'
    });

    expect(withImage.openGraph?.images).toEqual([
      { alt: 'Lean', height: 800, url: 'https://motophd.com/api/media/file/cover.jpg', width: 1200 }
    ]);
    expect(withImage.twitter?.images).toEqual(['https://motophd.com/api/media/file/cover.jpg']);
  });

  it('falls back to the site description when the page has none', () => {
    const empty = buildPageMetadata({ locale: 'en', path: '/', siteUrl, title: 'Home' });

    expect(empty.description).toBe(DEFAULT_DESCRIPTION);
  });
});

describe('toDescription', () => {
  it('collapses whitespace and keeps short text intact', () => {
    expect(toDescription('  Learn\n to  lean. ')).toBe('Learn to lean.');
  });

  it('cuts long text at a word boundary with an ellipsis', () => {
    const long = Array.from({ length: 40 }, (_, index) => `word${index}`).join(' ');
    const result = toDescription(long);

    expect(result.length).toBeLessThanOrEqual(160);
    expect(result.endsWith('…')).toBe(true);
    // Обрезано по границе слова: префикс совпадает, а в исходнике за ним пробел.
    const kept = result.slice(0, -1);

    expect(long.startsWith(kept)).toBe(true);
    expect(long[kept.length]).toBe(' ');
  });

  it('returns an empty string for missing input', () => {
    expect(toDescription(undefined)).toBe('');
    expect(toDescription(null)).toBe('');
  });
});
