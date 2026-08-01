import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '@/payload-types';

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  getPayloadClient: vi.fn()
}));

vi.mock('./payload', () => ({
  getPayloadClient: mocks.getPayloadClient
}));

import { getCourseCurriculum, getDashboardCourses, getPublishedCourses } from './courses';

const user = {
  collection: 'users',
  createdAt: '2026-01-01T00:00:00.000Z',
  email: 'student@motophd.com',
  id: 7,
  role: 'student',
  updatedAt: '2026-01-01T00:00:00.000Z'
} satisfies User;

describe('course data access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPayloadClient.mockResolvedValue({ find: mocks.find });
  });

  it('passes the authenticated user to public course queries', async () => {
    mocks.find.mockResolvedValue({ docs: [] });

    await getPublishedCourses('en', user);

    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'courses',
        overrideAccess: false,
        user
      })
    );
  });

  it('loads the public curriculum without protected lesson fields', async () => {
    mocks.find.mockResolvedValue({ docs: [] });

    await getCourseCurriculum(11, 'ru', user);

    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'lessons',
        depth: 0,
        locale: 'ru',
        overrideAccess: false,
        select: {
          durationSec: true,
          isFreePreview: true,
          order: true,
          title: true,
          type: true
        },
        user
      })
    );
  });

  it('returns no dashboard courses when the user has no paid purchases', async () => {
    mocks.find.mockResolvedValueOnce({ docs: [] });

    await expect(getDashboardCourses('en', user)).resolves.toEqual([]);
    expect(mocks.find).toHaveBeenCalledTimes(1);
    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'purchases',
        user,
        where: {
          and: [{ user: { equals: user.id } }, { status: { equals: 'paid' } }]
        }
      })
    );
  });

  it("loads only courses from the user's paid purchases", async () => {
    const courses = [{ id: 11, slug: 'lean' }];
    mocks.find
      .mockResolvedValueOnce({ docs: [{ course: 11 }] })
      .mockResolvedValueOnce({ docs: courses });

    await expect(getDashboardCourses('ru', user)).resolves.toEqual(courses);

    expect(mocks.find).toHaveBeenLastCalledWith(
      expect.objectContaining({
        collection: 'courses',
        locale: 'ru',
        overrideAccess: false,
        user,
        where: {
          and: [{ id: { in: [11] } }, { status: { equals: 'published' } }]
        }
      })
    );
  });
});
