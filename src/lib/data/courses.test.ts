import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { User } from '@/payload-types';

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  getPayloadClient: vi.fn()
}));

vi.mock('./payload', () => ({
  getPayloadClient: mocks.getPayloadClient
}));

import {
  getCourseCurriculum,
  getCourseLessons,
  getDashboardCourses,
  getPublishedCourses
} from './courses';

const user = {
  collection: 'users',
  createdAt: '2026-01-01T00:00:00.000Z',
  email: 'student@motophd.com',
  id: 7,
  role: 'student',
  updatedAt: '2026-01-01T00:00:00.000Z'
} satisfies User;

// Урок, как он лежит в Payload до сведения локалей: заголовок есть на трёх
// языках, видео и PDF — только на en и ru.
const storedLesson = {
  id: 3,
  pdf: { en: 21, ru: 22 },
  streamVideoId: { en: 'lean-en-lesson-1', ru: 'lean-ru-lesson-1' },
  title: { en: 'Lesson', ru: 'Урок', uk: 'Урок українською' }
};

type LocalizedValues = Record<string, unknown>;

// То, что делает afterRead в Payload: значение запрошенной локали, а если его
// нет — из fallbackLocale. Fake нужен, чтобы тест читался как сценарий, а не
// как проверка аргументов.
const findWithFallback = ({ fallbackLocale, locale }: { fallbackLocale: string; locale: string }) => ({
  docs: [
    Object.fromEntries(
      Object.entries(storedLesson).map(([key, value]) =>
        typeof value === 'object'
          ? [key, (value as LocalizedValues)[locale] ?? (value as LocalizedValues)[fallbackLocale] ?? null]
          : [key, value]
      )
    )
  ]
});

describe('course data access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getPayloadClient.mockResolvedValue({ find: mocks.find });
  });

  it('reads ukrainian lessons with russian as the fallback and keeps ukrainian fields', async () => {
    mocks.find.mockImplementation(findWithFallback);

    const [lesson] = await getCourseLessons(11, 'uk', user);

    expect(mocks.find).toHaveBeenCalledWith(
      expect.objectContaining({ collection: 'lessons', fallbackLocale: 'ru', locale: 'uk' })
    );
    expect(lesson).toMatchObject({
      pdf: 22,
      streamVideoId: 'lean-ru-lesson-1',
      title: 'Урок українською'
    });
  });

  it('keeps english as the fallback for russian and english readers', async () => {
    mocks.find.mockImplementation(findWithFallback);

    await getCourseLessons(11, 'ru', user);
    await getCourseLessons(11, 'en', user);

    expect(mocks.find).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ fallbackLocale: 'en', locale: 'ru' })
    );
    expect(mocks.find).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ fallbackLocale: 'en', locale: 'en' })
    );
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
