import { describe, expect, it } from 'vitest';

import { higherThanStandard, oneRowPerCountry } from './Courses';

describe('regional price table', () => {
  it('keeps each country in one row', () => {
    expect(oneRowPerCountry([{ countries: ['UA', 'MD'] }, { countries: ['PL'] }])).toBe(true);
    expect(oneRowPerCountry([{ countries: ['UA'] }, { countries: ['PL', 'UA'] }])).toMatch(
      /UA is listed in rows 1 and 2/
    );
    expect(oneRowPerCountry(null)).toBe(true);
  });

  it('asks the feedback plan to cost more than the course alone', () => {
    expect(higherThanStandard(60, { siblingData: { priceStandard: 15 } })).toBe(true);
    expect(higherThanStandard(15, { siblingData: { priceStandard: 15 } })).toMatch(
      /must cost more/
    );
  });
});
