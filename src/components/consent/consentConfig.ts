export const CONSENT_COOKIE_NAME = 'motophd_consent';
export const CONSENT_CHANGE_EVENT = 'motophd:change-consent';
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type ConsentDecision = 'accepted' | 'necessary';

export interface TrackingConfig {
  ga4Id?: string;
  metaPixelId?: string;
}

function readPublicEnvironment(name: 'NEXT_PUBLIC_GA4_ID' | 'NEXT_PUBLIC_META_PIXEL_ID') {
  const value = process.env[name]?.trim();

  return value || undefined;
}

export function getTrackingConfig(): TrackingConfig | null {
  const config = {
    ga4Id: readPublicEnvironment('NEXT_PUBLIC_GA4_ID'),
    metaPixelId: readPublicEnvironment('NEXT_PUBLIC_META_PIXEL_ID')
  };

  return config.ga4Id || config.metaPixelId ? config : null;
}

export function parseConsentDecision(value: string | undefined): ConsentDecision | null {
  return value === 'accepted' || value === 'necessary' ? value : null;
}
