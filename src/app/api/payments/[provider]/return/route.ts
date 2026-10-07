import { NextResponse } from 'next/server';
import { toLocale } from '@/i18n/locales';
import { refreshPayment } from '@/lib/payments/paymentStatus';
import { wayForPayState } from '@/lib/payments/providers/wayforpay';
import { consumePostPaymentSession } from '@/lib/payments/session';
import { getSiteUrl } from '@/lib/seo/siteUrl';

/*
  Сюда банк возвращает покупателя после оплаты. Тело запроса никто не
  подписывает — по нему только выбираем страницу; доступ открывает
  уведомление банка или проверка статуса в refreshPayment.

  - покупка уже paid → «оплата прошла» (и автовход по одноразовому токену);
  - банк отказал → «оплата не прошла»;
  - иначе (банк ещё проверяет, уведомление не успело) → «оплата
    обрабатывается»: страница сама дождётся решения банка.
*/
export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const body = await request.formData();
  const query = new URL(request.url).searchParams;
  const locale = toLocale(query.get('locale'));
  const orderReference = String(body.get('orderReference') || query.get('order') || '');
  const reported =
    body.get('status') === 'paid' ? 'paid' : wayForPayState(body.get('transactionStatus'));
  const state = orderReference ? await refreshPayment(orderReference) : null;
  const token = query.get('t');
  const page =
    state === 'paid' ? 'success' : state === 'failed' || reported === 'failed' ? 'fail' : 'pending';
  // Не request.url: за Caddy это внутренний адрес контейнера (https://0.0.0.0:3000).
  const url = new URL(`/${locale}/checkout/${page}`, getSiteUrl());

  url.searchParams.set('provider', provider);

  if (orderReference) {
    url.searchParams.set('order', orderReference);
  }

  if (page === 'success' && token && (await consumePostPaymentSession(orderReference, token))) {
    url.searchParams.set('signedIn', '1');
  }

  // Токен автовхода — странице ожидания: она погасит его, когда банк одобрит.
  if (page === 'pending' && token) {
    url.searchParams.set('t', token);
  }

  return NextResponse.redirect(url, 303);
}
