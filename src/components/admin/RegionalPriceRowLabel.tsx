'use client';

import { useRowLabel } from '@payloadcms/ui';

type Row = { countries?: string[]; priceFeedback?: number; priceStandard?: number };

// Свёрнутая строка сразу говорит, что в ней: «UA, MD — €15 / €60».
export function RegionalPriceRowLabel() {
  const { data, rowNumber } = useRowLabel<Row>();
  const countries = data?.countries?.length
    ? data.countries.join(', ')
    : `Region ${(rowNumber ?? 0) + 1}`;
  const prices =
    data?.priceStandard != null ? ` — €${data.priceStandard} / €${data.priceFeedback ?? '?'}` : '';

  return <span>{`${countries}${prices}`}</span>;
}
