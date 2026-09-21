'use client';

import { useActionState, useId, useState } from 'react';
import { useTranslations } from 'next-intl';
import { changePasswordAction } from '@/lib/auth/account';
import { initialChangePasswordFormState, MIN_PASSWORD_LENGTH } from '@/lib/auth/accountFormState';
import styles from './ChangePasswordForm.module.scss';

const errorKeys = {
  error: 'passwordChangeError',
  mismatch: 'passwordMismatch',
  tooShort: 'passwordTooShort',
  wrongCurrent: 'passwordWrongCurrent'
} as const;

// Строка «Пароль ••••••••  [Изменить]»: три поля раскрываются по клику.
// Сообщения об исходе живут над строкой, поэтому видны и после сворачивания.
export function ChangePasswordForm() {
  const t = useTranslations('dashboard');
  const action = useTranslations('actions');
  const [state, formAction] = useActionState(changePasswordAction, initialChangePasswordFormState);
  const [open, setOpen] = useState(false);
  const fieldsId = useId();
  const toggle = () => setOpen((current) => !current);

  return (
    <form action={formAction} className={styles.passwordForm}>
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
        <span className={styles.passwordForm__label}>{t('password')}</span>
        <div className={styles.passwordForm__row}>
          <span aria-hidden="true" className={styles.passwordForm__mask}>
            ••••••••
          </span>
          <button
            aria-controls={open ? fieldsId : undefined}
            aria-expanded={open}
            className={styles.passwordForm__toggle}
            onClick={toggle}
            type="button"
          >
            {t(open ? 'passwordEditCancel' : 'passwordEdit')}
          </button>
        </div>
      </div>
      {open ? (
        <div
          aria-label={t('changePassword')}
          className={styles.passwordForm__fields}
          id={fieldsId}
          role="group"
        >
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
        </div>
      ) : null}
    </form>
  );
}
