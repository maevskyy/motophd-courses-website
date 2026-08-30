import {
  FREE_PLAYBACK_TTL_SEC,
  PAID_PLAYBACK_TTL_SEC,
  signPlaybackToken
} from './playbackToken';

export const getPlaybackUrl = (
  videoId: string | null | undefined,
  { free }: { free: boolean }
): string | null => {
  const customerCode = process.env.CF_STREAM_CUSTOMER_CODE;

  if (!videoId || !customerCode) {
    return null;
  }

  const token = signPlaybackToken({
    ttlSec: free ? FREE_PLAYBACK_TTL_SEC : PAID_PLAYBACK_TTL_SEC,
    videoId
  });

  return token ? `https://customer-${customerCode}.cloudflarestream.com/${token}/iframe` : null;
};
