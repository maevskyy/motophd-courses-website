import { afterEach, describe, expect, it } from 'vitest';

import { getTeaserEmbedUrl } from './getTeaserEmbedUrl';

const originalCode = process.env.CF_STREAM_CUSTOMER_CODE;

afterEach(() => {
  if (originalCode === undefined) {
    delete process.env.CF_STREAM_CUSTOMER_CODE;
  } else {
    process.env.CF_STREAM_CUSTOMER_CODE = originalCode;
  }
});

describe('getTeaserEmbedUrl', () => {
  it('builds an unsigned iframe url from the customer code and video id', () => {
    process.env.CF_STREAM_CUSTOMER_CODE = 'abc123';

    expect(getTeaserEmbedUrl('vid42')).toBe('https://customer-abc123.cloudflarestream.com/vid42/iframe');
  });

  it('returns null without a video id or without Stream configured', () => {
    process.env.CF_STREAM_CUSTOMER_CODE = 'abc123';
    expect(getTeaserEmbedUrl(null)).toBeNull();
    expect(getTeaserEmbedUrl('')).toBeNull();

    delete process.env.CF_STREAM_CUSTOMER_CODE;
    expect(getTeaserEmbedUrl('vid42')).toBeNull();
  });
});
