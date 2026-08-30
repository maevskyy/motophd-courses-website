import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing, type Locale } from './routing';

// Статичная страница рендерится параллельно с layout, поэтому проверка
// локали и setRequestLocale обязаны жить и здесь: мусорный сегмент
// (/favicon.ico) иначе доезжает до next-intl, тот читает headers и роняет
// статический рендер («static to dynamic at runtime»).
export const requireLocale = (locale: string): Locale => {
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return locale;
};
