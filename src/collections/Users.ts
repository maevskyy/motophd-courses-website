import type { CollectionConfig, PayloadRequest } from 'payload';

const canAccessAdmin = ({ req: { user } }: { req: PayloadRequest }) => user?.role === 'admin';

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  labels: {
    singular: {
      en: 'User',
      ru: 'Пользователь'
    },
    plural: {
      en: 'Users',
      ru: 'Пользователи'
    }
  },
  admin: {
    defaultColumns: ['email', 'role', 'createdAt'],
    useAsTitle: 'email'
  },
  access: {
    admin: canAccessAdmin
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') {
          return data;
        }

        const usersCount = await req.payload.count({
          collection: 'users'
        });

        if (usersCount.totalDocs === 0) {
          return {
            ...data,
            role: 'admin'
          };
        }

        return data;
      }
    ]
  },
  fields: [
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'student',
      label: {
        en: 'Role',
        ru: 'Роль'
      },
      options: [
        {
          label: {
            en: 'Student',
            ru: 'Студент'
          },
          value: 'student'
        },
        {
          label: {
            en: 'Admin',
            ru: 'Админ'
          },
          value: 'admin'
        }
      ]
    }
  ]
};
