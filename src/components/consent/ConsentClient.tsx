'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';
import { AnalyticsScripts } from './AnalyticsScripts';
import { ConsentBanner } from './ConsentBanner';
import {
  CONSENT_CHANGE_EVENT,
  CONSENT_COOKIE_MAX_AGE,
  CONSENT_COOKIE_NAME,
  CONSENT_READY_EVENT,
  parseConsentDecision,
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

// Пишем в dataLayer напрямую: window.gtag может ещё не существовать, и тогда
// вызов через ?. молча терялся — согласие оставалось denied навсегда.
function updateGoogleConsent(decision: ConsentDecision) {
  const value = decision === 'accepted' ? 'granted' : 'denied';

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push([
    'consent',
    'update',
    {
      ad_personalization: value,
      ad_storage: value,
      ad_user_data: value,
      analytics_storage: value
    }
  ]);
}

const TRACKING_COOKIE_PATTERN = /^(_ga|_gid|_fbp|_fbc)/;

// GDPR ст. 7(3): отзыв должен реально прекращать обработку, а не только
// перестать грузить скрипты при следующем визите.
function clearTrackingCookies() {
  const { hostname } = window.location;
  const domains = ['', `; Domain=${hostname}`, `; Domain=.${hostname}`];

  document.cookie
    .split(';')
    .map((entry) => entry.split('=')[0].trim())
    .filter((name) => TRACKING_COOKIE_PATTERN.test(name))
    .forEach((name) => {
      domains.forEach((domain) => {
        document.cookie = `${name}=; Max-Age=0; Path=/${domain}`;
      });
    });
}

function revokeConsent() {
  updateGoogleConsent('necessary');
  window.fbq?.('consent', 'revoke');
  clearTrackingCookies();
}

function saveDecision(decision: ConsentDecision) {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${CONSENT_COOKIE_NAME}=${decision}; Max-Age=${CONSENT_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

function ConsentContent({ initialDecision, trackingConfig }: Props) {
  const [decision, setDecision] = useState(initialDecision);
  const [isBannerOpen, setIsBannerOpen] = useState(initialDecision === null);
  const [isConsentModeReady, setIsConsentModeReady] = useState(false);

  useEffect(() => {
    function openBanner() {
      setIsBannerOpen(true);
    }

    window.addEventListener(CONSENT_CHANGE_EVENT, openBanner);
    window.__motophdConsentReady = true;
    window.dispatchEvent(new Event(CONSENT_READY_EVENT));

    return () => {
      window.removeEventListener(CONSENT_CHANGE_EVENT, openBanner);
      window.__motophdConsentReady = false;
    };
  }, []);

  useEffect(() => {
    setIsConsentModeReady(true);
  }, []);

  function chooseDecision(nextDecision: ConsentDecision) {
    const isRevoking = decision === 'accepted' && nextDecision !== 'accepted';

    saveDecision(nextDecision);
    setDecision(nextDecision);
    setIsBannerOpen(false);

    if (!isRevoking) {
      updateGoogleConsent(nextDecision);
      return;
    }

    // Размонтировать <Script> недостаточно: уже загруженные gtag.js и
    // fbevents.js продолжают работать, поэтому страницу перезагружаем.
    revokeConsent();
    window.location.reload();
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

function readStoredDecision() {
  const entry = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${CONSENT_COOKIE_NAME}=`));

  return parseConsentDecision(entry?.slice(CONSENT_COOKIE_NAME.length + 1));
}

// Кука согласия читается в браузере: серверный рендер маркетинга статичен,
// один и тот же HTML уходит всем посетителям, cookies() там недоступны.
export function ConsentClient({ trackingConfig }: { trackingConfig: TrackingConfig }) {
  const [storedDecision, setStoredDecision] = useState<ConsentDecision | null>();

  useEffect(() => {
    setStoredDecision(readStoredDecision());
  }, []);

  if (storedDecision === undefined) {
    return null;
  }

  return <ConsentContent initialDecision={storedDecision} trackingConfig={trackingConfig} />;
}
