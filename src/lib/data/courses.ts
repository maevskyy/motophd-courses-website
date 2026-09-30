import { getFallbackLocale, toLocale } from '@/i18n/locales';
import { isAdminUser } from '@/lib/access/hasPaidAccess';
import type { LegalPage, Lesson, User } from '@/payload-types';
import { getPayloadClient } from './payload';
import { cachedPublic } from './publicCache';
import type { AppLocale } from './types';

export const toAppLocale = (locale: string): AppLocale => toLocale(locale);

const findPublishedCourses = async (locale: AppLocale, user?: User) => {
  const payload = await getPayloadClient();

  const courses = await payload.find({
    collection: 'courses',
    depth: 1,
    fallbackLocale: getFallbackLocale(locale),
    limit: 100,
    locale,
    overrideAccess: false,
    sort: 'order',
    user,
    where: {
      status: {
        equals: 'published'
      }
    }
  });

  return courses.docs;
};

// Аноним — из кэша витрины (publicCache.ts); пользователь — из базы: доступ
// к курсам у него свой.
export const getPublishedCourses = (locale: AppLocale, user?: User) =>
  user
    ? findPublishedCourses(locale, user)
    : cachedPublic(`courses:${locale}`, () => findPublishedCourses(locale));

const findCourseBySlug = async (slug: string, locale: AppLocale, user: User) => {
  const payload = await getPayloadClient();

  const courses = await payload.find({
    collection: 'courses',
    depth: 1,
    fallbackLocale: getFallbackLocale(locale),
    limit: 1,
    locale,
    overrideAccess: false,
    user,
    where: {
      and: [
        {
          slug: {
            equals: slug
          }
        },
        {
          status: {
            equals: 'published'
          }
        }
      ]
    }
  });

  return courses.docs[0] || null;
};

// Аноним ищет в закэшированном списке опубликованных курсов: кэш по slug
// из адреса разрастался бы от любых выдуманных адресов.
export const getCourseBySlug = async (slug: string, locale: AppLocale, user?: User) =>
  user
    ? findCourseBySlug(slug, locale, user)
    : (await getPublishedCourses(locale)).find((course) => course.slug === slug) || null;

export const getCourseLessons = async (courseId: number, locale: AppLocale, user?: User) => {
  const payload = await getPayloadClient();

  const lessons = await payload.find({
    collection: 'lessons',
    depth: 1,
    fallbackLocale: getFallbackLocale(locale),
    limit: 100,
    locale,
    overrideAccess: false,
    sort: 'order',
    user,
    where: {
      course: {
        equals: courseId
      }
    }
  });

  return lessons.docs;
};

export type CourseCurriculumLesson = Pick<
  Lesson,
  'id' | 'order' | 'title' | 'durationSec' | 'isFreePreview'
>;

const findCourseCurriculum = async (
  courseId: number,
  locale: AppLocale,
  user?: User
): Promise<CourseCurriculumLesson[]> => {
  const payload = await getPayloadClient();

  const lessons = await payload.find({
    collection: 'lessons',
    depth: 0,
    fallbackLocale: getFallbackLocale(locale),
    limit: 100,
    locale,
    overrideAccess: false,
    select: {
      durationSec: true,
      isFreePreview: true,
      order: true,
      title: true
    },
    sort: 'order',
    user,
    where: {
      course: {
        equals: courseId
      }
    }
  });

  return lessons.docs;
};

export const getCourseCurriculum = (courseId: number, locale: AppLocale, user?: User) =>
  user
    ? findCourseCurriculum(courseId, locale, user)
    : cachedPublic(`curriculum:${courseId}:${locale}`, () =>
        findCourseCurriculum(courseId, locale)
      );

// Купленные курсы; админу — все опубликованные, как купленные.
export const getDashboardCourses = async (locale: AppLocale, user: User) => {
  const payload = await getPayloadClient();

  if (isAdminUser(user)) {
    return getPublishedCourses(locale, user);
  }

  const purchases = await payload.find({
    collection: 'purchases',
    depth: 0,
    limit: 100,
    overrideAccess: true,
    user,
    where: {
      and: [
        {
          user: {
            equals: user.id
          }
        },
        {
          status: {
            equals: 'paid'
          }
        }
      ]
    }
  });
  const courseIds = purchases.docs.flatMap(({ course }) =>
    typeof course === 'number' ? [course] : course ? [course.id] : []
  );

  if (courseIds.length === 0) {
    return [];
  }

  const courses = await payload.find({
    collection: 'courses',
    depth: 1,
    fallbackLocale: getFallbackLocale(locale),
    limit: 100,
    locale,
    overrideAccess: false,
    sort: 'order',
    user,
    where: {
      and: [
        {
          id: {
            in: courseIds
          }
        },
        {
          status: {
            equals: 'published'
          }
        }
      ]
    }
  });

  return courses.docs;
};

export const getLegalPage = async (slug: LegalPage['slug'], locale: AppLocale, user?: User) => {
  const payload = await getPayloadClient();

  const pages = await payload.find({
    collection: 'legalPages',
    depth: 0,
    fallbackLocale: getFallbackLocale(locale),
    limit: 1,
    locale,
    overrideAccess: false,
    user,
    where: {
      slug: {
        equals: slug
      }
    }
  });

  return pages.docs[0] || null;
};
