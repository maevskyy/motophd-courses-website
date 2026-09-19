import { describe, expect, it } from 'vitest';

import {
  defaultLocale,
  getFallbackLocale,
  isLocale,
  localeLabels,
  locales,
  toLocale
} from './locales';

describe('locales', () => {
  it('lists english, russian and ukrainian with english as default', () => {
    expect(locales).toEqual(['en', 'ru', 'uk']);
    expect(defaultLocale).toBe('en');
    expect(Object.keys(localeLabels).sort()).toEqual([...locales].sort());
  });
});

describe('getFallbackLocale', () => {
  // Украинского контента нет: uk читает русские поля. Для ru поведение
  // прежнее — пустое поле показывает английское.
  it('sends ukrainian to russian and everything else to the default locale', () => {
    expect(getFallbackLocale('uk')).toBe('ru');
    expect(getFallbackLocale('ru')).toBe('en');
    expect(getFallbackLocale('en')).toBe('en');
  });
});

describe('isLocale and toLocale', () => {
  it('accepts only configured locale codes', () => {
    expect(isLocale('uk')).toBe(true);
    expect(isLocale('ru')).toBe(true);
    expect(isLocale('de')).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(undefined)).toBe(false);
  });

  it('falls back to the default locale for anything unknown', () => {
    expect(toLocale('uk')).toBe('uk');
    expect(toLocale('ru')).toBe('ru');
    expect(toLocale('de')).toBe('en');
    expect(toLocale(null)).toBe('en');
    expect(toLocale(new File([], 'x'))).toBe('en');
  });
});
