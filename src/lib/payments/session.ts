import { cookies } from 'next/headers';

import { setAuthCookie } from '@/lib/auth/authCookie';
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
  const user = await payload.findByID({
    collection: 'users',
    depth: 0,
    id: userId,
    overrideAccess: true
  });
  const resetToken = await payload.forgotPassword({
    collection: 'users',
    data: { email: user.email },
    disableEmail: true
  });

  if (!resetToken) {
    return false;
  }

  const password = crypto.randomUUID();
  const result = await payload.resetPassword({
    collection: 'users',
    data: { password, token: resetToken },
    overrideAccess: true
  });

  if (!result.token) {
    return false;
  }

  await payload.update({
    collection: 'purchases',
    data: { postPaymentTokenUsedAt: new Date().toISOString() },
    id: purchase.id,
    overrideAccess: true
  });
  setAuthCookie(await cookies(), result.token);

  return true;
};
