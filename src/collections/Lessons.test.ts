import type { Payload } from 'payload';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  hasPaidAccess: vi.fn(),
  isAdminUser: vi.fn()
}));

vi.mock('@/lib/access/hasPaidAccess', () => mocks);

import { canReadLessonContent, syncStreamVideoId } from './Lessons';

const payload = {} as Payload;
const lesson = {
  collection: 'lessons',
  course: 12,
  createdAt: '2026-01-01T00:00:00.000Z',
  id: 5,
  title: 'Lean angle',
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

describe('syncStreamVideoId', () => {
  const findByID = vi.fn();
  const req = { payload: { findByID } };
  const run = (data: Record<string, unknown>, originalDoc?: Record<string, unknown>) =>
    syncStreamVideoId({ data, originalDoc, req } as never);

  beforeEach(() => {
    findByID.mockReset();
  });

  it('copies the Stream ID of the picked video', async () => {
    findByID.mockResolvedValue({ id: 3, streamUid: 'a'.repeat(32) });

    await expect(run({ video: 3 })).resolves.toMatchObject({ streamVideoId: 'a'.repeat(32) });
    expect(findByID).toHaveBeenCalledWith(expect.objectContaining({ collection: 'videos', id: 3 }));
  });

  it('copies the duration once Stream knows it', async () => {
    findByID.mockResolvedValueOnce({ durationSec: 412, id: 3, streamUid: 'a'.repeat(32) });
    await expect(run({ video: 3 })).resolves.toMatchObject({ durationSec: 412 });

    findByID.mockResolvedValueOnce({ durationSec: null, id: 3, streamUid: 'a'.repeat(32) });
    await expect(run({ durationSec: 300, video: 3 })).resolves.toMatchObject({ durationSec: 300 });
  });

  it('clears the Stream ID when the video is removed from the lesson', async () => {
    await expect(run({ streamVideoId: 'old', video: null }, { video: 3 })).resolves.toMatchObject({
      streamVideoId: null
    });
  });

  it('keeps an ID written directly when no video was ever picked', async () => {
    await expect(run({ streamVideoId: 'seeded', video: null }, { video: null })).resolves.toEqual({
      streamVideoId: 'seeded',
      video: null
    });
    await expect(run({ title: 'Only title' })).resolves.toEqual({ title: 'Only title' });
    expect(findByID).not.toHaveBeenCalled();
  });
});
