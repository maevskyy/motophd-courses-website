'use client';

import { FormEvent, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useAuth } from '@/components/providers/AuthProvider';
import { useToast } from '@/components/providers/ToastProvider';
import styles from '@/components/prototype/Prototype.module.scss';

export default function LoginPage() {
  const t = useTranslations();
  const router = useRouter();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('demo@motophd.com');
  const [password, setPassword] = useState('demo1234');

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login(email);
    showToast(t('toast.login'));
    setTimeout(() => router.push('/dashboard'), 800);
  }

  return (
    <main className={styles.loginPage}>
      <form className={styles.loginCard} onSubmit={submit}>
        <div className={styles.loginLogo}>
          MOTO<span className={styles.red}>PhD</span>
        </div>
        <div className={styles.loginTagline}>{t('login.tagline')}</div>
        <div className={styles.loginNote}>
          🎯 <strong>{t('login.note').split(':')[0]}:</strong>
          {` ${t('login.note').split(':').slice(1).join(':')}`}
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="login-email">
            {t('login.email')}
          </label>
          <input
            className={styles.formInput}
            id="login-email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder={t('login.emailPlaceholder')}
            type="email"
            value={email}
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.formLabel} htmlFor="login-password">
            {t('login.password')}
          </label>
          <input
            className={styles.formInput}
            id="login-password"
            onChange={(event) => setPassword(event.target.value)}
            placeholder={t('login.passwordPlaceholder')}
            type="password"
            value={password}
          />
        </div>
        <button className={styles.btnLogin} type="submit">
          {t('login.button')}
        </button>
        <Link className={styles.loginBack} href="/">
          ← {t('login.back')}
        </Link>
      </form>
    </main>
  );
}
