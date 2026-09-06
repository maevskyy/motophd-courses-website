import { getPayloadClient } from './payload';

// Только slug и updatedAt: sitemap строится по обеим локалям сразу, а slug
// не локализован, поэтому локаль запросу не нужна. Опубликованность —
// status === 'published' (те же правила, что у каталога и страницы курса).
export const getSitemapCourses = async () => {
  const payload = await getPayloadClient();

  const courses = await payload.find({
    collection: 'courses',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    select: {
      slug: true,
      updatedAt: true
    },
    sort: 'order',
    where: {
      status: {
        equals: 'published'
      }
    }
  });

  return courses.docs;
};

export const getSitemapLegalPages = async () => {
  const payload = await getPayloadClient();

  const pages = await payload.find({
    collection: 'legalPages',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    select: {
      slug: true,
      updatedAt: true
    },
    sort: 'createdAt'
  });

  return pages.docs;
};
