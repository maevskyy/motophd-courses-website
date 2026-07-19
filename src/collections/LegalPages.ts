import type { CollectionConfig } from 'payload';

import { isAdminUser } from '@/lib/access/hasPaidAccess';

export const LegalPages: CollectionConfig = {
  slug: 'legalPages',
  labels: {
    singular: {
      en: 'Legal page',
      ru: 'Юр. страница'
    },
    plural: {
      en: 'Legal pages',
      ru: 'Юр. страницы'
    }
  },
  admin: {
    defaultColumns: ['slug', 'title', 'updatedAt'],
    useAsTitle: 'title'
  },
  access: {
    create: ({ req: { user } }) => isAdminUser(user),
    delete: ({ req: { user } }) => isAdminUser(user),
    read: () => true,
    update: ({ req: { user } }) => isAdminUser(user)
  },
  fields: [
    {
      name: 'slug',
      type: 'select',
      index: true,
      options: ['privacy', 'terms', 'refund', 'contact'],
      required: true,
      unique: true,
      label: {
        en: 'Slug',
        ru: 'URL-ключ'
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
      name: 'body',
      type: 'richText',
      localized: true,
      label: {
        en: 'Body',
        ru: 'Текст'
      }
    }
  ]
};
