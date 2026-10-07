import { getPayloadClient } from '@/lib/data/payload';

import { fulfilPayment } from './fulfilment';
import { getPaymentProvider } from './registry';
import type { PaymentState } from './types';

/*
  Главный путь оплаты — уведомление банка на serviceUrl: банк шлёт его сам,
  как только решил, и сайт тут же открывает доступ и шлёт письмо с паролем.
  Здесь — подстраховка на случай, когда банк решает не сразу (Pending —
  антифрод проверяет платёж) или уведомление не дошло: сайт сам спрашивает
  банк о статусе. Спрашивают страница «оплата обрабатывается», пока
  покупатель на ней, и фоновая досверка раз в несколько минут.
*/

// Не чаще раза в несколько секунд на заказ, сколько бы вкладок ни спрашивали.
const ASK_BANK_INTERVAL_MS = 5000;
const askedAt = new Map<string, number>();

const askBank = async (orderReference: string) => {
  const provider = getPaymentProvider();

  if (!provider?.checkStatus) {
    return null;
  }

  const now = Date.now();

  if (now - (askedAt.get(orderReference) ?? 0) < ASK_BANK_INTERVAL_MS) {
    return null;
  }

  askedAt.set(orderReference, now);
  setTimeout(() => {
    if (askedAt.get(orderReference) === now) {
      askedAt.delete(orderReference);
    }
  }, ASK_BANK_INTERVAL_MS).unref();

  try {
    return await provider.checkStatus(orderReference);
  } catch (error) {
    console.error(`[payments] status check failed for ${orderReference}`, error);

    return null;
  }
};

// Состояние оплаты заказа; null — такого заказа нет. Пока покупка pending,
// спрашивает банк и, если он одобрил, открывает доступ так же, как
// уведомление банка.
export const refreshPayment = async (orderReference: string): Promise<PaymentState | null> => {
  const payload = await getPayloadClient();
  const {
    docs: [purchase]
  } = await payload.find({
    collection: 'purchases',
    depth: 0,
    limit: 1,
    overrideAccess: true,
    where: { orderReference: { equals: orderReference } }
  });

  if (!purchase) {
    return null;
  }

  if (purchase.status === 'paid') {
    return 'paid';
  }

  if (purchase.status !== 'pending') {
    return 'failed';
  }

  const verified = await askBank(orderReference);

  if (!verified) {
    return 'pending';
  }

  if (verified.status === 'paid') {
    await fulfilPayment(verified);
  }

  return verified.status;
};

const RECONCILE_EVERY_MS = 5 * 60 * 1000;
// Свежие заказы не трогаем: покупатель ещё на странице банка.
const RECONCILE_AFTER_MS = 2 * 60 * 1000;
// Брошенные оформления остаются pending навсегда — спрашиваем о них сутки.
const RECONCILE_WITHIN_MS = 24 * 60 * 60 * 1000;
const RECONCILE_BATCH = 50;

export const reconcilePendingPayments = async (now = new Date()) => {
  const provider = getPaymentProvider();

  if (!provider?.checkStatus) {
    return 0;
  }

  const payload = await getPayloadClient();
  const pending = await payload.find({
    collection: 'purchases',
    depth: 0,
    limit: RECONCILE_BATCH,
    overrideAccess: true,
    sort: '-createdAt',
    where: {
      and: [
        { status: { equals: 'pending' } },
        { provider: { equals: provider.name } },
        { createdAt: { greater_than: new Date(now.getTime() - RECONCILE_WITHIN_MS).toISOString() } },
        { createdAt: { less_than: new Date(now.getTime() - RECONCILE_AFTER_MS).toISOString() } }
      ]
    }
  });
  let paid = 0;

  for (const purchase of pending.docs) {
    if (purchase.orderReference && (await refreshPayment(purchase.orderReference)) === 'paid') {
      paid += 1;
    }
  }

  return paid;
};

let reconcilerStarted = false;

export const startPaymentReconciler = () => {
  if (reconcilerStarted || !getPaymentProvider()?.checkStatus) {
    return;
  }

  reconcilerStarted = true;
  setInterval(() => {
    reconcilePendingPayments().catch((error) => {
      console.error('[payments] reconcile failed', error);
    });
  }, RECONCILE_EVERY_MS).unref();
};
