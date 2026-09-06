import type { Metadata } from 'next';

// Для login/checkout/кабинета/плеера: дублирует Disallow из robots.txt на
// уровне страницы — если бот всё же дошёл до URL по ссылке, в индекс не берёт.
export const noIndexMetadata: Metadata = {
  robots: {
    follow: false,
    index: false
  }
};
