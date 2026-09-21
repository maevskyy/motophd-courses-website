'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ConsentSettingsLink } from '@/components/consent/ConsentSettingsLink';
import { Icon } from '@/components/ui/Icon';
import type { HomeContent } from '@/lib/content';
import styles from './Footer.module.scss';

interface Props {
  compact?: boolean;
  socialLinks?: HomeContent['socialLinks'];
}

export function Footer({ compact = false, socialLinks }: Props) {
  const t = useTranslations('footer');

  return (
    <footer className={styles.footer}>
      <div className={styles.footer__inner}>
        {!compact ? (
          <div className={styles.footer__top}>
            <div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="MotoPhD" className={styles.footer__logo} height={28} src="/logo.png" width={101} />
              <p className={styles.footer__copyText}>{t('tagline')}</p>
            </div>
            <div>
              <h2 className={styles.footer__heading}>{t('coursesHeading')}</h2>
              <Link className={styles.footer__link} href="/courses/lean">
                {t('course1')}
              </Link>
              <Link className={styles.footer__link} href="/courses/counter-steering">
                {t('course2')}
              </Link>
            </div>
            <div>
              <h2 className={styles.footer__heading}>{t('platformHeading')}</h2>
              <Link className={styles.footer__link} href="/login">
                {t('studentLogin')}
              </Link>
              <Link className={styles.footer__link} href="/dashboard">
                {t('myDashboard')}
              </Link>
              <Link className={styles.footer__link} href="/about">
                {t('about')}
              </Link>
            </div>
            <div>
              <h2 className={styles.footer__heading}>{t('legalHeading')}</h2>
              <Link className={styles.footer__link} href="/privacy">
                {t('privacyPolicy')}
              </Link>
              <Link className={styles.footer__link} href="/terms">
                {t('terms')}
              </Link>
              <Link className={styles.footer__link} href="/refund">
                {t('refundPolicy')}
              </Link>
              <Link className={styles.footer__link} href="/contact">
                {t('contact')}
              </Link>
            </div>
          </div>
        ) : null}
        <div className={styles.footer__bottom}>
          <div className={styles.footer__copy}>{t('copy')}</div>
          <ConsentSettingsLink />
          {socialLinks && socialLinks.length > 0 ? (
            /*
              Два аккаунта в Instagram (школа и личный Влада) с одинаковой иконкой
              читались как дубль. Подпись рядом с иконкой видна всегда — различать
              их наведением мыши нельзя.
            */
            <div className={styles.footer__social}>
              {socialLinks.map((item) => (
                <a
                  aria-label={item.label}
                  className={styles.footer__socialLink}
                  href={item.href}
                  key={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <Icon className={styles.footer__socialIcon} name={item.platform} size={18} />
                  <span className={styles.footer__socialLabel}>{item.label}</span>
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
