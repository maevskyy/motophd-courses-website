import type { CollectionConfig } from 'payload';

import { isAdminUser } from '@/lib/access/hasPaidAccess';

const label = (en: string, ru: string) => ({ en, ru });

export const PromoCodes: CollectionConfig = {
  slug: 'promoCodes',
  labels: {
    singular: label('Promo code', 'Промокод'),
    plural: label('Promo codes', 'Промокоды')
  },
  admin: {
    defaultColumns: ['code', 'discountType', 'value', 'usedCount', 'maxUses', 'active'],
    useAsTitle: 'code'
  },
  access: {
    create: ({ req: { user } }) => isAdminUser(user),
    delete: ({ req: { user } }) => isAdminUser(user),
    read: ({ req: { user } }) => isAdminUser(user),
    update: ({ req: { user } }) => isAdminUser(user)
  },
  fields: [
    {
      name: 'code',
      type: 'text',
      index: true,
      required: true,
      unique: true,
      validate: (value: unknown) =>
        typeof value === 'string' && value === value.toUpperCase()
          ? true
          : 'Code must use uppercase characters.',
      label: label('Code', 'Код')
    },
    {
      name: 'discountType',
      type: 'select',
      options: ['percent', 'fixed'],
      required: true,
      label: label('Discount type', 'Тип скидки')
    },
    {
      name: 'value',
      type: 'number',
      min: 0,
      required: true,
      label: label('Value', 'Значение')
    },
    {
      name: 'maxUses',
      type: 'number',
      min: 1,
      label: label('Maximum uses', 'Максимум использований')
    },
    {
      name: 'usedCount',
      type: 'number',
      defaultValue: 0,
      min: 0,
      required: true,
      label: label('Used count', 'Использований')
    },
    {
      name: 'validFrom',
      type: 'date',
      label: label('Valid from', 'Действует с')
    },
    {
      name: 'validTo',
      type: 'date',
      label: label('Valid to', 'Действует до')
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      required: true,
      label: label('Active', 'Активен')
    }
  ]
};
