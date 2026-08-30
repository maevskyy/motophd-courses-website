'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { forgotPasswordAction } from '@/lib/auth/passwordReset';
import { initialForgotPasswordFormState } from '@/lib/auth/passwordResetFormState';
import styles from './LoginPage.module.scss';

export function ForgotPasswordForm({ locale }: { locale: 'en' | 'ru' }) {
  const t = useTranslations('login');
  const [state, formAction] = useActionState(forgotPasswordAction, initialForgotPasswordFormState);

  return (
    <main className={styles.loginPage}>
      <form action={formAction} className={styles.loginCard}>
        <input name="locale" type="hidden" value={locale} />
        <div className={styles.loginLogo}>
          MOTO<span className={styles.red}>PhD</span>
        </div>
        <div className={styles.loginTagline}>{t('forgotTagline')}</div>
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
        <Link className={styles.loginBack} href="/login">
          ← {t('backToLogin')}
        </Link>
      </form>
    </main>
  );
}
