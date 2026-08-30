'use client';

import Script from 'next/script';
import type { TrackingConfig } from './consentConfig';

interface Props {
  trackingConfig: TrackingConfig;
}

function initializeGoogleAnalytics(trackingId: string) {
  window.gtag?.('js', new Date());
  window.gtag?.('config', trackingId);
}

function createMetaPixelScript(pixelId: string) {
  const safePixelId = JSON.stringify(pixelId);

  return `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${safePixelId});fbq('track','PageView');`;
}

export function AnalyticsScripts({ trackingConfig }: Props) {
  const { ga4Id, metaPixelId } = trackingConfig;

  return (
    <>
      {ga4Id ? (
        <Script
          id="ga4-loader"
          onLoad={() => initializeGoogleAnalytics(ga4Id)}
          src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`}
          strategy="afterInteractive"
        />
      ) : null}
      {metaPixelId ? (
        <Script
          dangerouslySetInnerHTML={{ __html: createMetaPixelScript(metaPixelId) }}
          id="meta-pixel-loader"
          strategy="afterInteractive"
        />
      ) : null}
    </>
  );
}
