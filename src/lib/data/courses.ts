import type { LegalPage, User } from '@/payload-types';
import { getPayloadClient } from './payload';
import type { AppLocale } from './types';

export const toAppLocale = (locale: string): AppLocale => (locale === 'ru' ? 'ru' : 'en');

export const getPublishedCourses = async (locale: AppLocale, user?: User) => {
  const payload = await getPayloadClient();

  const courses = await payload.find({
    collection: 'courses',
    depth: 1,
    fallbackLocale: 'en',
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

export const getCourseBySlug = async (slug: string, locale: AppLocale, user?: User) => {
  const payload = await getPayloadClient();

  const courses = await payload.find({
    collection: 'courses',
    depth: 1,
    fallbackLocale: 'en',
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

export const getCourseLessons = async (courseId: number, locale: AppLocale, user?: User) => {
  const payload = await getPayloadClient();

  const lessons = await payload.find({
    collection: 'lessons',
    depth: 1,
    fallbackLocale: 'en',
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

export const getDashboardCourses = async (locale: AppLocale, user: User) => {
  const payload = await getPayloadClient();
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
    fallbackLocale: 'en',
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
    fallbackLocale: 'en',
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
