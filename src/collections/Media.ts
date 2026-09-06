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
    read: ({ req: { user } }) => {
      if (isAdminUser(user)) {
        return true;
      }

      // Allowlist, а не «всё кроме PDF»: при denylist любой файл с другим
      // mimeType (пустой, application/x-pdf, будущий docx) становился публичным.
      return {
        mimeType: {
          like: 'image/'
        }
      };
    },
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
    },
    // Колонка media.prefix живёт в проде (миграция 20260819_202728) и хранит
    // R2-префикс каждого файла. Обычно её объявляет s3Storage, но плагин
    // включается только при R2-env: без него поле пропадало из схемы, и
    // `migrate:create` предлагал DROP COLUMN "prefix" (MOT-37). Объявляем поле
    // сами — плагин находит его по имени и дополняет своими hooks/defaultValue.
    {
      name: 'prefix',
      type: 'text',
      defaultValue: '',
      admin: {
        hidden: true,
        readOnly: true
      }
    }
  ]
};
