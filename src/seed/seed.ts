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

// Payload требует у PDF заголовок, xref-таблицу и %%EOF (utilities/validatePDF).
// Смещения в xref соответствуют этой строке — менять её только вместе с ними.
const fixturePdf = Buffer.from(
  '%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Count 0 /Kids [] >>\nendobj\nxref\n0 3\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \ntrailer\n<< /Size 3 /Root 1 0 R >>\nstartxref\n110\n%%EOF\n'
);

const seedFixturePdf = async (payload: Payload, lessonId: DefaultDocumentIDType) => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  const existing = await payload.find({
    collection: 'media',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      filename: {
        equals: 'motophd-fixture.pdf'
      }
    }
  });
  const pdf =
    existing.docs[0] ||
    (await payload.create({
      collection: 'media',
      data: {
        alt: 'MotoPhD fixture PDF'
      },
      file: {
        data: fixturePdf,
        mimetype: 'application/pdf',
        name: 'motophd-fixture.pdf',
        size: fixturePdf.length
      },
      overrideAccess: true
    }));

  // Последовательно: параллельные update одного документа по разным локалям
  // затирают друг друга, и PDF оставался привязанным только к одной из них.
  for (const locale of locales) {
    await payload.update({
      collection: 'lessons',
      data: { pdf: pdf.id },
      id: lessonId,
      locale,
      overrideAccess: true
    });
  }
};

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

// Users.access.create разрешён только админу (и самому первому пользователю),
// поэтому на чистой локальной базе админа иначе взять негде.
const seedAdminUser = async (payload: Payload) => {
  const admins = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { role: { equals: 'admin' } }
  });

  if (admins.docs[0]) {
    return;
  }

  const existing = await payload.find({
    collection: 'users',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { email: { equals: 'admin@motophd.com' } }
  });

  const data = { email: 'admin@motophd.com', password: 'admin1234', role: 'admin' as const };

  if (existing.docs[0]) {
    await payload.update({ collection: 'users', data, id: existing.docs[0].id, overrideAccess: true });
    return;
  }

  await payload.create({ collection: 'users', data, overrideAccess: true });
};

const upsertPurchase = async (
  payload: Payload,
  {
    course,
    providerTxnId,
    tier,
    user
  }: {
    course: DefaultDocumentIDType;
    providerTxnId: string;
    tier: 'feedback' | 'standard';
    user: DefaultDocumentIDType;
  }
) => {
  const existing = await payload.find({
    collection: 'purchases',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [{ user: { equals: user } }, { course: { equals: course } }]
    }
  });

  const purchase = {
    amount: 0,
    course,
    currency: 'EUR' as const,
    provider: 'manual' as const,
    providerTxnId,
    status: 'paid' as const,
    tier,
    user
  };

  if (existing.docs[0]) {
    await payload.update({
      collection: 'purchases',
      data: purchase,
      id: existing.docs[0].id,
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

const seedDemoAccounts = async (payload: Payload, firstCourseId: DefaultDocumentIDType) => {
  if (process.env.NODE_ENV === 'production') {
    return;
  }

  await seedAdminUser(payload);

  const student = await upsertDemoUser(payload, 'student@motophd.com', 'student1234');
  const guest = await upsertDemoUser(payload, 'guest@motophd.com', 'guest1234');

  // Отдельные аккаунты для e2e rate-limit: у локаута и счётчиков свои
  // жертвы, чтобы не запирать student/guest для остальных тестов.
  await upsertDemoUser(payload, 'lockout@motophd.com', 'lockout1234');
  await upsertDemoUser(payload, 'ratelimit@motophd.com', 'ratelimit1234');

  // Смена пароля в e2e гоняется на своём аккаунте: сид возвращает пароль
  // на место, даже если прогон упал посередине.
  await upsertDemoUser(payload, 'passwd@motophd.com', 'passwd1234');

  // Покупатель feedback-тарифа — для гейта страницы /feedback.
  const feedbackStudent = await upsertDemoUser(payload, 'feedback@motophd.com', 'feedback1234');

  await upsertPurchase(payload, {
    course: firstCourseId,
    providerTxnId: 'seed-feedback-first-course',
    tier: 'feedback',
    user: feedbackStudent.id
  });

  await payload.delete({
    collection: 'purchases',
    overrideAccess: true,
    where: {
      user: {
        equals: guest.id
      }
    }
  });

  await upsertPurchase(payload, {
    course: firstCourseId,
    providerTxnId: 'seed-student-first-course',
    tier: 'standard',
    user: student.id
  });
};

const seedCourses = async () => {
  const payload = await getPayload({ config });
  const courseSeeds = getCourseSeeds();

  try {
    let firstCourseId: DefaultDocumentIDType | undefined;
    let firstPdfLessonId: DefaultDocumentIDType | undefined;
    // Второй PDF — на платном уроке: без него e2e не может проверить отказ
    // непокупателю, у тизера доступ открыт всем.
    let firstPaidPdfLessonId: DefaultDocumentIDType | undefined;

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
          priceStandard: 49,
          priceFeedback: 149,
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

        if (courseIndex === 0 && getLessonType(lesson) === 'pdf') {
          if (!firstPdfLessonId) {
            firstPdfLessonId = lessonId;
          }

          // isFreePreview выставляется выше как order === 1.
          if (order !== 1 && !firstPaidPdfLessonId) {
            firstPaidPdfLessonId = lessonId;
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

    for (const lessonId of [firstPdfLessonId, firstPaidPdfLessonId]) {
      if (lessonId) {
        await seedFixturePdf(payload, lessonId);
      }
    }

    payload.logger.info('Seed complete: courses, lessons, legal pages, and demo accounts are up to date.');
  } finally {
    await payload.destroy();
  }
};

await seedCourses();
