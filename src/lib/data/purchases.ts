import { getFallbackLocale } from '@/i18n/locales';
import { getPayloadClient } from './payload';
import type { AppLocale } from './types';
import type { Purchase, User } from '@/payload-types';

export type PurchaseHistoryItem = {
  id: Purchase['id'];
  courseSlug: string;
  courseTitle: string;
  tier: Purchase['tier'];
  amount: number;
  currency: Purchase['currency'];
  status: Purchase['status'];
  purchasedAt: string;
};

const getCourseTitle = (course: Purchase['course']) =>
  typeof course === 'object' && course ? course.title : '';

// Slug нужен кабинету, чтобы решить, у какого курса показать докупку feedback.
const getCourseSlug = (course: Purchase['course']) =>
  typeof course === 'object' && course ? course.slug : '';

export const getPurchaseHistory = async (
  locale: AppLocale,
  user: User
): Promise<PurchaseHistoryItem[]> => {
  const payload = await getPayloadClient();
  const purchases = await payload.find({
    collection: 'purchases',
    depth: 1,
    fallbackLocale: getFallbackLocale(locale),
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
    courseSlug: getCourseSlug(purchase.course),
    courseTitle: getCourseTitle(purchase.course),
    currency: purchase.currency,
    id: purchase.id,
    purchasedAt: purchase.createdAt,
    status: purchase.status,
    tier: purchase.tier
  }));
};
