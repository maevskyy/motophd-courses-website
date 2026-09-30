'use client';

import { useEffect, useState } from 'react';

import type { Course } from '@/payload-types';

import { withRegionalPrice } from './regionalPrice';
import { detectVisitorCountry } from './visitorCountryClient';

export type CoursePricing = Pick<Course, 'priceFeedback' | 'priceStandard' | 'regionalPrices'>;

// Цены курса для страны посетителя. У курса без региональных строк страну не
// спрашиваем — цена известна сразу. Иначе pending, пока страна не пришла:
// цену в это время прячем, чтобы не мелькнула цена по умолчанию.
export const useRegionalPrice = (pricing: CoursePricing) => {
  const hasRegions = Boolean(pricing.regionalPrices?.length);
  const [country, setCountry] = useState<null | string | undefined>(hasRegions ? undefined : null);

  useEffect(() => {
    if (!hasRegions) {
      return;
    }

    let active = true;

    void detectVisitorCountry().then((detected) => {
      if (active) {
        setCountry(detected);
      }
    });

    return () => {
      active = false;
    };
  }, [hasRegions]);

  const { priceFeedback, priceStandard } = withRegionalPrice(pricing, country ?? null);

  return { pending: country === undefined, priceFeedback, priceStandard };
};
