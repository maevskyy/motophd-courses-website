import { generateKeyPairSync, verify } from 'node:crypto';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PAID_PLAYBACK_TTL_SEC, signPlaybackToken } from './playbackToken';

const streamEnvNames = ['CF_STREAM_KEY_ID', 'CF_STREAM_KEY_PEM'] as const;
const originalEnv = Object.fromEntries(streamEnvNames.map((name) => [name, process.env[name]]));

const decodeTokenPart = (part: string) => JSON.parse(Buffer.from(part, 'base64url').toString('utf8'));

afterEach(() => {
  vi.restoreAllMocks();

  for (const name of streamEnvNames) {
    const value = originalEnv[name];

    if (value === undefined) {
      delete process.env[name];
    } else {
      process.env[name] = value;
    }
  }
});

describe('signPlaybackToken', () => {
  it('creates an RS256 token with the expected Stream claims', () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const now = 1_789_000_000;

    process.env.CF_STREAM_KEY_ID = 'stream-key-1';
    process.env.CF_STREAM_KEY_PEM = Buffer.from(
      privateKey.export({ format: 'pem', type: 'pkcs8' }).toString()
    ).toString('base64');
    vi.spyOn(Date, 'now').mockReturnValue(now * 1000);

    const token = signPlaybackToken({ videoId: 'video-uid', ttlSec: PAID_PLAYBACK_TTL_SEC });

    expect(token).not.toBeNull();
    const [headerPart, payloadPart, signaturePart] = token!.split('.');
    const header = decodeTokenPart(headerPart);
    const payload = decodeTokenPart(payloadPart);

    expect(verify('RSA-SHA256', Buffer.from(`${headerPart}.${payloadPart}`), publicKey, Buffer.from(signaturePart, 'base64url'))).toBe(true);
    expect(header).toEqual({ alg: 'RS256', kid: 'stream-key-1' });
    expect(payload).toMatchObject({
      exp: now + PAID_PLAYBACK_TTL_SEC,
      kid: 'stream-key-1',
      nbf: now,
      sub: 'video-uid'
    });
    expect(payload.exp - now).toBeLessThanOrEqual(24 * 60 * 60);
  });

  it('returns null without Cloudflare Stream credentials', () => {
    delete process.env.CF_STREAM_KEY_ID;
    delete process.env.CF_STREAM_KEY_PEM;

    expect(signPlaybackToken({ videoId: 'video-uid', ttlSec: PAID_PLAYBACK_TTL_SEC })).toBeNull();
  });
});
