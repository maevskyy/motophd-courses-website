'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';
import { Link, usePathname } from '@/i18n/routing';
import { useAuthStatus } from '@/components/providers/AuthStatusProvider';
import { useToast } from '@/components/providers/ToastProvider';
import { Icon } from '@/components/ui/Icon';
import { cx } from '@/lib/classNames';
import styles from './Nav.module.scss';
import type { Locale } from '@/i18n/routing';

const LOCALES: Locale[] = ['en', 'ru'];

export function Nav() {
  const isLoggedIn = useAuthStatus();
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const localeAgnosticPathname = stripLocalePrefix(pathname);
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Меню закрывается по Escape, по клику вне и при переходе на другую страницу;
  // фокус возвращается на кнопку, которая его открыла.
  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }

    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (!panelRef.current?.contains(target) && !toggleRef.current?.contains(target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const navLinks = (
    <>
      <Link className={styles.link} href="/courses">
        {t('nav.courses')}
      </Link>
      <Link className={styles.link} href="/#about-anchor">
        {t('nav.about')}
      </Link>
    </>
  );

  const langSwitch = (
    <div aria-label="Language" className={styles.lang} role="group">
      {LOCALES.map((item) => (
        <Link
          aria-current={item === locale ? 'true' : undefined}
          className={cx(styles.langOption, item === locale && styles.langOptionActive)}
          href={localeAgnosticPathname}
          key={item}
          locale={item}
          onClick={() => {
            if (item !== locale) {
              showToast(item === 'ru' ? t('toast.langRu') : t('toast.langEn'));
            }
          }}
        >
          {item.toUpperCase()}
        </Link>
      ))}
    </div>
  );

  return (
    <header className={styles.header}>
      <nav aria-label={t('nav.primary')} className={styles.bar}>
        <Link className={styles.logo} href="/">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="MotoPhD" className={styles.logoImg} height={32} src="/logo.png" width={116} />
        </Link>

        <div className={styles.desktop}>
          {navLinks}
          {langSwitch}
          <Link className={styles.link} href={isLoggedIn ? '/dashboard' : '/login'}>
            {isLoggedIn ? t('nav.dashboard') : t('nav.login')}
          </Link>
          {/*
            В шапке действие вторичное: главный красный CTA на первом экране —
            кнопка в хиро, а на последнем — закрывающий блок. Два primary
            одновременно на экране размывают главное действие.
          */}
          <Link className={styles.btnSecondary} href="/courses">
            {t('nav.cta')}
          </Link>
        </div>

        <div className={styles.mobile}>
          {/* Ключевое действие остаётся на виду и на телефоне. */}
          <Link className={cx(styles.btnPrimary, styles.btnCompact)} href="/courses">
            {t('nav.cta')}
          </Link>
          <button
            aria-controls={menuId}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            className={styles.burger}
            onClick={() => setMenuOpen((open) => !open)}
            ref={toggleRef}
            type="button"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={22} />
          </button>
        </div>
      </nav>

      <div className={cx(styles.panel, menuOpen && styles.panelOpen)} id={menuId} ref={panelRef}>
        <div className={styles.panelInner} hidden={!menuOpen}>
          {navLinks}
          <Link className={styles.link} href={isLoggedIn ? '/dashboard' : '/login'}>
            {isLoggedIn ? t('nav.dashboard') : t('nav.login')}
          </Link>
          {langSwitch}
        </div>
      </div>
    </header>
  );
}

function stripLocalePrefix(pathname: string) {
  const pathnameWithoutLocale = pathname.replace(/^\/(?:en|ru)(?=\/|$)/, '');

  return pathnameWithoutLocale || '/';
}
