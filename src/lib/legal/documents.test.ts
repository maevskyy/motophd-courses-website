import { describe, expect, it } from 'vitest';
import { locales } from '@/i18n/locales';
import { legalDocumentHref } from './documents';

describe('legalDocumentHref', () => {
  it('points at the PDF of the requested language', () => {
    expect(legalDocumentHref('privacy', 'ru')).toBe('/legal/privacy-policy-ru.pdf');
    expect(legalDocumentHref('offer', 'uk')).toBe('/legal/public-offer-uk.pdf');
    expect(legalDocumentHref('license', 'en')).toBe('/legal/license-agreement-en.pdf');
  });

  it('has a file for every document in every locale', async () => {
    const { access } = await import('node:fs/promises');
    const documents = ['license', 'offer', 'privacy'] as const;

    for (const locale of locales) {
      for (const document of documents) {
        const href = legalDocumentHref(document, locale);

        await expect(access(`public${href}`), `${href} is missing`).resolves.toBeUndefined();
      }
    }
  });
});
