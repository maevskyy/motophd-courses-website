import type { PromoDiscount } from './pricing';

export type PromoCodeRecord = PromoDiscount & {
  active: boolean;
  code: string;
  maxUses?: number | null;
  usedCount: number;
  validFrom?: string | null;
  validTo?: string | null;
};

export type PromoCodeValidation =
  | {
      discount: PromoDiscount;
      ok: true;
    }
  | {
      code: 'inactive' | 'notFound' | 'notStarted' | 'expired' | 'exhausted';
      ok: false;
    };

export const normalizePromoCode = (code: string) => code.trim().toUpperCase();

export const validatePromoCode = (
  promo: PromoCodeRecord | null | undefined,
  now = new Date()
): PromoCodeValidation => {
  if (!promo) {
    return { code: 'notFound', ok: false };
  }

  if (!promo.active) {
    return { code: 'inactive', ok: false };
  }

  if (promo.maxUses != null && promo.usedCount >= promo.maxUses) {
    return { code: 'exhausted', ok: false };
  }

  if (promo.validFrom && new Date(promo.validFrom) > now) {
    return { code: 'notStarted', ok: false };
  }

  if (promo.validTo && new Date(promo.validTo) < now) {
    return { code: 'expired', ok: false };
  }

  return {
    discount: {
      discountType: promo.discountType,
      value: promo.value
    },
    ok: true
  };
};
