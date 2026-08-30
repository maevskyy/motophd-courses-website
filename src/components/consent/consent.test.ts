import { afterEach, describe, expect, it } from 'vitest';
import { getTrackingConfig, parseConsentDecision } from './consentConfig';

const initialGa4Id = process.env.NEXT_PUBLIC_GA4_ID;
const initialMetaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

afterEach(() => {
  if (initialGa4Id === undefined) {
    delete process.env.NEXT_PUBLIC_GA4_ID;
  } else {
    process.env.NEXT_PUBLIC_GA4_ID = initialGa4Id;
  }

  if (initialMetaPixelId === undefined) {
    delete process.env.NEXT_PUBLIC_META_PIXEL_ID;
  } else {
    process.env.NEXT_PUBLIC_META_PIXEL_ID = initialMetaPixelId;
  }
});

describe('consent configuration', () => {
  it('enables the banner configuration when an analytics id is given', () => {
    process.env.NEXT_PUBLIC_GA4_ID = 'G-TEST123';
    delete process.env.NEXT_PUBLIC_META_PIXEL_ID;

    expect(getTrackingConfig()).toEqual({ ga4Id: 'G-TEST123', metaPixelId: undefined });
  });

  it('only accepts known cookie decisions', () => {
    expect(parseConsentDecision('accepted')).toBe('accepted');
    expect(parseConsentDecision('necessary')).toBe('necessary');
    expect(parseConsentDecision('anything-else')).toBeNull();
  });
});
