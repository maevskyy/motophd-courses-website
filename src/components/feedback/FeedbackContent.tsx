'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import styles from './FeedbackContent.module.scss';

export function FeedbackContent({ contactUrl }: { contactUrl: string | null }) {
  const t = useTranslations('feedback');

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>{t('title')}</h1>
      <p className={styles.intro}>{t('intro')}</p>
      <section className={styles.step}>
        <div className={styles.step__number}>{t('stepOne')}</div>
        <p className={styles.step__text}>
          {contactUrl ? t('stepContact') : t('stepContactFallback')}
        </p>
        {contactUrl ? (
          <a className={styles.contactCta} href={contactUrl} rel="noopener" target="_blank">
            {t('contactCta')}
          </a>
        ) : null}
      </section>
      <section className={styles.step}>
        <div className={styles.step__number}>{t('stepTwo')}</div>
        <p className={styles.step__text}>{t('stepVideo')}</p>
      </section>
      <p className={styles.included}>{t('included')}</p>
      <Link className={styles.back} href="/dashboard">
        ← {t('backToDashboard')}
      </Link>
    </main>
  );
}
