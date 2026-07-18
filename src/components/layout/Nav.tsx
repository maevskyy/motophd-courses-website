'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import styles from '@/components/prototype/Prototype.module.scss';
import type { Locale } from '@/i18n/routing';

export function Nav() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const localeAgnosticPathname = stripLocalePrefix(pathname);
  const { isLoggedIn } = useAuth();
  const { showToast } = useToast();
  const otherLocale = locale === 'en' ? 'ru' : 'en';

  return (
    <nav className={styles.nav}>
      <Link className={styles.nav__logo} href="/">
        <span className={styles.nav__logoText}>
          MOTO<span className={styles.red}>PhD</span>
        </span>
      </Link>
      <div className={styles.nav__links}>
        <Link className={styles.nav__link} href="/courses">
          {t('nav.courses')}
        </Link>
        <Link className={styles.nav__link} href="/#about-anchor">
          {t('nav.about')}
        </Link>
        <Link
          className={styles.nav__lang}
          href={localeAgnosticPathname}
          locale={otherLocale}
          onClick={() => showToast(otherLocale === 'ru' ? t('toast.langRu') : t('toast.langEn'))}
        >
          <span className={locale === 'en' ? styles.nav__langActive : undefined}>EN</span> |{' '}
          <span className={locale === 'ru' ? styles.nav__langActive : undefined}>RU</span>
        </Link>
        <Link className={styles.nav__ctaGhost} href={isLoggedIn ? '/dashboard' : '/login'}>
          {isLoggedIn ? t('nav.dashboard') : t('nav.login')}
        </Link>
        <Link className={styles.nav__cta} href="/courses">
          {t('nav.cta')}
        </Link>
      </div>
    </nav>
  );
}

function stripLocalePrefix(pathname: string) {
  const pathnameWithoutLocale = pathname.replace(/^\/(?:en|ru)(?=\/|$)/, '');

  return pathnameWithoutLocale || '/';
}
