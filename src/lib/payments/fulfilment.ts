import { getPayloadClient } from '@/lib/data/payload';
import type { Purchase } from '@/payload-types';

import { sendPaymentNotifications } from './notifications';
import type { PaymentTier, VerifiedCallback } from './types';

type PurchaseWithPaymentDetails = Purchase & {
  course: { title: string };
  user: { email: string };
};

const hasPaymentDetails = (purchase: Purchase): purchase is PurchaseWithPaymentDetails =>
  typeof purchase.course === 'object' &&
  purchase.course !== null &&
  'title' in purchase.course &&
  typeof purchase.user === 'object' &&
  purchase.user !== null &&
  'email' in purchase.user;

export const fulfilPayment = async (callback: VerifiedCallback) => {
  const payload = await getPayloadClient();
  const purchases = await payload.find({
    collection: 'purchases',
    depth: 1,
    limit: 1,
    overrideAccess: true,
    where: { orderReference: { equals: callback.orderReference } }
  });
  const purchase = purchases.docs[0];

  if (!purchase) {
    return { found: false, fulfilled: false };
  }

  if (purchase.status !== 'pending') {
    return { found: true, fulfilled: false };
  }

  if (callback.status === 'failed') {
    return { found: true, fulfilled: false };
  }

  await payload.update({
    collection: 'purchases',
    data: {
      paidAt: new Date().toISOString(),
      providerPayload: callback.payload as Record<string, unknown>,
      providerTxnId: callback.providerTxnId,
      status: 'paid'
    },
    id: purchase.id,
    overrideAccess: true
  });

  const promoCodeId =
    typeof purchase.promoCode === 'number' ? purchase.promoCode : purchase.promoCode?.id;

  if (promoCodeId) {
    const promo = await payload.findByID({
      collection: 'promoCodes',
      depth: 0,
      id: promoCodeId,
      overrideAccess: true
    });

    await payload.update({
      collection: 'promoCodes',
      data: { usedCount: promo.usedCount + 1 },
      id: promo.id,
      overrideAccess: true
    });
  }

  if (hasPaymentDetails(purchase)) {
    await sendPaymentNotifications({
      courseTitle: String(purchase.course.title),
      email: String(purchase.user.email),
      tier: purchase.tier as PaymentTier
    });
  }

  return { found: true, fulfilled: true };
};
