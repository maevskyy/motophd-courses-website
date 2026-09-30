import type { PromoDiscount } from './pricing';

type PromoTier = 'feedback' | 'feedback_upgrade' | 'standard';

export type PromoCodeRecord = PromoDiscount & {
  active: boolean;
  code: string;
  // Пусто или нет — действует на все курсы / тарифы.
  courses?: Array<number | { id: number }> | null;
  tiers?: PromoTier[] | null;
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
      code:
        | 'exhausted'
        | 'expired'
        | 'inactive'
        | 'notFound'
        | 'notStarted'
        | 'wrongCourse'
        | 'wrongTier';
      ok: false;
    };

export const normalizePromoCode = (code: string) => code.trim().toUpperCase();

export const validatePromoCode = (
  promo: PromoCodeRecord | null | undefined,
  now = new Date(),
  purchase?: { courseId: number; tier: PromoTier }
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

  const courseIds = (promo.courses ?? []).map((course) =>
    typeof course === 'number' ? course : course.id
  );

  if (purchase && courseIds.length > 0 && !courseIds.includes(purchase.courseId)) {
    return { code: 'wrongCourse', ok: false };
  }

  if (purchase && promo.tiers?.length && !promo.tiers.includes(purchase.tier)) {
    return { code: 'wrongTier', ok: false };
  }

  return {
    discount: {
      discountType: promo.discountType,
      value: promo.value
    },
    ok: true
  };
};
