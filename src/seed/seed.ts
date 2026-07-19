import config from '@payload-config';
import { getPayload, type DefaultDocumentIDType } from 'payload';

import {
  getCommonMistakes,
  getCourseSeeds,
  getDurationSec,
  getFlatLessons,
  getKeyPoint,
  getLessonType,
  getOutcomes,
  getWhatYouShouldFeel,
  locales,
  toRichText
} from './contentSeedData';

const seedCourses = async () => {
  const payload = await getPayload({ config });
  const courseSeeds = getCourseSeeds();
  const flatLessons = getFlatLessons();

  try {
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

      for (const [lessonIndex, lesson] of flatLessons.entries()) {
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
          const data = {
            course: courseId,
            order,
            type: getLessonType(lesson),
            title: lesson.name,
            durationSec: getDurationSec(lesson.duration),
            streamVideoId:
              getLessonType(lesson) === 'video'
                ? `${localizedCourse.slug}-${locale}-lesson-${order}`
                : undefined,
            body: toRichText(`${lesson.moduleTitle}\n\n${lesson.name}`),
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

    payload.logger.info('Seed complete: courses and lessons are up to date.');
  } finally {
    await payload.destroy();
  }
};

await seedCourses();
