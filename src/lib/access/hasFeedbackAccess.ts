import type { Payload } from 'payload';
import type { User } from '@/payload-types';

// Гейт страницы /feedback: только оплаченный тариф с обратной связью.
// Запрос идёт от имени юзера — Purchases.access.read сам режет чужие строки.
export const hasFeedbackAccess = async (payload: Payload, user: User | null) => {
  if (!user) {
    return false;
  }

  const purchases = await payload.find({
    collection: 'purchases',
    depth: 0,
    limit: 1,
    overrideAccess: false,
    user,
    where: {
      and: [
        {
          user: {
            equals: user.id
          }
        },
        {
          status: {
            equals: 'paid'
          }
        },
        {
          tier: {
            in: ['feedback', 'feedback_upgrade']
          }
        }
      ]
    }
  });

  return purchases.totalDocs > 0;
};
