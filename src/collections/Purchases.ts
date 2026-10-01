import type { CollectionBeforeChangeHook, CollectionConfig } from 'payload';

import { isAdminUser } from '@/lib/access/hasPaidAccess';

// Покупку перевели в paid руками — дата оплаты проставляется сама.
export const stampPaidAt: CollectionBeforeChangeHook = ({ data, originalDoc }) =>
  data.status === 'paid' && !data.paidAt && originalDoc?.status !== 'paid'
    ? { ...data, paidAt: new Date().toISOString() }
    : data;

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
    defaultColumns: ['user', 'course', 'tier', 'status', 'amount', 'provider', 'createdAt'],
    useAsTitle: 'providerTxnId'
  },
  access: {
    create: ({ req: { user } }) => isAdminUser(user),
    delete: ({ req: { user } }) => isAdminUser(user),
    // Студент читает только свои покупки (история в кабинете ходит сюда от
    // имени юзера, без overrideAccess); писать по-прежнему может лишь админ.
    read: ({ req: { user } }) => {
      if (isAdminUser(user)) {
        return true;
      }

      if (!user) {
        return false;
      }

      return {
        user: {
          equals: user.id
        }
      };
    },
    update: ({ req: { user } }) => isAdminUser(user)
  },
  hooks: {
    beforeChange: [stampPaidAt]
  },
  // Руками админ заполняет четыре поля (кому, какой курс, тариф, статус) —
  // так выдают курс бесплатно. Остальное пишет сайт при оплате; у
  // сохранённой покупки это видно в свёрнутом блоке только для чтения.
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
      options: [
        { label: { en: 'Course only', ru: 'Только курс' }, value: 'standard' },
        {
          label: { en: 'Course + Personal Feedback', ru: 'Курс + персональная обратная связь' },
          value: 'feedback'
        },
        {
          label: { en: 'Feedback add-on (bought later)', ru: 'Докупка обратной связи' },
          value: 'feedback_upgrade'
        }
      ],
      required: true,
      label: {
        en: 'Tier',
        ru: 'Тариф'
      }
    },
    {
      name: 'status',
      type: 'select',
      // Сайт создаёт заказ со статусом pending сам; в админке покупку
      // заводят, чтобы выдать курс, — поэтому по умолчанию paid.
      defaultValue: 'paid',
      index: true,
      options: [
        {
          label: {
            en: 'pending — started paying, did not finish',
            ru: 'pending — начал оплату и бросил'
          },
          value: 'pending'
        },
        { label: { en: 'paid — access open', ru: 'paid — доступ открыт' }, value: 'paid' },
        {
          label: { en: 'failed — payment failed', ru: 'failed — оплата не прошла' },
          value: 'failed'
        },
        { label: { en: 'refunded — money returned', ru: 'refunded — возврат' }, value: 'refunded' }
      ],
      required: true,
      label: {
        en: 'Status',
        ru: 'Статус'
      },
      admin: {
        description: {
          en: 'Course access is open only while the status is paid.',
          ru: 'Доступ к курсу открыт, только пока статус paid.'
        }
      }
    },
    {
      type: 'collapsible',
      label: {
        en: 'Payment details — filled in by the site',
        ru: 'Данные оплаты — заполняет сайт'
      },
      admin: {
        // При создании вручную блок не нужен; у сохранённой покупки свёрнут.
        condition: (data) => Boolean(data?.id),
        initCollapsed: true
      },
      fields: [
        {
          name: 'amount',
          type: 'number',
          defaultValue: 0,
          min: 0,
          required: true,
          label: {
            en: 'Amount',
            ru: 'Сумма'
          },
          admin: {
            readOnly: true
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
          },
          admin: {
            readOnly: true
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
          },
          admin: {
            readOnly: true
          }
        },
        {
          name: 'providerTxnId',
          type: 'text',
          index: true,
          label: {
            en: 'Provider transaction ID',
            ru: 'ID транзакции провайдера'
          },
          admin: {
            readOnly: true
          }
        },
        {
          name: 'orderReference',
          type: 'text',
          index: true,
          unique: true,
          label: {
            en: 'Order reference',
            ru: 'Номер заказа'
          },
          admin: {
            readOnly: true
          }
        },
        {
          name: 'promoCode',
          type: 'relationship',
          relationTo: 'promoCodes',
          label: {
            en: 'Promo code',
            ru: 'Промокод'
          },
          admin: {
            readOnly: true
          }
        },
        {
          name: 'paidAt',
          type: 'date',
          label: {
            en: 'Paid at',
            ru: 'Дата оплаты'
          },
          admin: {
            readOnly: true
          }
        },
        {
          name: 'providerPayload',
          type: 'json',
          label: {
            en: 'Provider payload',
            ru: 'Данные провайдера'
          },
          admin: {
            readOnly: true
          }
        },
        {
          name: 'postPaymentToken',
          type: 'text',
          index: true,
          label: {
            en: 'Post-payment token',
            ru: 'Токен после оплаты'
          },
          admin: {
            readOnly: true
          }
        },
        {
          name: 'postPaymentTokenExpiresAt',
          type: 'date',
          label: {
            en: 'Post-payment token expiry',
            ru: 'Срок токена после оплаты'
          },
          admin: {
            readOnly: true
          }
        },
        {
          name: 'postPaymentTokenUsedAt',
          type: 'date',
          label: {
            en: 'Post-payment token used at',
            ru: 'Использован токен после оплаты'
          },
          admin: {
            readOnly: true
          }
        }
      ]
    }
  ]
};
