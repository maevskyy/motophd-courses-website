import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

import { legacyLegalRedirects } from './legacyRedirects';

describe('legacyLegalRedirects', () => {
  it('отправляет старые юр-страницы из выдачи Google на PDF того же языка', () => {
    const bySource = Object.fromEntries(
      legacyLegalRedirects.map(({ destination, source }) => [source, destination])
    );

    expect(bySource['/uk/terms']).toBe('/legal/public-offer-uk.pdf');
    expect(bySource['/ru/privacy']).toBe('/legal/privacy-policy-ru.pdf');
    expect(bySource['/en/refund']).toBe('/legal/public-offer-en.pdf');
    expect(bySource['/terms']).toBe('/legal/public-offer-en.pdf');
    expect(legacyLegalRedirects).toHaveLength(12);
    expect(legacyLegalRedirects.every(({ permanent }) => permanent)).toBe(true);
  });

  it('ведёт только на PDF, которые реально лежат в public/legal', () => {
    for (const { destination } of legacyLegalRedirects) {
      expect(existsSync(join(process.cwd(), 'public', destination)), destination).toBe(true);
    }
  });
});
