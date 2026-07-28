import type { Payload } from 'payload';
import { describe, expect, it, vi } from 'vitest';

import { hasPaidAccess, isAdminUser } from './hasPaidAccess';

const makePayload = (totalDocs: number) => {
  const find = vi.fn().mockResolvedValue({ totalDocs });

  return { find, payload: { find } as unknown as Payload };
};

describe('isAdminUser', () => {
  it('returns true only for the admin role', () => {
    expect(isAdminUser({ role: 'admin' })).toBe(true);
    expect(isAdminUser({ role: 'student' })).toBe(false);
    expect(isAdminUser(null)).toBe(false);
    expect(isAdminUser(undefined)).toBe(false);
  });
});

describe('hasPaidAccess', () => {
  it('returns false without querying when user is missing', async () => {
    const { payload, find } = makePayload(1);

    await expect(hasPaidAccess(payload, null, 3)).resolves.toBe(false);
    expect(find).not.toHaveBeenCalled();
  });

  it('returns false without querying when course is missing', async () => {
    const { payload, find } = makePayload(1);

    await expect(hasPaidAccess(payload, 5, undefined)).resolves.toBe(false);
    expect(find).not.toHaveBeenCalled();
  });

  it('returns true when a paid purchase exists', async () => {
    const { payload, find } = makePayload(1);

    await expect(hasPaidAccess(payload, 5, 3)).resolves.toBe(true);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'purchases',
        where: {
          and: [
            { user: { equals: 5 } },
            { course: { equals: 3 } },
            { status: { equals: 'paid' } }
          ]
        }
      })
    );
  });

  it('returns false when no paid purchase exists', async () => {
    const { payload } = makePayload(0);

    await expect(hasPaidAccess(payload, 5, 3)).resolves.toBe(false);
  });

  it('accepts populated relation objects and queries by their ids', async () => {
    const { payload, find } = makePayload(1);

    await expect(hasPaidAccess(payload, { id: 7 }, { id: 9 })).resolves.toBe(true);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          and: [
            { user: { equals: 7 } },
            { course: { equals: 9 } },
            { status: { equals: 'paid' } }
          ]
        }
      })
    );
  });

  it('returns false for relation objects without an id', async () => {
    const { payload, find } = makePayload(1);

    await expect(hasPaidAccess(payload, {}, { id: 9 })).resolves.toBe(false);
    expect(find).not.toHaveBeenCalled();
  });
});
