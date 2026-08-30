import type { CollectionConfig, PayloadRequest } from 'payload';

const canAccessAdmin = ({ req: { user } }: { req: PayloadRequest }) => user?.role === 'admin';

// Payload при неуказанном access пускает любого залогиненного, поэтому каждая
// операция объявлена явно: без этого студент менял себе role и чужие пароли.
const isAdmin = ({ req: { user } }: { req: PayloadRequest }) => user?.role === 'admin';

const isAdminOrSelf = ({ req: { user } }: { req: PayloadRequest }) => {
  if (!user) {
    return false;
  }

  if (user.role === 'admin') {
    return true;
  }

  return {
    id: {
      equals: user.id
    }
  };
};

// Первый пользователь создаётся через форму Payload на пустой базе (её же
// подхватывает beforeChange ниже) — до этого момента админа не существует.
const isAdminOrFirstUser = async ({ req }: { req: PayloadRequest }) => {
  if (req.user?.role === 'admin') {
    return true;
  }

  const { totalDocs } = await req.payload.count({ collection: 'users' });

  return totalDocs === 0;
};

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
    admin: canAccessAdmin,
    create: isAdminOrFirstUser,
    delete: isAdmin,
    read: isAdminOrSelf,
    unlock: isAdmin,
    update: isAdminOrSelf
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
      name: 'name',
      type: 'text',
      maxLength: 120,
      label: {
        en: 'Name',
        ru: 'Имя'
      }
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'student',
      // Без field-level access самообновление профиля позволяет выставить себе admin.
      access: {
        create: isAdmin,
        update: isAdmin
      },
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
