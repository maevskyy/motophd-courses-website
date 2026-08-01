import type { Payload } from 'payload';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  hasPaidAccess: vi.fn(),
  isAdminUser: vi.fn()
}));

vi.mock('@/lib/access/hasPaidAccess', () => mocks);

import { canReadLessonContent } from './Lessons';

const payload = {} as Payload;
const lesson = {
  collection: 'lessons',
  course: 12,
  createdAt: '2026-01-01T00:00:00.000Z',
  id: 5,
  title: 'Lean angle',
  type: 'video' as const,
  updatedAt: '2026-01-01T00:00:00.000Z'
};

describe('lesson content field access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isAdminUser.mockReturnValue(false);
  });

  it('allows every visitor to read a free preview', async () => {
    const req = { payload, user: null };

    await expect(
      canReadLessonContent({ doc: { ...lesson, isFreePreview: true }, req } as never)
    ).resolves.toBe(true);
    expect(mocks.hasPaidAccess).not.toHaveBeenCalled();
  });

  it('hides protected content from a visitor without a purchase', async () => {
    const req = { payload, user: null };

    await expect(canReadLessonContent({ doc: lesson, req } as never)).resolves.toBe(false);
    expect(mocks.hasPaidAccess).not.toHaveBeenCalled();
  });

  it('caches a paid-access check for all protected fields of one lesson', async () => {
    const user = { id: 7, role: 'student' };
    const req = { payload, user };
    mocks.hasPaidAccess.mockResolvedValue(true);

    await expect(canReadLessonContent({ doc: lesson, req } as never)).resolves.toBe(true);
    await expect(canReadLessonContent({ doc: lesson, req } as never)).resolves.toBe(true);
    await expect(canReadLessonContent({ doc: lesson, req } as never)).resolves.toBe(true);

    expect(mocks.hasPaidAccess).toHaveBeenCalledTimes(1);
    expect(mocks.hasPaidAccess).toHaveBeenCalledWith(payload, user, 12);
  });
});
