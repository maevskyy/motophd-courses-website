import { NextResponse } from 'next/server';
import { consumePostPaymentSession } from '@/lib/payments/session';

const toLocale = (value: string | null) => (value === 'ru' ? 'ru' : 'en');

export async function POST(
  request: Request,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const body = await request.formData();
  const locale = toLocale(new URL(request.url).searchParams.get('locale'));
  const query = new URL(request.url).searchParams;
  const orderReference = String(body.get('orderReference') || query.get('order') || '');
  const approved = body.get('status') === 'paid' || String(body.get('transactionStatus') || '').toLowerCase() === 'approved';
  const status = approved ? 'success' : 'fail';
  const url = new URL(`/${locale}/checkout/${status}`, request.url);

  url.searchParams.set('provider', provider);

  if (orderReference) {
    url.searchParams.set('order', orderReference);
  }
  const token = query.get('t');
  if (approved && orderReference && token && await consumePostPaymentSession(orderReference, token)) url.searchParams.set('signedIn', '1');
  return NextResponse.redirect(url, 303);
}
