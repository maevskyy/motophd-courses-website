import type { LegalPage } from '@/payload-types';
import { getPayloadClient } from './payload';
import type { AppLocale } from './types';

export const toAppLocale = (locale: string): AppLocale => (locale === 'ru' ? 'ru' : 'en');

export const getPublishedCourses = async (locale: AppLocale) => {
  const payload = await getPayloadClient();

  const courses = await payload.find({
    collection: 'courses',
    depth: 1,
    fallbackLocale: 'en',
    limit: 100,
    locale,
    overrideAccess: false,
    sort: 'order',
    where: {
      status: {
        equals: 'published'
      }
    }
  });

  return courses.docs;
};

export const getCourseBySlug = async (slug: string, locale: AppLocale) => {
  const payload = await getPayloadClient();

  const courses = await payload.find({
    collection: 'courses',
    depth: 1,
    fallbackLocale: 'en',
    limit: 1,
    locale,
    overrideAccess: false,
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

export const getCourseLessons = async (courseId: number, locale: AppLocale) => {
  const payload = await getPayloadClient();

  const lessons = await payload.find({
    collection: 'lessons',
    depth: 1,
    fallbackLocale: 'en',
    limit: 100,
    locale,
    overrideAccess: false,
    sort: 'order',
    where: {
      course: {
        equals: courseId
      }
    }
  });

  return lessons.docs;
};

export const getDashboardCourses = getPublishedCourses;

export const getLegalPage = async (slug: LegalPage['slug'], locale: AppLocale) => {
  const payload = await getPayloadClient();

  const pages = await payload.find({
    collection: 'legalPages',
    depth: 0,
    fallbackLocale: 'en',
    limit: 1,
    locale,
    overrideAccess: false,
    where: {
      slug: {
        equals: slug
      }
    }
  });

  return pages.docs[0] || null;
};
