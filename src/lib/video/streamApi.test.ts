import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createStreamUpload,
  deleteStreamVideo,
  getStreamVideo,
  listStreamVideos,
  toStatus
} from './streamApi';
import { uidFromUploadUrl } from './uploadUrl';

const ACCOUNT = '0'.repeat(32);
const UID = 'c472ff393cd587cf6904bc9387d20398';
const fetchMock = vi.fn();

const decodeMetadata = (metadata: string) =>
  Object.fromEntries(
    metadata.split(',').map((pair) => {
      const [key, value] = pair.split(' ');

      return [key, value === undefined ? true : Buffer.from(value, 'base64').toString('utf8')];
    })
  );

describe('Cloudflare Stream API', () => {
  beforeEach(() => {
    vi.stubEnv('CF_API_TOKEN', 'token');
    vi.stubEnv('CF_ACCOUNT_ID', ACCOUNT);
    vi.stubEnv('STREAM_ALLOWED_ORIGINS', '');
    vi.stubGlobal('fetch', fetchMock);
    fetchMock.mockReset();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it('creates a browser upload that is protected from the start', async () => {
    fetchMock.mockResolvedValue(
      new Response(null, {
        headers: {
          Location: `https://upload.cloudflarestream.com/tus/${UID}?tusv2=true`,
          'stream-media-id': UID
        },
        status: 201
      })
    );

    await expect(createStreamUpload({ name: 'lean · урок 01 · RU', size: 1024 })).resolves.toEqual({
      uid: UID,
      uploadUrl: `https://upload.cloudflarestream.com/tus/${UID}?tusv2=true`
    });

    const [url, init] = fetchMock.mock.calls[0];

    expect(url).toBe(
      `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/stream?direct_user=true`
    );
    expect(init.headers).toMatchObject({ Authorization: 'Bearer token', 'Upload-Length': '1024' });
    expect(decodeMetadata(init.headers['Upload-Metadata'])).toEqual({
      allowedorigins: 'motophd.com,www.motophd.com',
      name: 'lean · урок 01 · RU',
      requiresignedurls: true
    });
  });

  it('reports a refused upload instead of returning an empty link', async () => {
    fetchMock.mockResolvedValue(new Response('quota exceeded', { status: 403 }));

    await expect(createStreamUpload({ name: 'x', size: 1 })).rejects.toThrow(/403 quota exceeded/);
  });

  it('maps a Stream video and treats a missing one as null', async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        result: {
          duration: 515.4,
          meta: { name: 'lean-en-05' },
          requireSignedURLs: true,
          status: { state: 'ready' },
          uid: UID
        }
      })
    );
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));

    await expect(getStreamVideo(UID)).resolves.toEqual({
      durationSec: 515,
      name: 'lean-en-05',
      protected: true,
      status: 'ready',
      uid: UID
    });
    await expect(getStreamVideo(UID)).resolves.toBeNull();
  });

  it('deletes a video, and an already deleted one is not an error', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 404 }));
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 500 }));

    await expect(deleteStreamVideo(UID)).resolves.toBeUndefined();
    await expect(deleteStreamVideo(UID)).resolves.toBeUndefined();
    await expect(deleteStreamVideo(UID)).rejects.toThrow(/500/);
    expect(fetchMock.mock.calls[0][1].method).toBe('DELETE');
  });

  it('lists videos, a video still uploading included', async () => {
    fetchMock.mockResolvedValue(
      Response.json({ result: [{ status: { state: 'pendingupload' }, uid: UID }] })
    );

    await expect(listStreamVideos()).resolves.toEqual([
      { durationSec: null, name: null, protected: false, status: 'uploading', uid: UID }
    ]);
  });

  it('takes the account from R2_ENDPOINT when CF_ACCOUNT_ID is not set', async () => {
    vi.stubEnv('CF_ACCOUNT_ID', '');
    vi.stubEnv('R2_ENDPOINT', `https://${'a'.repeat(32)}.r2.cloudflarestorage.com`);
    fetchMock.mockResolvedValue(Response.json({ result: [] }));

    await listStreamVideos();

    expect(fetchMock.mock.calls[0][0]).toContain(`/accounts/${'a'.repeat(32)}/stream`);
  });

  it('refuses to work without a token', async () => {
    vi.stubEnv('CF_API_TOKEN', '');

    await expect(listStreamVideos()).rejects.toThrow(/CF_API_TOKEN/);
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('Stream helpers', () => {
  it('maps processing states', () => {
    expect(toStatus('queued')).toBe('processing');
    expect(toStatus('inprogress')).toBe('processing');
    expect(toStatus('error')).toBe('error');
  });

  it('reads the video ID from the tus upload link', () => {
    expect(uidFromUploadUrl(`https://upload.cloudflarestream.com/tus/${UID}?tusv2=true`)).toBe(UID);
    expect(uidFromUploadUrl('https://upload.cloudflarestream.com/tus/short')).toBeNull();
    expect(uidFromUploadUrl(null)).toBeNull();
  });
});
