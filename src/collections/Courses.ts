import type { CollectionConfig } from 'payload';

import { isAdminUser } from '@/lib/access/hasPaidAccess';
import { clearPublicCacheHook } from '@/lib/data/publicCache';
import { countryOptions } from '@/lib/pricing/countries';

const label = (en: string, ru: string) => ({ en, ru });

type RegionalPriceRow = { countries?: null | string[] };

// Страна в двух строках — непонятно, какая цена её: запрещаем сразу при
// сохранении, а не выясняем на оплате.
export const oneRowPerCountry = (rows: unknown) => {
  const seen = new Map<string, number>();

  for (const [index, row] of ((rows as RegionalPriceRow[] | null) ?? []).entries()) {
    for (const country of row?.countries ?? []) {
      const first = seen.get(country);

      if (first !== undefined) {
        return `${country} is listed in rows ${first + 1} and ${index + 1}. Keep each country in one row.`;
      }

      seen.set(country, index);
    }
  }

  return true;
};

export const higherThanStandard = (value: unknown, { siblingData }: { siblingData: unknown }) => {
  const standard = (siblingData as { priceStandard?: number } | undefined)?.priceStandard;

  return typeof value === 'number' && typeof standard === 'number' && value <= standard
    ? 'Course + feedback must cost more than course only.'
    : true;
};

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
  // Витрина читает курсы из кэша в памяти — сбрасываем при правке.
  hooks: {
    afterChange: [clearPublicCacheHook],
    afterDelete: [clearPublicCacheHook]
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
      label: label('Slug', 'URL-ключ'),
      admin: {
        description: label(
          'Course address: motophd.com/en/courses/slug. Latin letters, digits and dashes.',
          'Адрес курса: motophd.com/en/courses/slug. Латиница, цифры и дефисы.'
        )
      }
    },
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
      label: label('Title', 'Название')
    },
    // name остался от первой версии («боль ученика»): переименование поля —
    // миграция данных ради одного слова. Для админа это Tagline.
    {
      name: 'pain',
      type: 'text',
      localized: true,
      label: label('Tagline', 'Подзаголовок'),
      admin: {
        description: label(
          'Short line above the title on the course page and on the course card, e.g. “Fear → Confidence”.',
          'Короткая строка над названием на странице курса и в карточке, например «Страх → Уверенность».'
        )
      }
    },
    {
      name: 'description',
      type: 'textarea',
      localized: true,
      label: label('Description', 'Описание'),
      admin: {
        description: label(
          'Text under the title on the course page and on the course card.',
          'Текст под названием на странице курса и в карточке.'
        )
      }
    },
    {
      name: 'outcomes',
      type: 'array',
      localized: true,
      label: label('What you’ll learn', 'Чему научитесь'),
      labels: {
        singular: label('Point', 'Пункт'),
        plural: label('Points', 'Пункты')
      },
      admin: {
        description: label(
          'Checkmark list on the course page and on the course card. 3–5 short points.',
          'Список с галочками на странице курса и в карточке. 3–5 коротких пунктов.'
        )
      },
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
      name: 'cover',
      type: 'upload',
      localized: true,
      relationTo: 'media',
      label: label('Cover', 'Обложка'),
      admin: {
        description: label(
          'Photo on the course card. Also shown when someone shares the course link. Landscape, about 1200×630.',
          'Фото на карточке курса. Его же показывают мессенджеры, когда делятся ссылкой на курс. Горизонтальное, около 1200×630.'
        )
      }
    },
    {
      name: 'priceStandard',
      type: 'number',
      defaultValue: 29,
      min: 0,
      required: true,
      label: label('Course only, € — default', 'Только курс, € — по умолчанию')
    },
    {
      name: 'priceFeedback',
      type: 'number',
      defaultValue: 129,
      min: 0,
      required: true,
      label: label('Course + feedback, € — default', 'Курс + обратная связь, € — по умолчанию')
    },
    {
      name: 'regionalPrices',
      type: 'array',
      label: label('Regional prices', 'Цены по регионам'),
      labels: {
        singular: label('Region', 'Регион'),
        plural: label('Regions', 'Регионы')
      },
      validate: oneRowPerCountry,
      admin: {
        description: label(
          'Visitors from these countries see and pay these prices. Everyone else gets the prices above.',
          'Посетители из этих стран видят и платят эти цены. Все остальные — цены выше.'
        ),
        components: {
          RowLabel: '/components/admin/RegionalPriceRowLabel#RegionalPriceRowLabel'
        }
      },
      fields: [
        {
          name: 'countries',
          type: 'select',
          hasMany: true,
          options: countryOptions,
          required: true,
          label: label('Countries', 'Страны')
        },
        {
          type: 'row',
          fields: [
            {
              name: 'priceStandard',
              type: 'number',
              min: 1,
              required: true,
              label: label('Course only, €', 'Только курс, €')
            },
            {
              name: 'priceFeedback',
              type: 'number',
              min: 1,
              required: true,
              validate: higherThanStandard,
              label: label('Course + feedback, €', 'Курс + обратная связь, €')
            }
          ]
        }
      ]
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      index: true,
      label: label('Order', 'Порядок'),
      admin: {
        description: label(
          'Position in the course list: smaller goes first.',
          'Место в списке курсов: меньше — выше.'
        ),
        position: 'sidebar'
      }
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'draft',
      index: true,
      admin: {
        description: label(
          'Draft — visible only in the admin.',
          'Черновик виден только в админке.'
        ),
        position: 'sidebar'
      },
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
