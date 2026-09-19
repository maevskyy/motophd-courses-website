import { describe, expect, it } from 'vitest';

import en from '../../messages/en.json';
import ru from '../../messages/ru.json';
import uk from '../../messages/uk.json';
import { defaultLocale, locales } from './locales';

type Messages = Record<string, unknown>;

const messagesByLocale: Record<(typeof locales)[number], Messages> = { en, ru, uk };

// 'toast.login', 'checkout.errors.invalidEmail' — в порядке объявления в файле.
const flattenKeys = (messages: Messages, prefix = ''): string[] =>
  Object.entries(messages).flatMap(([key, value]) =>
    value && typeof value === 'object'
      ? flattenKeys(value as Messages, `${prefix}${key}.`)
      : [`${prefix}${key}`]
  );

const flattenValues = (messages: Messages): Record<string, string> =>
  Object.fromEntries(
    Object.entries(messages).flatMap(([key, value]) =>
      value && typeof value === 'object'
        ? Object.entries(flattenValues(value as Messages)).map(([k, v]) => [`${key}.${k}`, v])
        : [[key, String(value)]]
    )
  );

const placeholders = (value: string) => (value.match(/\{[^}]+\}/g) ?? []).sort();

describe('messages/*.json', () => {
  const reference = flattenKeys(messagesByLocale[defaultLocale]);

  it('has a file for every configured locale', () => {
    expect(Object.keys(messagesByLocale).sort()).toEqual([...locales].sort());
  });

  it.each(locales)('%s has the same keys in the same order as the default locale', (locale) => {
    expect(flattenKeys(messagesByLocale[locale])).toEqual(reference);
  });

  it.each(locales)('%s keeps every {placeholder} of the default locale', (locale) => {
    const values = flattenValues(messagesByLocale[locale]);
    const referenceValues = flattenValues(messagesByLocale[defaultLocale]);

    for (const key of reference) {
      expect(placeholders(values[key]), key).toEqual(placeholders(referenceValues[key]));
    }
  });

  it.each(locales)('%s has no empty strings', (locale) => {
    const empty = Object.entries(flattenValues(messagesByLocale[locale]))
      .filter(([, value]) => value.trim() === '')
      .map(([key]) => key);

    expect(empty).toEqual([]);
  });
});
