'use client';

import { useTranslations } from 'next-intl';
import { CONSENT_CHANGE_EVENT } from './consentConfig';
import styles from './ConsentSettingsLink.module.scss';

export function ConsentSettingsLink() {
  const t = useTranslations('consent');

  function openConsentSettings() {
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }

  return (
    <button className={styles.link} onClick={openConsentSettings} type="button">
      {t('change')}
    </button>
  );
}
