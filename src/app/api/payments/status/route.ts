import { NextResponse } from 'next/server';

import { refreshPayment } from '@/lib/payments/paymentStatus';
import { consumePostPaymentSession } from '@/lib/payments/session';

// Опрос со страницы «оплата обрабатывается». Номер заказа — длинная
// случайная строка, по ней отдаётся только состояние оплаты.
export async function GET(request: Request) {
  const query = new URL(request.url).searchParams;
  const orderReference = query.get('order') || '';
  const token = query.get('t');
  const state = orderReference ? ((await refreshPayment(orderReference)) ?? 'pending') : 'pending';
  const signedIn =
    state === 'paid' && token ? await consumePostPaymentSession(orderReference, token) : false;

  return NextResponse.json({ signedIn, state }, { headers: { 'cache-control': 'no-store' } });
}
