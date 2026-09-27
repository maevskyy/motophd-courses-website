'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { updateProfileAction } from '@/lib/auth/account';
import { initialUpdateProfileFormState } from '@/lib/auth/accountFormState';
import styles from './AccountProfileForm.module.scss';

interface Props {
  email: string;
  name: string;
}

export function AccountProfileForm({ email, name }: Props) {
  const t = useTranslations('dashboard');
  const login = useTranslations('login');
  const action = useTranslations('actions');
  const [state, formAction] = useActionState(updateProfileAction, initialUpdateProfileFormState);

  return (
    <form action={formAction} className={styles.profileForm}>
      {state.status !== 'idle' ? (
        <p
          className={
            state.status === 'success' ? styles.profileForm__success : styles.profileForm__error
          }
          role="status"
        >
          {t(state.status === 'success' ? 'profileSaveSuccess' : 'profileSaveError')}
        </p>
      ) : null}
      <div className={styles.profileForm__field}>
        <label className={styles.profileForm__label} htmlFor="profile-name">
          {t('fullName')}
        </label>
        <input
          autoComplete="name"
          className={styles.profileForm__input}
          defaultValue={name}
          id="profile-name"
          maxLength={120}
          name="name"
          type="text"
        />
      </div>
      {/* Email нельзя поменять самому — показываем значением, а не серым инпутом. */}
      <div className={styles.profileForm__field}>
        <span className={styles.profileForm__label}>{login('email')}</span>
        <span className={styles.profileForm__value}>{email}</span>
        <p className={styles.profileForm__hint}>{t('emailReadOnly')}</p>
      </div>
      <button className={styles.profileForm__submit} type="submit">
        {action('saveChanges')}
      </button>
    </form>
  );
}
