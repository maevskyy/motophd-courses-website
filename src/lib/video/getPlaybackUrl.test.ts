import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('./playbackToken', () => ({
  FREE_PLAYBACK_TTL_SEC: 1800,
  PAID_PLAYBACK_TTL_SEC: 14400,
  signPlaybackToken: vi.fn(({ videoId }: { videoId: string }) => `signed-${videoId}`)
}));

import { getPlaybackUrl } from './getPlaybackUrl';

const originalCode = process.env.CF_STREAM_CUSTOMER_CODE;

afterEach(() => {
  if (originalCode === undefined) {
    delete process.env.CF_STREAM_CUSTOMER_CODE;
  } else {
    process.env.CF_STREAM_CUSTOMER_CODE = originalCode;
  }
});

describe('getPlaybackUrl', () => {
  it('builds a signed iframe url', () => {
    process.env.CF_STREAM_CUSTOMER_CODE = 'abc';

    expect(getPlaybackUrl('vid', { free: false })).toBe(
      'https://customer-abc.cloudflarestream.com/signed-vid/iframe'
    );
  });

  it('appends the poster url-encoded when a cover is given', () => {
    process.env.CF_STREAM_CUSTOMER_CODE = 'abc';

    expect(getPlaybackUrl('vid', { free: false, poster: 'https://motophd.com/api/media/file/ru-01.jpg' })).toBe(
      'https://customer-abc.cloudflarestream.com/signed-vid/iframe?poster=https%3A%2F%2Fmotophd.com%2Fapi%2Fmedia%2Ffile%2Fru-01.jpg'
    );
    expect(getPlaybackUrl('vid', { free: false, poster: null })).toBe(
      'https://customer-abc.cloudflarestream.com/signed-vid/iframe'
    );
  });

  it('returns null without a video id or Stream customer code', () => {
    process.env.CF_STREAM_CUSTOMER_CODE = 'abc';
    expect(getPlaybackUrl(null, { free: true })).toBeNull();

    delete process.env.CF_STREAM_CUSTOMER_CODE;
    expect(getPlaybackUrl('vid', { free: true })).toBeNull();
  });
});
