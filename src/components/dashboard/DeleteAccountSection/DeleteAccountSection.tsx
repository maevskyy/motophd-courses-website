'use client';

import { useActionState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { deleteAccountAction } from '@/lib/auth/account';
import { initialDeleteAccountFormState } from '@/lib/auth/accountFormState';
import styles from './DeleteAccountSection.module.scss';

export function DeleteAccountSection() {
  const t = useTranslations('dashboard');
  const action = useTranslations('actions');
  const locale = useLocale();
  const [state, formAction] = useActionState(deleteAccountAction, initialDeleteAccountFormState);

  return (
    <form action={formAction} className={styles.danger}>
      <h3 className={styles.danger__title}>{t('deleteAccount')}</h3>
      <p className={styles.danger__warning}>{t('deleteAccountWarning')}</p>
      {state.status !== 'idle' ? (
        <p className={styles.danger__error} role="alert">
          {t(state.status === 'confirmMismatch' ? 'deleteAccountMismatch' : 'deleteAccountError')}
        </p>
      ) : null}
      <input name="locale" type="hidden" value={locale} />
      <label className={styles.danger__label} htmlFor="delete-confirm-email">
        {t('deleteAccountConfirmLabel')}
      </label>
      <input
        autoComplete="off"
        className={styles.danger__input}
        id="delete-confirm-email"
        name="confirmEmail"
        required
        type="email"
      />
      <button className={styles.danger__submit} type="submit">
        {action('deleteAccount')}
      </button>
    </form>
  );
}
