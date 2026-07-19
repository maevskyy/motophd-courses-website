import type { CollectionConfig } from 'payload';

import { isAdminUser } from '@/lib/access/hasPaidAccess';

export const Media: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: {
      en: 'Media',
      ru: 'Медиа'
    },
    plural: {
      en: 'Media',
      ru: 'Медиа'
    }
  },
  admin: {
    defaultColumns: ['filename', 'alt', 'mimeType', 'createdAt']
  },
  access: {
    create: ({ req: { user } }) => isAdminUser(user),
    delete: ({ req: { user } }) => isAdminUser(user),
    read: () => true,
    update: ({ req: { user } }) => isAdminUser(user)
  },
  upload: {
    displayPreview: true,
    filesRequiredOnCreate: false,
    mimeTypes: ['image/*', 'application/pdf'],
    staticDir: 'media'
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      label: {
        en: 'Alt text',
        ru: 'Alt-текст'
      }
    }
  ]
};
