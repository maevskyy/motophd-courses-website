import { createSign } from 'node:crypto';

export const PAID_PLAYBACK_TTL_SEC = 4 * 60 * 60;
export const FREE_PLAYBACK_TTL_SEC = 30 * 60;
const MAX_PLAYBACK_TTL_SEC = 24 * 60 * 60;

type PlaybackTokenInput = {
  ttlSec: number;
  videoId: string;
};

const toBase64Url = (value: string) => Buffer.from(value).toString('base64url');

const getSigningConfig = () => {
  const keyId = process.env.CF_STREAM_KEY_ID;
  const pem = process.env.CF_STREAM_KEY_PEM;

  if (!keyId || !pem) {
    return null;
  }

  return {
    keyId,
    privateKey: Buffer.from(pem, 'base64').toString('utf8')
  };
};

export const signPlaybackToken = ({ videoId, ttlSec }: PlaybackTokenInput): string | null => {
  const signingConfig = getSigningConfig();

  if (!signingConfig || !videoId) {
    return null;
  }

  if (ttlSec <= 0 || ttlSec > MAX_PLAYBACK_TTL_SEC) {
    throw new RangeError(`Playback token TTL must be between 1 and ${MAX_PLAYBACK_TTL_SEC} seconds`);
  }

  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url(JSON.stringify({ alg: 'RS256', kid: signingConfig.keyId }));
  const payload = toBase64Url(
    JSON.stringify({
      exp: now + ttlSec,
      kid: signingConfig.keyId,
      nbf: now,
      sub: videoId
    })
  );
  const unsignedToken = `${header}.${payload}`;
  const signer = createSign('RSA-SHA256');

  signer.update(unsignedToken);
  signer.end();

  return `${unsignedToken}.${signer.sign(signingConfig.privateKey, 'base64url')}`;
};
