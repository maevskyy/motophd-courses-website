import type { CollectionConfig } from 'payload';

import { isAdminUser } from '@/lib/access/hasPaidAccess';
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
