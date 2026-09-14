'use client';

import { useActionState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Icon } from '@/components/ui/Icon';
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
        <div className={styles.loginHead}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img alt="MotoPhD" className={styles.loginLogo} height={32} src="/logo.png" width={116} />
          <h1 className={styles.loginTagline}>{t('tagline')}</h1>
        </div>
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
          <div className={styles.formLabelRow}>
            <label className={styles.formLabel} htmlFor="login-password">
              {t('password')}
            </label>
            <Link className={styles.loginForgot} href="/login/forgot">
              {t('forgotLink')}
            </Link>
          </div>
          <input
            autoComplete="current-password"
            className={styles.formInput}
            id="login-password"
            name="password"
            required
            type="password"
          />
        </div>
        <LoginSubmitButton />
        <p className={styles.loginFooter}>
          <span>{t('noAccess')}</span>
          <Link className={styles.loginFooterLink} href="/courses">
            {t('noAccessLink')}
            <Icon name="arrowRight" size={16} />
          </Link>
        </p>
      </form>
    </main>
  );
}
