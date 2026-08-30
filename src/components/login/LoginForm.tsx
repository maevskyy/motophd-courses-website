'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { loginAction } from '@/lib/auth/actions';
import { initialLoginFormState } from '@/lib/auth/formState';
import { LoginSubmitButton } from './LoginSubmitButton';
import styles from './LoginPage.module.scss';

interface Props {
  locale: 'en' | 'ru';
  nextPath?: string;
}

export function LoginForm({ locale, nextPath }: Props) {
  const t = useTranslations('login');
  const [state, formAction] = useActionState(loginAction, initialLoginFormState);

  return (
    <main className={styles.loginPage}>
      <form action={formAction} className={styles.loginCard}>
        <input name="locale" type="hidden" value={locale} />
        <input name="next" type="hidden" value={nextPath || ''} />
        <div className={styles.loginLogo}>
          MOTO<span className={styles.red}>PhD</span>
        </div>
        <div className={styles.loginTagline}>{t('tagline')}</div>
        {state.error ? (
          <div className={styles.loginError} role="alert">
            <strong>{state.rateLimited ? t('tooManyAttempts') : t('invalidCredentials')}</strong>
            <span>{t('accessHint')}</span>
          </div>
        ) : null}
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="login-email">
            {t('email')}
          </label>
          <input
            autoComplete="email"
            className={styles.formInput}
            id="login-email"
            name="email"
            placeholder={t('emailPlaceholder')}
            required
            type="email"
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="login-password">
            {t('password')}
          </label>
          <input
            autoComplete="current-password"
            className={styles.formInput}
            id="login-password"
            name="password"
            placeholder={t('passwordPlaceholder')}
            required
            type="password"
          />
        </div>
        <LoginSubmitButton />
        <Link className={styles.loginBack} href="/">
          ← {t('back')}
        </Link>
      </form>
    </main>
  );
}
