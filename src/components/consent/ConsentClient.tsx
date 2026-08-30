'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { AnalyticsScripts } from './AnalyticsScripts';
import { ConsentBanner } from './ConsentBanner';
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_COOKIE_MAX_AGE,
  CONSENT_COOKIE_NAME,
  type ConsentDecision,
  type TrackingConfig
} from './consentConfig';

interface Props {
  initialDecision: ConsentDecision | null;
  trackingConfig: TrackingConfig;
}

function createConsentModeScript(decision: ConsentDecision | null) {
  const consent =
    "{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'}";
  const update =
    decision === 'accepted'
      ? `gtag('consent','update',{ad_storage:'granted',analytics_storage:'granted',ad_user_data:'granted',ad_personalization:'granted'});`
      : '';

  return `window.dataLayer=window.dataLayer||[];function gtag(){window.dataLayer.push(arguments)}window.gtag=window.gtag||gtag;gtag('consent','default',${consent});${update}`;
}

function updateGoogleConsent(decision: ConsentDecision) {
  if (decision !== 'accepted') {
    return;
  }

  window.gtag?.('consent', 'update', {
    ad_personalization: 'granted',
    ad_storage: 'granted',
    ad_user_data: 'granted',
    analytics_storage: 'granted'
  });
}

function saveDecision(decision: ConsentDecision) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE_NAME}=${decision}; Max-Age=${CONSENT_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

export function ConsentClient({ initialDecision, trackingConfig }: Props) {
  const [decision, setDecision] = useState(initialDecision);
  const [isBannerOpen, setIsBannerOpen] = useState(initialDecision === null);
  const [isConsentModeReady, setIsConsentModeReady] = useState(false);

  useEffect(() => {
    function openBanner() {
      setIsBannerOpen(true);
    }

    window.addEventListener(CONSENT_CHANGE_EVENT, openBanner);

    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, openBanner);
  }, []);

  useEffect(() => {
    setIsConsentModeReady(true);
  }, []);

  function chooseDecision(nextDecision: ConsentDecision) {
    saveDecision(nextDecision);
    updateGoogleConsent(nextDecision);
    setDecision(nextDecision);
    setIsBannerOpen(false);
  }

  return (
    <>
      <Script
        dangerouslySetInnerHTML={{ __html: createConsentModeScript(initialDecision) }}
        id="consent-mode-default"
        strategy="afterInteractive"
      />
      {decision === 'accepted' && isConsentModeReady ? (
        <AnalyticsScripts trackingConfig={trackingConfig} />
      ) : null}
      {isBannerOpen ? <ConsentBanner onChoose={chooseDecision} /> : null}
    </>
  );
}
