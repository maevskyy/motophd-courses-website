import { cookies } from 'next/headers';
import { ConsentClient } from './ConsentClient';
import { CONSENT_COOKIE_NAME, getTrackingConfig, parseConsentDecision } from './consentConfig';

export async function Consent() {
  const trackingConfig = getTrackingConfig();

  if (!trackingConfig) {
    return null;
  }

  const cookieStore = await cookies();
  const initialDecision = parseConsentDecision(cookieStore.get(CONSENT_COOKIE_NAME)?.value);

  return <ConsentClient initialDecision={initialDecision} trackingConfig={trackingConfig} />;
}
