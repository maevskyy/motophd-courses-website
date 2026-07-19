import type { CollectionConfig } from 'payload';

import { isAdminUser } from '@/lib/access/hasPaidAccess';

export const Purchases: CollectionConfig = {
  slug: 'purchases',
  labels: {
    singular: {
      en: 'Purchase',
      ru: 'Покупка'
    },
    plural: {
      en: 'Purchases',
      ru: 'Покупки'
    }
  },
  admin: {
    defaultColumns: ['user', 'course', 'tier', 'status', 'amount', 'currency', 'provider'],
    useAsTitle: 'providerTxnId'
  },
  access: {
    create: ({ req: { user } }) => isAdminUser(user),
    delete: ({ req: { user } }) => isAdminUser(user),
    read: ({ req: { user } }) => isAdminUser(user),
    update: ({ req: { user } }) => isAdminUser(user)
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      index: true,
      relationTo: 'users',
      required: true,
      label: {
        en: 'User',
        ru: 'Пользователь'
      }
    },
    {
      name: 'course',
      type: 'relationship',
      index: true,
      relationTo: 'courses',
      required: true,
      label: {
        en: 'Course',
        ru: 'Курс'
      }
    },
    {
      name: 'tier',
      type: 'select',
      options: ['standard', 'feedback', 'feedback_upgrade'],
      required: true,
      label: {
        en: 'Tier',
        ru: 'Тариф'
      }
    },
    {
      name: 'amount',
      type: 'number',
      min: 0,
      required: true,
      label: {
        en: 'Amount',
        ru: 'Сумма'
      }
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'EUR',
      options: ['EUR'],
      required: true,
      label: {
        en: 'Currency',
        ru: 'Валюта'
      }
    },
    {
      name: 'provider',
      type: 'select',
      defaultValue: 'manual',
      options: ['wayforpay', 'paypal', 'mock', 'manual'],
      required: true,
      label: {
        en: 'Provider',
        ru: 'Провайдер'
      }
    },
    {
      name: 'providerTxnId',
      type: 'text',
      index: true,
      label: {
        en: 'Provider transaction ID',
        ru: 'ID транзакции провайдера'
      }
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      index: true,
      options: ['pending', 'paid', 'failed', 'refunded'],
      required: true,
      label: {
        en: 'Status',
        ru: 'Статус'
      }
    }
  ]
};
