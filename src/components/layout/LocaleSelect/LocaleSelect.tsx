'use client';

import { useLocale, useTranslations } from 'next-intl';
import type { ChangeEvent } from 'react';
import { localeLabels, locales, type Locale } from '@/i18n/locales';
import { usePathname, useRouter } from '@/i18n/routing';
import styles from './LocaleSelect.module.scss';

// Нативный <select>: работает с клавиатуры и на телефоне без своего JS.
// usePathname из next-intl отдаёт путь уже без префикса локали, поэтому при
// смене языка достаточно перерисовать тот же путь под новым префиксом.
export function LocaleSelect() {
  const t = useTranslations('nav');
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = event.target.value as Locale;

    // Query сохраняем (например, ?next= на логине): страница та же,
    // меняется только язык.
    router.replace(`${pathname}${window.location.search}`, { locale: nextLocale });
  };

  return (
    <select
      aria-label={t('language')}
      className={styles.localeSelect}
      onChange={handleChange}
      value={locale}
    >
      {locales.map((code) => (
        <option key={code} value={code}>
          {`${code.toUpperCase()} — ${localeLabels[code]}`}
        </option>
      ))}
    </select>
  );
}
