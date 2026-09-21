import type { PayloadRequest, SanitizedCollectionConfig } from 'payload';
import { describe, expect, it, vi } from 'vitest';

import { decodeSessionId, keepOnlyCurrentSession } from './singleSession';

const tokenWith = (claims: Record<string, unknown>) =>
  `eyJhbGciOiJIUzI1NiJ9.${Buffer.from(JSON.stringify(claims)).toString('base64url')}.sig`;

const runHook = (user: Parameters<typeof keepOnlyCurrentSession>[0]['user'], token: string) => {
  const updateOne = vi.fn().mockResolvedValue(undefined);
  const req = { payload: { db: { updateOne } } } as unknown as PayloadRequest;
  const collection = { slug: 'users' } as SanitizedCollectionConfig;

  return {
    result: keepOnlyCurrentSession({ collection, context: {}, req, token, user }),
    updateOne
  };
};

describe('decodeSessionId', () => {
  it('reads sid from the token payload', () => {
    expect(decodeSessionId(tokenWith({ id: 1, sid: 'abc' }))).toBe('abc');
  });

  it('returns null for tokens without sid or malformed tokens', () => {
    expect(decodeSessionId(tokenWith({ id: 1 }))).toBeNull();
    expect(decodeSessionId('not-a-jwt')).toBeNull();
    expect(decodeSessionId('a.!!!.c')).toBeNull();
  });
});

describe('keepOnlyCurrentSession', () => {
  it('drops every session except the one from the freshly issued token', async () => {
    const user = {
      id: 7,
      sessions: [{ id: 'phone' }, { id: 'tablet' }, { id: 'laptop' }],
      updatedAt: '2026-09-19T00:00:00.000Z'
    };
    const { result, updateOne } = runHook(user, tokenWith({ id: 7, sid: 'laptop' }));

    await expect(result).resolves.toEqual({
      id: 7,
      sessions: [{ id: 'laptop' }],
      updatedAt: null
    });
    expect(updateOne).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'users',
        data: expect.objectContaining({ sessions: [{ id: 'laptop' }], updatedAt: null }),
        id: 7,
        returning: false
      })
    );
  });

  it('does not touch the database on the first login', async () => {
    const user = { id: 7, sessions: [{ id: 'laptop' }] };
    const { result, updateOne } = runHook(user, tokenWith({ id: 7, sid: 'laptop' }));

    await expect(result).resolves.toBe(user);
    expect(updateOne).not.toHaveBeenCalled();
  });

  it('leaves sessions alone when the token has no sid or sid is unknown', async () => {
    const user = { id: 7, sessions: [{ id: 'phone' }, { id: 'laptop' }] };

    const noSid = runHook(user, tokenWith({ id: 7 }));
    await expect(noSid.result).resolves.toBe(user);
    expect(noSid.updateOne).not.toHaveBeenCalled();

    const unknownSid = runHook(user, tokenWith({ id: 7, sid: 'ghost' }));
    await expect(unknownSid.result).resolves.toBe(user);
    expect(unknownSid.updateOne).not.toHaveBeenCalled();
  });
});
