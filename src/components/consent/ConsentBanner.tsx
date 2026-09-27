'use client';

import { useLocale, useTranslations } from 'next-intl';
import { legalDocumentHref } from '@/lib/legal';
import type { Locale } from '@/i18n/locales';
import styles from './ConsentBanner.module.scss';
import type { ConsentDecision } from './consentConfig';

interface Props {
  onChoose: (decision: ConsentDecision) => void;
}

export function ConsentBanner({ onChoose }: Props) {
  const t = useTranslations('consent');
  const locale = useLocale() as Locale;

  function acceptAll() {
    onChoose('accepted');
  }

  function acceptNecessaryOnly() {
    onChoose('necessary');
  }

  return (
    <section aria-label={t('title')} className={styles.banner} role="dialog">
      <div className={styles.banner__content}>
        <h2 className={styles.banner__title}>{t('title')}</h2>
        <p className={styles.banner__description}>
          {t('description')}{' '}
          <a
            className={styles.banner__link}
            href={legalDocumentHref('privacy', locale)}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('privacyLink')}
          </a>
        </p>
      </div>
      <div className={styles.banner__actions}>
        <button className={styles.banner__necessary} onClick={acceptNecessaryOnly} type="button">
          {t('necessaryOnly')}
        </button>
        <button className={styles.banner__accept} onClick={acceptAll} type="button">
          {t('acceptAll')}
        </button>
      </div>
    </section>
  );
}
