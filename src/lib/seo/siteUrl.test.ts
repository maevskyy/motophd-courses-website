import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_SITE_URL, getSiteUrl } from './siteUrl';

const original = {
  APP_URL: process.env.APP_URL,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL
};

describe('getSiteUrl', () => {
  beforeEach(() => {
    delete process.env.APP_URL;
    delete process.env.NEXT_PUBLIC_SITE_URL;
  });

  afterEach(() => {
    process.env.APP_URL = original.APP_URL;
    process.env.NEXT_PUBLIC_SITE_URL = original.NEXT_PUBLIC_SITE_URL;
  });

  it('falls back to the production domain when nothing is configured', () => {
    expect(getSiteUrl()).toBe(DEFAULT_SITE_URL);
  });

  it('prefers APP_URL, then NEXT_PUBLIC_SITE_URL', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000/';
    expect(getSiteUrl()).toBe('http://localhost:3000');

    process.env.APP_URL = 'https://staging.motophd.com/some/path';
    expect(getSiteUrl()).toBe('https://staging.motophd.com');
  });

  it('ignores a malformed value instead of crashing metadata', () => {
    process.env.APP_URL = 'motophd.com';
    expect(getSiteUrl()).toBe(DEFAULT_SITE_URL);
  });
});
