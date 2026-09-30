import type { Access, CollectionBeforeChangeHook, CollectionConfig, FieldAccess } from 'payload';

import { hasPaidAccess, isAdminUser } from '@/lib/access/hasPaidAccess';
import type { Lesson } from '@/payload-types';

const contentAccessByRequest = new WeakMap<object, Map<number, Promise<boolean>>>();

const getCourseId = (course: Lesson['course']) => (typeof course === 'number' ? course : course.id);

export const canReadLessonContent: FieldAccess<Lesson> = async ({ doc, req }) => {
  if (isAdminUser(req.user) || doc?.isFreePreview) {
    return true;
  }

  const courseId = doc?.course && getCourseId(doc.course);

  if (!req.user || !courseId) {
    return false;
  }

  let courseAccess = contentAccessByRequest.get(req);

  if (!courseAccess) {
    courseAccess = new Map();
    contentAccessByRequest.set(req, courseAccess);
  }

  let canRead = courseAccess.get(courseId);

  if (!canRead) {
    canRead = hasPaidAccess(req.payload, req.user, courseId);
    courseAccess.set(courseId, canRead);
  }

  return canRead;
};

const canReadLessons: Access = async ({ id, req }) => {
  if (isAdminUser(req.user)) {
    return true;
  }

  if (id && req.user) {
    const lesson = await req.payload.findByID({
      collection: 'lessons',
      depth: 0,
      id,
      overrideAccess: true
    });

    if (await hasPaidAccess(req.payload, req.user, lesson.course)) {
      return true;
    }
  }

  return {
    'course.status': {
      equals: 'published'
    }
  };
};

const relationId = (value: Lesson['video'] | undefined) =>
  typeof value === 'object' && value ? value.id : value;

// Урок выбирает видео из раздела «Видео», а плеер и доступы читают
// streamVideoId. Копируем ID Stream при сохранении того языка, что сохраняют.
// video не пришёл (частичный PATCH через API) — streamVideoId не трогаем.
// Пустое video стирает ID, только если видео сняли: ID, записанный напрямую
// через API или сидом, без выбранного видео сохранение не теряет.
export const syncStreamVideoId: CollectionBeforeChangeHook<Lesson> = async ({
  data,
  originalDoc,
  req
}) => {
  if (data.video === undefined) {
    return data;
  }

  const videoId = relationId(data.video);

  if (!videoId) {
    return relationId(originalDoc?.video) ? { ...data, streamVideoId: null } : data;
  }

  const video = await req.payload.findByID({
    collection: 'videos',
    depth: 0,
    id: videoId,
    overrideAccess: true,
    req
  });

  return { ...data, streamVideoId: video.streamUid };
};

export const Lessons: CollectionConfig = {
  slug: 'lessons',
  labels: {
    singular: {
      en: 'Lesson',
      ru: 'Урок'
    },
    plural: {
      en: 'Lessons',
      ru: 'Уроки'
    }
  },
  admin: {
    defaultColumns: ['title', 'course', 'order', 'isFreePreview'],
    useAsTitle: 'title'
  },
  hooks: {
    beforeChange: [syncStreamVideoId]
  },
  access: {
    create: ({ req: { user } }) => isAdminUser(user),
    delete: ({ req: { user } }) => isAdminUser(user),
    read: canReadLessons,
    update: ({ req: { user } }) => isAdminUser(user)
  },
  fields: [
    {
      name: 'course',
      type: 'relationship',
      index: true,
      relationTo: 'courses',
      required: true,
      label: {
        en: 'Course',
        ru: 'Курс'
      }
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      index: true,
      label: {
        en: 'Order',
        ru: 'Порядок'
      }
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      label: {
        en: 'Title',
        ru: 'Название'
      }
    },
    {
      name: 'durationSec',
      type: 'number',
      min: 0,
      label: {
        en: 'Duration, sec',
        ru: 'Длительность, сек'
      }
    },
    {
      name: 'video',
      type: 'relationship',
      localized: true,
      relationTo: 'videos',
      access: {
        read: canReadLessonContent
      },
      label: {
        en: 'Video',
        ru: 'Видео'
      },
      admin: {
        description: {
          en: 'Pick from Videos, or press + to upload a new one. Empty — the lesson has no video.',
          ru: 'Выберите из раздела «Видео» или нажмите +, чтобы загрузить новое. Пусто — урок без видео.'
        }
      }
    },
    // Плеер и доступы читают ID отсюда. Руками не заполняется: хук
    // syncStreamVideoId копирует его из выбранного видео при сохранении.
    {
      name: 'streamVideoId',
      type: 'text',
      localized: true,
      access: {
        read: canReadLessonContent
      },
      admin: {
        hidden: true
      },
      label: {
        en: 'Stream video ID',
        ru: 'ID Stream-видео'
      }
    },
    // Обложка показывается в плеере до нажатия play вместо случайного кадра
    // из Stream. Без access-ограничения: картинка не контент курса, а Stream
    // грузит её из своего iframe без куки сайта — приватной она быть не может.
    {
      name: 'cover',
      type: 'upload',
      localized: true,
      relationTo: 'media',
      label: {
        en: 'Cover (shown before play)',
        ru: 'Обложка (до нажатия play)'
      }
    },
    {
      name: 'pdf',
      type: 'upload',
      localized: true,
      relationTo: 'media',
      access: {
        read: canReadLessonContent
      },
      label: {
        en: 'PDF',
        ru: 'PDF'
      }
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      access: {
        read: canReadLessonContent
      },
      label: {
        en: 'Body',
        ru: 'Текст урока'
      }
    },
    {
      name: 'isFreePreview',
      type: 'checkbox',
      defaultValue: false,
      label: {
        en: 'Free preview',
        ru: 'Бесплатный тизер'
      }
    }
  ]
};
