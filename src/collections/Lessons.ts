import type { Access, CollectionConfig } from 'payload';

import { hasPaidAccess, isAdminUser } from '@/lib/access/hasPaidAccess';

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
    defaultColumns: ['title', 'course', 'type', 'order', 'isFreePreview'],
    useAsTitle: 'title'
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
      name: 'type',
      type: 'select',
      defaultValue: 'video',
      options: [
        {
          label: {
            en: 'Video',
            ru: 'Видео'
          },
          value: 'video'
        },
        {
          label: {
            en: 'PDF',
            ru: 'PDF'
          },
          value: 'pdf'
        },
        {
          label: {
            en: 'Text',
            ru: 'Текст'
          },
          value: 'text'
        }
      ],
      required: true,
      label: {
        en: 'Type',
        ru: 'Тип'
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
      name: 'streamVideoId',
      type: 'text',
      localized: true,
      label: {
        en: 'Stream video ID',
        ru: 'ID Stream-видео'
      }
    },
    {
      name: 'pdf',
      type: 'upload',
      localized: true,
      relationTo: 'media',
      label: {
        en: 'PDF',
        ru: 'PDF'
      }
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
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
