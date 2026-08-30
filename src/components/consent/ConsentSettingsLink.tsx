'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { CONSENT_CHANGE_EVENT, CONSENT_READY_EVENT } from './consentConfig';
import styles from './ConsentSettingsLink.module.scss';

// Ссылка живёт в футере, который рендерится и без аналитики. Пока ConsentClient
// не смонтирован, слушателя события нет и кнопка была молча мёртвой —
// поэтому показываем её только после сигнала готовности.
export function ConsentSettingsLink() {
  const t = useTranslations('consent');
  const [isConsentReady, setIsConsentReady] = useState(false);

  useEffect(() => {
    function markReady() {
      setIsConsentReady(true);
    }

    if (window.__motophdConsentReady) {
      markReady();
    }

    window.addEventListener(CONSENT_READY_EVENT, markReady);

    return () => window.removeEventListener(CONSENT_READY_EVENT, markReady);
  }, []);

  function openConsentSettings() {
    window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
  }

  if (!isConsentReady) {
    return null;
  }

  return (
    <button className={styles.link} onClick={openConsentSettings} type="button">
      {t('change')}
    </button>
  );
}
