import { describe, expect, it } from 'vitest';

import { calculatePrice, getTierPrice } from './pricing';

const prices = { feedback: 129, standard: 29 };

describe('payment pricing', () => {
  it.each([
    ['standard', undefined, 29],
    ['feedback', undefined, 129],
    ['feedback_upgrade', undefined, 100],
    ['standard', { discountType: 'percent' as const, value: 10 }, 26.1],
    ['feedback', { discountType: 'fixed' as const, value: 30 }, 99]
  ])('calculates %s with the applicable discount', (tier, promo, amount) => {
    expect(calculatePrice(prices, tier as 'standard', promo)).toEqual({ amount, ok: true });
  });

  it('rounds percentage discounts half-up to two decimal places', () => {
    expect(calculatePrice(prices, 'standard', { discountType: 'percent', value: 10 })).toEqual({
      amount: 26.1,
      ok: true
    });
  });

  it('rejects 100 percent promo codes and totals below one euro', () => {
    expect(calculatePrice(prices, 'standard', { discountType: 'percent', value: 100 })).toEqual({
      code: 'invalidDiscount',
      ok: false
    });
    expect(calculatePrice(prices, 'standard', { discountType: 'fixed', value: 28.01 })).toEqual({
      code: 'minimumAmount',
      ok: false
    });
  });

  it('uses the price difference for a feedback upgrade', () => {
    expect(getTierPrice(prices, 'feedback_upgrade')).toBe(100);
  });
});
