import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Payload } from 'payload';
import type { User } from '@/payload-types';
import { hasFeedbackAccess } from './hasFeedbackAccess';

const find = vi.fn();
const payload = { find } as unknown as Payload;

const user = {
  collection: 'users',
  createdAt: '2026-01-01T00:00:00.000Z',
  email: 'student@motophd.com',
  id: 7,
  role: 'student',
  updatedAt: '2026-01-01T00:00:00.000Z'
} satisfies User;

describe('hasFeedbackAccess', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies anonymous visitors without querying', async () => {
    await expect(hasFeedbackAccess(payload, null)).resolves.toBe(false);

    expect(find).not.toHaveBeenCalled();
  });

  it('requires a paid feedback tier purchase of the signed-in user', async () => {
    find.mockResolvedValue({ totalDocs: 0 });

    await expect(hasFeedbackAccess(payload, user)).resolves.toBe(false);

    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'purchases',
        overrideAccess: false,
        user,
        where: {
          and: [
            { user: { equals: user.id } },
            { status: { equals: 'paid' } },
            { tier: { in: ['feedback', 'feedback_upgrade'] } }
          ]
        }
      })
    );
  });

  it('grants access when a paid feedback purchase exists', async () => {
    find.mockResolvedValue({ totalDocs: 1 });

    await expect(hasFeedbackAccess(payload, user)).resolves.toBe(true);
  });
});
