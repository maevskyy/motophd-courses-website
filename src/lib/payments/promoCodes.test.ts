import { describe, expect, it } from 'vitest';

import { normalizePromoCode, validatePromoCode } from './promoCodes';

const validPromo = {
  active: true,
  code: 'MOTO10',
  discountType: 'percent' as const,
  usedCount: 0,
  value: 10
};

describe('promo code validation', () => {
  it('normalizes a submitted code to uppercase', () => {
    expect(normalizePromoCode(' moto10 ')).toBe('MOTO10');
  });

  it('accepts an active promo in its date and use window', () => {
    expect(validatePromoCode(validPromo, new Date('2026-08-31T12:00:00Z'))).toEqual({
      discount: { discountType: 'percent', value: 10 },
      ok: true
    });
  });

  it.each([
    [undefined, 'notFound'],
    [{ ...validPromo, active: false }, 'inactive'],
    [{ ...validPromo, validFrom: '2026-09-01T00:00:00Z' }, 'notStarted'],
    [{ ...validPromo, validTo: '2026-08-30T00:00:00Z' }, 'expired'],
    [{ ...validPromo, maxUses: 2, usedCount: 2 }, 'exhausted']
  ])('rejects unavailable promo codes (%s)', (promo, code) => {
    expect(validatePromoCode(promo, new Date('2026-08-31T12:00:00Z'))).toEqual({ code, ok: false });
  });
});
