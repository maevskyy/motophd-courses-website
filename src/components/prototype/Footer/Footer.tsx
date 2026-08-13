'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import styles from './Footer.module.scss';

export function Footer({ compact = false }: { compact?: boolean }) {
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
          <a
            className={styles.footer__copy}
            href={t('youtubeUrl')}
            rel="noopener noreferrer"
            target="_blank"
          >
            YouTube: {t('youtubeHandle')}
          </a>
        </div>
      </div>
    </footer>
  );
}
