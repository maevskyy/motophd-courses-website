import type { PaymentTier } from './types';

export type PromoDiscount =
  | {
      discountType: 'fixed';
      value: number;
    }
  | {
      discountType: 'percent';
      value: number;
    };

export type CoursePrices = {
  feedback: number;
  standard: number;
};

export type PricingResult =
  | {
      amount: number;
      ok: true;
    }
  | {
      code: 'invalidDiscount' | 'minimumAmount';
      ok: false;
    };

const roundMoney = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100;

export const getTierPrice = (prices: CoursePrices, tier: PaymentTier) => {
  if (tier === 'standard') {
    return prices.standard;
  }

  if (tier === 'feedback') {
    return prices.feedback;
  }

  return prices.feedback - prices.standard;
};

export const calculatePrice = (
  prices: CoursePrices,
  tier: PaymentTier,
  promo?: PromoDiscount
): PricingResult => {
  const basePrice = getTierPrice(prices, tier);

  if (!Number.isFinite(basePrice) || basePrice < 1) {
    return { code: 'minimumAmount', ok: false };
  }

  if (!promo) {
    return { amount: roundMoney(basePrice), ok: true };
  }

  if (!Number.isFinite(promo.value) || promo.value < 0 || promo.discountType === 'percent' && promo.value >= 100) {
    return { code: 'invalidDiscount', ok: false };
  }

  const discounted =
    promo.discountType === 'percent' ? basePrice * (1 - promo.value / 100) : basePrice - promo.value;
  const amount = roundMoney(discounted);

  return amount >= 1 ? { amount, ok: true } : { code: 'minimumAmount', ok: false };
};
