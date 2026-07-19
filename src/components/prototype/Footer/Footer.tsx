'use client';

import { Link } from '@/i18n/routing';
import styles from './Footer.module.scss';

export function Footer({ compact = false }: { compact?: boolean }) {
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
              <Link className={styles.footer__link} href="/privacy">
                Privacy Policy
              </Link>
              <Link className={styles.footer__link} href="/terms">
                Terms & Conditions
              </Link>
              <Link className={styles.footer__link} href="/refund">
                Refund Policy
              </Link>
              <Link className={styles.footer__link} href="/contact">
                Contact
              </Link>
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
