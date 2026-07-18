'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useToast } from '@/components/providers/ToastProvider';
import styles from './Footer.module.scss';

export function Footer({ compact = false }: { compact?: boolean }) {
  const t = useTranslations();
  const { showToast } = useToast();

  return (
    <footer className={styles.footer}>
      <div className={styles.footer__inner}>
        {!compact ? (
          <div className={styles.footer__top}>
            <div>
              <div className={styles.footer__logo}>
                MOTO<span className={styles.red}>PhD</span>
              </div>
              <p className={styles.footer__copyText}>
                Premium online motorcycle education. Learn to ride with confidence, understanding,
                and precision.
              </p>
            </div>
            <div>
              <h4 className={styles.footer__heading}>Courses</h4>
              <Link className={styles.footer__link} href="/courses/lean">
                Stop Being Afraid to Lean
              </Link>
              <Link className={styles.footer__link} href="/courses/lean">
                Counter Steering
              </Link>
              <Link className={styles.footer__link} href="/courses/lean">
                Emergency Braking
              </Link>
            </div>
            <div>
              <h4 className={styles.footer__heading}>Platform</h4>
              <Link className={styles.footer__link} href="/login">
                Student Login
              </Link>
              <Link className={styles.footer__link} href="/dashboard">
                My Dashboard
              </Link>
              <Link className={styles.footer__link} href="/">
                About
              </Link>
            </div>
            <div>
              <h4 className={styles.footer__heading}>Legal</h4>
              <button className={styles.footer__link} onClick={() => showToast(t('toast.privacy'))} type="button">
                Privacy Policy
              </button>
              <button className={styles.footer__link} onClick={() => showToast(t('toast.terms'))} type="button">
                Terms & Conditions
              </button>
              <button className={styles.footer__link} onClick={() => showToast(t('toast.refund'))} type="button">
                Refund Policy
              </button>
              <button className={styles.footer__link} onClick={() => showToast(t('toast.riding'))} type="button">
                Riding Disclaimer
              </button>
            </div>
          </div>
        ) : null}
        <div className={styles.footer__bottom}>
          <div className={styles.footer__copy}>
            © 2026 MotoPhD Online. All rights reserved. Educational content for informational
            purposes only.
          </div>
          <div className={styles.footer__copy}>YouTube: @MotoPhD</div>
        </div>
      </div>
    </footer>
  );
}
