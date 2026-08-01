'use client';

import { useTranslations } from 'next-intl';
import { useFormStatus } from 'react-dom';
import styles from './LoginPage.module.scss';

export function LoginSubmitButton() {
  const t = useTranslations('login');
  const { pending } = useFormStatus();

  return (
    <button className={styles.btnLogin} disabled={pending} type="submit">
      {pending ? t('submitting') : t('button')}
    </button>
  );
}
