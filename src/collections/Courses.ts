import type { CollectionConfig } from 'payload';

import { isAdminUser } from '@/lib/access/hasPaidAccess';

const label = (en: string, ru: string) => ({ en, ru });

export const Courses: CollectionConfig = {
  slug: 'courses',
  labels: {
    singular: label('Course', 'Курс'),
    plural: label('Courses', 'Курсы')
  },
  admin: {
    defaultColumns: ['title', 'slug', 'status', 'order'],
    useAsTitle: 'title'
  },
  access: {
    create: ({ req: { user } }) => isAdminUser(user),
    delete: ({ req: { user } }) => isAdminUser(user),
    read: ({ req: { user } }) =>
      isAdminUser(user)
        ? true
        : {
            status: {
              equals: 'published'
            }
          },
    update: ({ req: { user } }) => isAdminUser(user)
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      index: true,
      required: true,
      unique: true,
      label: label('Slug', 'URL-ключ')
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      label: label('Title', 'Название')
    },
    {
      name: 'pain',
      type: 'text',
      localized: true,
      label: label('Pain', 'Боль')
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: label('Description', 'Описание')
    },
    {
      name: 'cover',
      type: 'upload',
      localized: true,
      relationTo: 'media',
      label: label('Cover', 'Обложка')
    },
    {
      name: 'priceStandard',
      type: 'number',
      defaultValue: 29,
      min: 0,
      required: true,
      label: label('Standard price', 'Цена стандарт')
    },
    {
      name: 'priceFeedback',
      type: 'number',
      defaultValue: 129,
      min: 0,
      required: true,
      label: label('Feedback price', 'Цена с разбором')
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'EUR',
      options: ['EUR'],
      required: true,
      label: label('Currency', 'Валюта')
    },
    {
      name: 'outcomes',
      type: 'array',
      localized: true,
      label: label('Outcomes', 'Результаты'),
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
          label: label('Text', 'Текст')
        }
      ]
    },
    {
      name: 'keyPoint',
      type: 'textarea',
      localized: true,
      label: label('Key point', 'Ключевой поинт')
    },
    {
      name: 'commonMistakes',
      type: 'textarea',
      localized: true,
      label: label('Common mistakes', 'Частые ошибки')
    },
    {
      name: 'whatYouShouldFeel',
      type: 'textarea',
      localized: true,
      label: label('What you should feel', 'Что нужно почувствовать')
    },
    {
      name: 'teaserVideoId',
      type: 'text',
      localized: true,
      label: label('Teaser video ID', 'ID тизер-видео')
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      index: true,
      label: label('Order', 'Порядок')
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      options: [
        {
          label: label('Draft', 'Черновик'),
          value: 'draft'
        },
        {
          label: label('Published', 'Опубликован'),
          value: 'published'
        }
      ],
      required: true,
      label: label('Status', 'Статус')
    }
  ]
};
