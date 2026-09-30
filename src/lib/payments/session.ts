import { cookies } from 'next/headers';

import { setAuthCookie } from '@/lib/auth/authCookie';
import { issueLoginToken } from '@/lib/auth/issueLoginToken';
import { getPayloadClient } from '@/lib/data/payload';

export const consumePostPaymentSession = async (orderReference: string, token: string) => {
  const payload = await getPayloadClient();
  const purchases = await payload.find({
    collection: 'purchases',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: {
      and: [
        { orderReference: { equals: orderReference } },
        { postPaymentToken: { equals: token } },
        { status: { equals: 'paid' } }
      ]
    }
  });
  const purchase = purchases.docs[0];

  if (!purchase || purchase.postPaymentTokenUsedAt || !purchase.postPaymentTokenExpiresAt) {
    return false;
  }

  if (new Date(purchase.postPaymentTokenExpiresAt) <= new Date()) {
    return false;
  }

  const userId = typeof purchase.user === 'number' ? purchase.user : purchase.user.id;
  // Пароль не трогаем: его покупатель получает письмом о покупке.
  const authToken = await issueLoginToken(payload, userId);

  if (!authToken) {
    return false;
  }

  await payload.update({
    collection: 'purchases',
    data: { postPaymentTokenUsedAt: new Date().toISOString() },
    id: purchase.id,
    overrideAccess: true
  });
  setAuthCookie(await cookies(), authToken);

  return true;
};
