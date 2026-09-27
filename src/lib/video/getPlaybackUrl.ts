import {
  FREE_PLAYBACK_TTL_SEC,
  PAID_PLAYBACK_TTL_SEC,
  signPlaybackToken
} from './playbackToken';

type PlaybackOptions = {
  free: boolean;
  // Абсолютный URL картинки, которую плеер показывает до нажатия play.
  // Stream грузит её из своего iframe, поэтому картинка должна быть публичной.
  poster?: null | string;
};

export const getPlaybackUrl = (
  videoId: string | null | undefined,
  { free, poster }: PlaybackOptions
): string | null => {
  const customerCode = process.env.CF_STREAM_CUSTOMER_CODE;

  if (!videoId || !customerCode) {
    return null;
  }

  const token = signPlaybackToken({
    ttlSec: free ? FREE_PLAYBACK_TTL_SEC : PAID_PLAYBACK_TTL_SEC,
    videoId
  });

  if (!token) {
    return null;
  }

  const url = `https://customer-${customerCode}.cloudflarestream.com/${token}/iframe`;

  return poster ? `${url}?poster=${encodeURIComponent(poster)}` : url;
};
