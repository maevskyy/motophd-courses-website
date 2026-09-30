import type { Course } from '@/payload-types';

/*
  Региональные цены. У курса две цены по умолчанию (priceStandard,
  priceFeedback) и таблица regionalPrices: строка = список стран + свои две
  цены. Посетитель из страны в строке видит и платит цены строки, остальные —
  цены по умолчанию. Валюта везде одна (EUR), меняются только суммы.

  Страну сообщает Cloudflare заголовком CF-IPCountry. Сервер принимает
  запросы только от Cloudflare (deploy/Caddyfile), поэтому заголовок не
  подделать, минуя Cloudflare. Через VPN видна цена другой страны — так у
  любых региональных цен.
*/

type PricedCourse = Pick<Course, 'priceFeedback' | 'priceStandard' | 'regionalPrices'>;

// XX — Cloudflare не знает страну, T1 — Tor: для них цены по умолчанию.
export const toCountryCode = (value: null | string | undefined) => {
  const code = value?.trim().toUpperCase();

  return code && /^[A-Z]{2}$/.test(code) && code !== 'XX' && code !== 'T1' ? code : null;
};

export const findRegionalPrice = (course: PricedCourse, country: null | string) =>
  country
    ? course.regionalPrices?.find((row) => (row.countries as string[] | null)?.includes(country))
    : undefined;

// Курс с ценами для страны посетителя: дальше страницы и оплата работают с
// priceStandard/priceFeedback как раньше и не знают про регионы.
export const withRegionalPrice = <T extends PricedCourse>(course: T, country: null | string): T => {
  const row = findRegionalPrice(course, country);

  return row
    ? { ...course, priceFeedback: row.priceFeedback, priceStandard: row.priceStandard }
    : course;
};
