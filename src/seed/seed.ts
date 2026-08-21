import config from '@payload-config';
import { getPayload, type DefaultDocumentIDType, type Payload } from 'payload';

import {
  getCommonMistakes,
  getCourseSeeds,
  getDurationSec,
  getFlatLessons,
  getKeyPoint,
  getLessonType,
  getOutcomes,
  getWhatYouShouldFeel,
  legalPageSeeds,
  locales,
  toRichText
} from './contentSeedData';

const upsertDemoUser = async (payload: Payload, email: string, password: string) => {
  const existing = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      email: {
        equals: email
      }
    }
  });

  const data = { email, password, role: 'student' as const };
  const user = existing.docs[0]
    ? await payload.update({
        collection: 'users',
        data,
        id: existing.docs[0].id,
        overrideAccess: true
      })
    : await payload.create({
        collection: 'users',
        data,
        overrideAccess: true
      });

  if (user.role === 'student') {
    return user;
  }

  return payload.update({
    collection: 'users',
    data: { role: 'student' },
    id: user.id,
    overrideAccess: true
  });
};

const seedDemoAccounts = async (payload: Payload, firstCourseId: DefaultDocumentIDType) => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const student = await upsertDemoUser(payload, 'student@motophd.com', 'student1234');
  const guest = await upsertDemoUser(payload, 'guest@motophd.com', 'guest1234');

  await payload.delete({
    collection: 'purchases',
    overrideAccess: true,
    where: {
      user: {
        equals: guest.id
      }
    }
  });

  const existingPurchase = await payload.find({
    collection: 'purchases',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        {
          user: {
            equals: student.id
          }
        },
        {
          course: {
            equals: firstCourseId
          }
        }
      ]
    }
  });

  const purchase = {
    amount: 0,
    course: firstCourseId,
    currency: 'EUR' as const,
    provider: 'manual' as const,
    providerTxnId: 'seed-student-first-course',
    status: 'paid' as const,
    tier: 'standard' as const,
    user: student.id
  };

  if (existingPurchase.docs[0]) {
    await payload.update({
      collection: 'purchases',
      data: purchase,
      id: existingPurchase.docs[0].id,
      overrideAccess: true
    });
  } else {
    await payload.create({
      collection: 'purchases',
      data: purchase,
      overrideAccess: true
    });
  }
};

const seedCourses = async () => {
  const payload = await getPayload({ config });
  const courseSeeds = getCourseSeeds();

  try {
    let firstCourseId: DefaultDocumentIDType | undefined;

    for (const [courseIndex, courseSeed] of courseSeeds.entries()) {
      let courseId: DefaultDocumentIDType | undefined;

      for (const locale of locales) {
        const course = courseSeed[locale];
        const existing = await payload.find({
          collection: 'courses',
          depth: 0,
          limit: 1,
          locale,
          overrideAccess: true,
          where: {
            slug: {
              equals: course.slug
            }
          }
        });

        const data = {
          slug: course.slug,
          title: course.title,
          pain: course.pain,
          description: course.description,
          priceStandard: 29,
          priceFeedback: 129,
          currency: 'EUR' as const,
          outcomes: getOutcomes(course, locale),
          keyPoint: getKeyPoint(course),
          commonMistakes: getCommonMistakes(course),
          whatYouShouldFeel: getWhatYouShouldFeel(course),
          teaserVideoId: `${course.slug}-${locale}-teaser`,
          order: courseIndex + 1,
          status: 'published' as const
        };

        const currentCourseId = existing.docs[0]?.id;

        if (currentCourseId) {
          await payload.update({
            collection: 'courses',
            data,
            id: currentCourseId,
            locale,
            overrideAccess: true
          });
          courseId = currentCourseId;
        } else {
          const created = await payload.create({
            collection: 'courses',
            data,
            locale,
            overrideAccess: true
          });
          courseId = created.id;
        }
      }

      if (!courseId) {
        throw new Error(`Could not upsert course "${courseSeed.en.slug}"`);
      }

      if (courseIndex === 0) {
        firstCourseId = courseId;
      }

      const flatLessonsByLocale = {
        en: getFlatLessons(courseSeed.en.slug, 'en'),
        ru: getFlatLessons(courseSeed.ru.slug, 'ru')
      };
      const canonicalLessons = flatLessonsByLocale.en;

      for (const [lessonIndex, lesson] of canonicalLessons.entries()) {
        const order = lessonIndex + 1;
        const existingLesson = await payload.find({
          collection: 'lessons',
          depth: 0,
          limit: 1,
          locale: 'en',
          overrideAccess: true,
          where: {
            and: [
              {
                course: {
                  equals: courseId
                }
              },
              {
                order: {
                  equals: order
                }
              }
            ]
          }
        });

        let lessonId = existingLesson.docs[0]?.id;

        for (const locale of locales) {
          const localizedCourse = courseSeed[locale];
          const localizedLesson = flatLessonsByLocale[locale][lessonIndex];
          const data = {
            course: courseId,
            order,
            type: getLessonType(lesson),
            title: localizedLesson.name,
            durationSec: getDurationSec(lesson.duration),
            streamVideoId:
              getLessonType(lesson) === 'video'
                ? `${localizedCourse.slug}-${locale}-lesson-${order}`
                : undefined,
            body: toRichText(`${localizedLesson.moduleTitle}\n\n${localizedLesson.name}`),
            isFreePreview: order === 1
          };

          if (lessonId) {
            await payload.update({
              collection: 'lessons',
              data,
              id: lessonId,
              locale,
              overrideAccess: true
            });
          } else if (locale === 'en') {
            const createdLesson = await payload.create({
              collection: 'lessons',
              data,
              locale,
              overrideAccess: true
            });

            lessonId = createdLesson.id;
          }
        }
      }
    }

    for (const legalPage of legalPageSeeds) {
      for (const locale of locales) {
        const existing = await payload.find({
          collection: 'legalPages',
          depth: 0,
          limit: 1,
          locale,
          overrideAccess: true,
          where: {
            slug: {
              equals: legalPage.slug
            }
          }
        });

        const data = {
          slug: legalPage.slug,
          title: legalPage[locale].title,
          body: toRichText(legalPage[locale].body)
        };

        if (existing.docs[0]) {
          await payload.update({
            collection: 'legalPages',
            data,
            id: existing.docs[0].id,
            locale,
            overrideAccess: true
          });
        } else {
          await payload.create({
            collection: 'legalPages',
            data,
            locale,
            overrideAccess: true
          });
        }
      }
    }

    if (!firstCourseId) {
      throw new Error('Could not seed the first course for the demo student');
    }

    await seedDemoAccounts(payload, firstCourseId);

    payload.logger.info('Seed complete: courses, lessons, legal pages, and demo accounts are up to date.');
  } finally {
    await payload.destroy();
  }
};

await seedCourses();
