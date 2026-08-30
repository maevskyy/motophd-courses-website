import { getPayloadClient } from './payload';
import type { AppLocale } from './types';
import type { Purchase, User } from '@/payload-types';

export type PurchaseHistoryItem = {
  id: Purchase['id'];
  courseTitle: string;
  tier: Purchase['tier'];
  amount: number;
  currency: Purchase['currency'];
  status: Purchase['status'];
  purchasedAt: string;
};

const getCourseTitle = (course: Purchase['course']) =>
  typeof course === 'object' && course ? course.title : '';

export const getPurchaseHistory = async (
  locale: AppLocale,
  user: User
): Promise<PurchaseHistoryItem[]> => {
  const payload = await getPayloadClient();
  const purchases = await payload.find({
    collection: 'purchases',
    depth: 1,
    fallbackLocale: 'en',
    limit: 100,
    locale,
    overrideAccess: false,
    sort: '-createdAt',
    user,
    where: {
      user: {
        equals: user.id
      }
    }
  });

  return purchases.docs.map((purchase) => ({
    amount: purchase.amount,
    courseTitle: getCourseTitle(purchase.course),
    currency: purchase.currency,
    id: purchase.id,
    purchasedAt: purchase.createdAt,
    status: purchase.status,
    tier: purchase.tier
  }));
};
