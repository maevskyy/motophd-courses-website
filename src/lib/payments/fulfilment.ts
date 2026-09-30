import { generatePassword } from '@/lib/auth/generatePassword';
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

const userIdOf = (purchase: Purchase) =>
  typeof purchase.user === 'number' ? purchase.user : purchase.user.id;

/*
  Первая оплата аккаунта: аккаунт создан при оформлении заказа со случайным
  паролем, которого покупатель не знает. Выдаём новый и шлём в письме о
  покупке. Со второй покупки пароль уже у покупателя — не трогаем.
  Пароль ставим до отметки «оплачено»: автовход после оплаты ждёт статус
  paid, и сессия должна появиться уже после смены пароля.
*/
const issueFirstPassword = async (
  payload: Awaited<ReturnType<typeof getPayloadClient>>,
  purchase: Purchase
) => {
  const userId = userIdOf(purchase);
  const earlierPaid = await payload.count({
    collection: 'purchases',
    overrideAccess: true,
    where: {
      and: [
        { user: { equals: userId } },
        { status: { equals: 'paid' } },
        { id: { not_equals: purchase.id } }
      ]
    }
  });

  if (earlierPaid.totalDocs > 0) {
    return undefined;
  }

  const password = generatePassword();

  await payload.update({
    collection: 'users',
    data: { password },
    id: userId,
    overrideAccess: true
  });

  return password;
};

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

  const password = await issueFirstPassword(payload, purchase);

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
      password,
      tier: purchase.tier as PaymentTier
    });
  }

  return { found: true, fulfilled: true };
};
