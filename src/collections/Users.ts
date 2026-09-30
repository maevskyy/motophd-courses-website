import {
  APIError,
  type CollectionBeforeDeleteHook,
  type CollectionConfig,
  type PayloadRequest
} from 'payload';

import { keepOnlyCurrentSession } from '@/lib/auth/singleSession';

// purchases.user обязателен, и база не даёт удалить пользователя с покупками —
// админка показывала «An unknown error has occurred». Говорим, в чём дело.
// Покупки сами не удаляем: это история платежей.
export const refuseDeletingBuyer: CollectionBeforeDeleteHook = async ({ id, req }) => {
  const purchases = await req.payload.find({
    collection: 'purchases',
    depth: 0,
    limit: 20,
    overrideAccess: true,
    req,
    where: { user: { equals: id } }
  });

  if (purchases.totalDocs > 0) {
    const numbers = purchases.docs.map((purchase) => `#${purchase.id}`).join(', ');

    throw new APIError(
      `У пользователя есть покупки (${numbers}). Сначала удалите их в разделе Purchases, потом пользователя.`,
      400,
      undefined,
      true
    );
  }
};

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
    // Одна активная сессия: вход с компа выбивает телефон (см. singleSession.ts).
    afterLogin: [keepOnlyCurrentSession],
    beforeDelete: [refuseDeletingBuyer],
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
  /*
    Штатный локаут Payload (пять промахов — десять минут) не виден ни в API, ни
    в админке: loginAttempts и lockUntil помечены hidden. Ручка отдаёт их
    админу — и карточке пользователя, и снаружи, чтобы «почему человек не
    входит» выяснялось запросом к сайту, а не SQL-запросом на сервере (MOT-95).
  */
  endpoints: [
    {
      handler: async (req) => {
        if (req.user?.role !== 'admin') {
          return Response.json({ errors: [{ message: 'Forbidden' }] }, { status: 403 });
        }

        const id = req.routeParams?.id;

        if (typeof id !== 'string' && typeof id !== 'number') {
          return Response.json({ errors: [{ message: 'Not found' }] }, { status: 404 });
        }

        const user = await req.payload.findByID({
          collection: 'users',
          id,
          showHiddenFields: true
        });

        return Response.json({
          email: user.email,
          lockUntil: user.lockUntil ?? null,
          loginAttempts: user.loginAttempts ?? 0
        });
      },
      method: 'get',
      path: '/:id/lock-state'
    }
  ],
  fields: [
    {
      name: 'lockState',
      type: 'ui',
      admin: {
        components: {
          Field: '/components/admin/UserLockState#UserLockState'
        }
      },
      label: {
        en: 'Sign-in lock',
        ru: 'Блокировка входа'
      }
    },
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
