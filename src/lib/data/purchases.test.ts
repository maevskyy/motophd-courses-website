import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Purchases } from '@/collections/Purchases';
import type { User } from '@/payload-types';
import type { PayloadRequest } from 'payload';

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  getPayloadClient: vi.fn()
}));

vi.mock('./payload', () => ({
  getPayloadClient: mocks.getPayloadClient
}));

import { getPurchaseHistory } from './purchases';

const user = {
  collection: 'users',
  createdAt: '2026-01-01T00:00:00.000Z',
  email: 'student@motophd.com',
  id: 7,
  role: 'student',
  updatedAt: '2026-01-01T00:00:00.000Z'
} satisfies User;

const asReq = (reqUser: unknown) => ({ req: { user: reqUser } as PayloadRequest });

describe('Purchases read access', () => {
  const read = Purchases.access?.read;

  it('lets a student see only their own purchases', () => {
    expect(read?.(asReq(user))).toEqual({ user: { equals: user.id } });
  });

  it('keeps everything open for the admin and closed for anonymous', () => {
    expect(read?.(asReq({ ...user, role: 'admin' }))).toBe(true);
    expect(read?.(asReq(null))).toBe(false);
  });
});

describe('getPurchaseHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPayloadClient.mockResolvedValue({ find: mocks.find });
  });

  it('queries purchases as the signed-in user, newest first', async () => {
    mocks.find.mockResolvedValue({ docs: [] });

    await expect(getPurchaseHistory('en', user)).resolves.toEqual([]);

    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'purchases',
        overrideAccess: false,
        sort: '-createdAt',
        user,
        where: { user: { equals: user.id } }
      })
    );
  });

  it('maps purchases with the course title resolved', async () => {
    mocks.find.mockResolvedValue({
      docs: [
        {
          amount: 29,
          course: { id: 2, title: 'Lean with confidence' },
          createdAt: '2026-08-01T10:00:00.000Z',
          currency: 'EUR',
          id: 11,
          status: 'paid',
          tier: 'standard',
          user: 7
        }
      ]
    });

    await expect(getPurchaseHistory('en', user)).resolves.toEqual([
      {
        amount: 29,
        courseTitle: 'Lean with confidence',
        currency: 'EUR',
        id: 11,
        purchasedAt: '2026-08-01T10:00:00.000Z',
        status: 'paid',
        tier: 'standard'
      }
    ]);
  });
});
