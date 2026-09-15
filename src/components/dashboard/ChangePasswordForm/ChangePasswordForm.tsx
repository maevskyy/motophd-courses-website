'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { changePasswordAction } from '@/lib/auth/account';
import {
  initialChangePasswordFormState,
  MIN_PASSWORD_LENGTH
} from '@/lib/auth/accountFormState';
import styles from './ChangePasswordForm.module.scss';

const errorKeys = {
  error: 'passwordChangeError',
  mismatch: 'passwordMismatch',
  tooShort: 'passwordTooShort',
  wrongCurrent: 'passwordWrongCurrent'
} as const;

export function ChangePasswordForm() {
  const t = useTranslations('dashboard');
  const action = useTranslations('actions');
  const [state, formAction] = useActionState(changePasswordAction, initialChangePasswordFormState);

  return (
    <form action={formAction} className={styles.passwordForm}>
      <h3 className={styles.passwordForm__title}>{t('changePassword')}</h3>
      {state.status === 'success' ? (
        <p className={styles.passwordForm__success} role="status">
          {t('passwordChangeSuccess')}
        </p>
      ) : null}
      {state.status !== 'idle' && state.status !== 'success' ? (
        <p className={styles.passwordForm__error} role="alert">
          {t(errorKeys[state.status])}
        </p>
      ) : null}
      <div className={styles.passwordForm__field}>
        <label className={styles.passwordForm__label} htmlFor="current-password">
          {t('currentPassword')}
        </label>
        <input
          autoComplete="current-password"
          className={styles.passwordForm__input}
          id="current-password"
          name="currentPassword"
          required
          type="password"
        />
      </div>
      <div className={styles.passwordForm__field}>
        <label className={styles.passwordForm__label} htmlFor="new-password">
          {t('newPassword')}
        </label>
        <input
          autoComplete="new-password"
          className={styles.passwordForm__input}
          id="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          name="newPassword"
          required
          type="password"
        />
      </div>
      <div className={styles.passwordForm__field}>
        <label className={styles.passwordForm__label} htmlFor="confirm-password">
          {t('confirmNewPassword')}
        </label>
        <input
          autoComplete="new-password"
          className={styles.passwordForm__input}
          id="confirm-password"
          minLength={MIN_PASSWORD_LENGTH}
          name="confirmPassword"
          required
          type="password"
        />
      </div>
      <button className={styles.passwordForm__submit} type="submit">
        {action('changePassword')}
      </button>
    </form>
  );
}
