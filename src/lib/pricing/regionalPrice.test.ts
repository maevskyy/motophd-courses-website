import { describe, expect, it } from 'vitest';

import { toCountryCode, withRegionalPrice } from './regionalPrice';

const course = {
  priceFeedback: 129,
  priceStandard: 29,
  regionalPrices: [
    { countries: ['UA', 'MD'], priceFeedback: 60, priceStandard: 15 },
    { countries: ['PL'], priceFeedback: 99, priceStandard: 25 }
  ]
} as never;

describe('regional prices', () => {
  it('gives a listed country the prices of its row', () => {
    expect(withRegionalPrice(course, 'MD')).toMatchObject({ priceFeedback: 60, priceStandard: 15 });
    expect(withRegionalPrice(course, 'PL')).toMatchObject({ priceFeedback: 99, priceStandard: 25 });
  });

  it('keeps the default prices for other or unknown countries', () => {
    expect(withRegionalPrice(course, 'DE')).toMatchObject({
      priceFeedback: 129,
      priceStandard: 29
    });
    expect(withRegionalPrice(course, null)).toMatchObject({ priceStandard: 29 });
    expect(
      withRegionalPrice({ priceFeedback: 129, priceStandard: 29 } as never, 'UA')
    ).toMatchObject({
      priceStandard: 29
    });
  });

  it('reads only real country codes from the Cloudflare header', () => {
    expect(toCountryCode('ua')).toBe('UA');
    expect(toCountryCode('XX')).toBeNull();
    expect(toCountryCode('T1')).toBeNull();
    expect(toCountryCode('UKR')).toBeNull();
    expect(toCountryCode(null)).toBeNull();
  });
});
