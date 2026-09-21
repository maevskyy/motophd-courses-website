'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/locales';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
import { forgotPasswordAction } from '@/lib/auth/passwordReset';
import { initialForgotPasswordFormState } from '@/lib/auth/passwordResetFormState';
import styles from './LoginPage.module.scss';

export function ForgotPasswordForm({ locale }: { locale: Locale }) {
  const t = useTranslations('login');
  const [state, formAction] = useActionState(forgotPasswordAction, initialForgotPasswordFormState);

  return (
    <main className={styles.loginPage}>
      <form action={formAction} className={styles.loginCard}>
        <input name="locale" type="hidden" value={locale} />
        <div className={styles.loginHead}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="MotoPhD" className={styles.loginLogo} height={32} src="/logo.png" width={116} />
          <h1 className={styles.loginTagline}>{t('forgotTagline')}</h1>
        </div>
        {state.status === 'sent' ? (
          <p className={styles.loginSuccess} role="status">
            {t('forgotSent')}
          </p>
        ) : null}
        {state.status === 'rateLimited' ? (
          <div className={styles.loginError} role="alert">
            <strong>{t('tooManyAttempts')}</strong>
          </div>
        ) : null}
        <p className={styles.loginHint}>{t('forgotHint')}</p>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="forgot-email">
            {t('email')}
          </label>
          <input
            autoComplete="email"
            className={styles.formInput}
            id="forgot-email"
            name="email"
            placeholder={t('emailPlaceholder')}
            required
            type="email"
          />
        </div>
        <button className={styles.btnLogin} type="submit">
          {t('forgotButton')}
        </button>
        <p className={styles.loginFooter}>
          <Link className={styles.loginFooterLink} href="/login">
            <Icon name="arrowLeft" size={16} />
            {t('backToLogin')}
          </Link>
        </p>
      </form>
    </main>
  );
}
