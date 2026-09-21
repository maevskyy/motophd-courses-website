import { describe, expect, it } from 'vitest';

import {
  buildLanguageAlternates,
  canonicalUrl,
  localizedPath,
  resolveSeoLocale,
  toAbsoluteUrl
} from './urls';

const siteUrl = 'https://motophd.com';

describe('localizedPath', () => {
  it('prefixes the locale and keeps the root path without a trailing slash', () => {
    expect(localizedPath('en', '/')).toBe('/en');
    expect(localizedPath('ru', '')).toBe('/ru');
    expect(localizedPath('ru', '/courses/lean')).toBe('/ru/courses/lean');
    expect(localizedPath('en', 'privacy')).toBe('/en/privacy');
    expect(localizedPath('en', '/courses/')).toBe('/en/courses');
  });
});

describe('buildLanguageAlternates', () => {
  it('returns one hreflang per locale plus x-default pointing at the default locale', () => {
    expect(buildLanguageAlternates(siteUrl, '/courses/lean')).toEqual({
      en: 'https://motophd.com/en/courses/lean',
      ru: 'https://motophd.com/ru/courses/lean',
      uk: 'https://motophd.com/uk/courses/lean',
      'x-default': 'https://motophd.com/en/courses/lean'
    });
  });

  it('maps the landing page to bare locale roots', () => {
    expect(buildLanguageAlternates(siteUrl, '/')).toEqual({
      en: 'https://motophd.com/en',
      ru: 'https://motophd.com/ru',
      uk: 'https://motophd.com/uk',
      'x-default': 'https://motophd.com/en'
    });
  });

  it('keeps every pair symmetric: the ru page lists the en page and vice versa', () => {
    const fromEn = buildLanguageAlternates(siteUrl, '/privacy');
    const fromRu = buildLanguageAlternates(siteUrl, '/privacy');
    const fromUk = buildLanguageAlternates(siteUrl, '/privacy');

    expect(fromEn.ru).toBe(canonicalUrl(siteUrl, 'ru', '/privacy'));
    expect(fromRu.en).toBe(canonicalUrl(siteUrl, 'en', '/privacy'));
    expect(fromUk.en).toBe(canonicalUrl(siteUrl, 'en', '/privacy'));
    expect(fromEn).toEqual(fromRu);
    expect(fromEn).toEqual(fromUk);
  });
});

describe('canonicalUrl and toAbsoluteUrl', () => {
  it('builds absolute localized urls', () => {
    expect(canonicalUrl(siteUrl, 'ru', '/courses')).toBe('https://motophd.com/ru/courses');
  });

  it('leaves absolute urls untouched and prefixes relative paths', () => {
    expect(toAbsoluteUrl(siteUrl, '/og-default.png')).toBe('https://motophd.com/og-default.png');
    expect(toAbsoluteUrl(siteUrl, 'https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png'
    );
  });
});

describe('resolveSeoLocale', () => {
  it('accepts only configured locales', () => {
    expect(resolveSeoLocale('en')).toBe('en');
    expect(resolveSeoLocale('ru')).toBe('ru');
    expect(resolveSeoLocale('uk')).toBe('uk');
    expect(resolveSeoLocale('de')).toBeNull();
    expect(resolveSeoLocale('favicon.ico')).toBeNull();
  });
});
