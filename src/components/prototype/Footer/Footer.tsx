'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ConsentSettingsLink } from '@/components/consent/ConsentSettingsLink';
import type { HomeContent } from '@/lib/content';
import styles from './Footer.module.scss';

function SocialIcon({ platform }: { platform: 'youtube' | 'instagram' }) {
  if (platform === 'youtube') {
    return (
      <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
        <rect height="14" rx="4" stroke="currentColor" strokeWidth="1.6" width="20" x="2" y="5" />
        <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg fill="none" height="18" viewBox="0 0 24 24" width="18">
      <rect height="18" rx="5" stroke="currentColor" strokeWidth="1.6" width="18" x="3" y="3" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="17.3" cy="6.7" fill="currentColor" r="1.1" />
    </svg>
  );
}

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
              <div className={styles.footer__logo}>
                MOTO<span className={styles.red}>PhD</span>
              </div>
              <p className={styles.footer__copyText}>{t('tagline')}</p>
            </div>
            <div>
              <h4 className={styles.footer__heading}>{t('coursesHeading')}</h4>
              <Link className={styles.footer__link} href="/courses/lean">
                {t('course1')}
              </Link>
              <Link className={styles.footer__link} href="/courses/lean">
                {t('course2')}
              </Link>
              <Link className={styles.footer__link} href="/courses/lean">
                {t('course3')}
              </Link>
            </div>
            <div>
              <h4 className={styles.footer__heading}>{t('platformHeading')}</h4>
              <Link className={styles.footer__link} href="/login">
                {t('studentLogin')}
              </Link>
              <Link className={styles.footer__link} href="/dashboard">
                {t('myDashboard')}
              </Link>
              <Link className={styles.footer__link} href="/">
                {t('about')}
              </Link>
            </div>
            <div>
              <h4 className={styles.footer__heading}>{t('legalHeading')}</h4>
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
            <div className={styles.footer__social}>
              {socialLinks.map((item) => (
                <a
                  aria-label={item.label}
                  className={styles.footer__socialLink}
                  href={item.href}
                  key={item.href}
                  rel="noopener noreferrer"
                  target="_blank"
                  title={item.label}
                >
                  <SocialIcon platform={item.platform} />
                </a>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
