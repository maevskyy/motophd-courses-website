'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { MIN_PASSWORD_LENGTH } from '@/lib/auth/accountFormState';
import { resetPasswordAction } from '@/lib/auth/passwordReset';
import { initialResetPasswordFormState } from '@/lib/auth/passwordResetFormState';
import styles from './LoginPage.module.scss';

const errorKeys = {
  invalidToken: 'resetInvalidToken',
  mismatch: 'resetMismatch',
  tooShort: 'resetTooShort'
} as const;

export function ResetPasswordForm({ locale, token }: { locale: 'en' | 'ru'; token: string }) {
  const t = useTranslations('login');
  const [state, formAction] = useActionState(resetPasswordAction, initialResetPasswordFormState);

  return (
    <main className={styles.loginPage}>
      <form action={formAction} className={styles.loginCard}>
        <input name="locale" type="hidden" value={locale} />
        <input name="token" type="hidden" value={token} />
        <div className={styles.loginLogo}>
          MOTO<span className={styles.red}>PhD</span>
        </div>
        <div className={styles.loginTagline}>{t('resetTagline')}</div>
        {state.status !== 'idle' ? (
          <div className={styles.loginError} role="alert">
            <strong>{t(errorKeys[state.status])}</strong>
          </div>
        ) : null}
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="reset-password">
            {t('newPassword')}
          </label>
          <input
            autoComplete="new-password"
            className={styles.formInput}
            id="reset-password"
            minLength={MIN_PASSWORD_LENGTH}
            name="password"
            required
            type="password"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="reset-confirm">
            {t('confirmPassword')}
          </label>
          <input
            autoComplete="new-password"
            className={styles.formInput}
            id="reset-confirm"
            minLength={MIN_PASSWORD_LENGTH}
            name="confirmPassword"
            required
            type="password"
          />
        </div>
        <button className={styles.btnLogin} type="submit">
          {t('resetButton')}
        </button>
        <Link className={styles.loginBack} href="/login/forgot">
          ← {t('forgotTagline')}
        </Link>
      </form>
    </main>
  );
}
