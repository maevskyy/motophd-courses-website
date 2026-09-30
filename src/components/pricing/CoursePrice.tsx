'use client';

import { type CoursePricing, useRegionalPrice } from '@/lib/pricing/useRegionalPrice';

interface Props {
  className?: string;
  pricing: CoursePricing;
  tier: 'feedback' | 'standard';
}

// Цена тарифа для страны посетителя. Пока страна не известна — место цены
// занято, но пусто: вёрстка не прыгает, цена по умолчанию не мелькает.
export function CoursePrice({ className, pricing, tier }: Props) {
  const { pending, priceFeedback, priceStandard } = useRegionalPrice(pricing);

  return (
    <span className={className} style={pending ? { visibility: 'hidden' } : undefined}>
      €{tier === 'standard' ? priceStandard : priceFeedback}
    </span>
  );
}
