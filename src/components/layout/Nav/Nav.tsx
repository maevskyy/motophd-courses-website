'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { LocaleSelect } from '@/components/layout/LocaleSelect';
import { useAuthStatus } from '@/components/providers/AuthStatusProvider';
import styles from './Nav.module.scss';

export function Nav() {
  const isLoggedIn = useAuthStatus();
  const t = useTranslations();

  return (
    <nav className={styles.nav}>
      <Link className={styles.nav__logo} href="/">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="MotoPhD" className={styles.nav__logoImg} height={36} src="/logo.png" width={130} />
      </Link>
      <div className={styles.nav__links}>
        <Link className={styles.nav__link} href="/courses">
          {t('nav.courses')}
        </Link>
        <Link className={styles.nav__link} href="/#about-anchor">
          {t('nav.about')}
        </Link>
        <LocaleSelect />
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
