import { getPayloadClient } from '@/lib/data/payload';

import { logPaymentNotification } from './notifications';
import type { VerifiedCallback } from './types';

export const fulfilPayment = async (callback: VerifiedCallback) => {
  const payload = await getPayloadClient();
  const purchases = await payload.find({
    collection: 'purchases',
    depth: 0,
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

  if (typeof purchase.promoCode === 'number') {
    const promo = await payload.findByID({
      collection: 'promoCodes',
      depth: 0,
      id: purchase.promoCode,
      overrideAccess: true
    });

    await payload.update({
      collection: 'promoCodes',
      data: { usedCount: promo.usedCount + 1 },
      id: promo.id,
      overrideAccess: true
    });
  }

  logPaymentNotification(callback.orderReference);

  return { found: true, fulfilled: true };
};
