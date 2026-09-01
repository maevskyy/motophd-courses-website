'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { consumePostPaymentSession } from '@/lib/payments/session';
import { signMockCallback } from '@/lib/payments/providers/mock';

const getOrigin = async () => {
  const requestHeaders = await headers();
  const protocol = requestHeaders.get('x-forwarded-proto') || 'http';
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');

  return host ? `${protocol}://${host}` : process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

export async function mockPaymentAction(formData: FormData) {
  const locale = formData.get('locale') === 'ru' ? 'ru' : 'en';
  const orderReference = String(formData.get('order') || '');
  const postPaymentToken = String(formData.get('t') || '');
  const status = formData.get('decision') === 'paid' ? 'paid' : 'failed';
  const rawBody = JSON.stringify({
    orderReference,
    providerTxnId: `mock-${orderReference}`,
    status
  });
  const response = await fetch(`${await getOrigin()}/api/payments/mock/callback`, {
    body: rawBody,
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      'x-payment-signature': signMockCallback(rawBody)
    },
    method: 'POST'
  });

  if (!response.ok) {
    redirect(`/${locale}/checkout/fail?order=${encodeURIComponent(orderReference)}`);
  }

  const destination = status === 'paid' ? 'success' : 'fail';
  const query = new URLSearchParams({ order: orderReference });

  // Кука логина ставится здесь: страница success — Server Component,
  // а Next разрешает set-cookie только в Server Action или Route Handler.
  if (status === 'paid' && postPaymentToken) {
    const signedIn = await consumePostPaymentSession(orderReference, postPaymentToken);

    if (signedIn) {
      query.set('signedIn', '1');
    }
  }

  redirect(`/${locale}/checkout/${destination}?${query.toString()}`);
}
