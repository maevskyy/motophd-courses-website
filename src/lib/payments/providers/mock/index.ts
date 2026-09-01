import { createHmac, timingSafeEqual } from 'node:crypto';

import type { PaymentProvider, VerifiedCallback } from '../../types';

type MockCallbackPayload = {
  orderReference: string;
  providerTxnId: string;
  status: 'paid' | 'failed';
};

const signatureFor = (rawBody: string) =>
  createHmac('sha256', process.env.PAYLOAD_SECRET || '').update(rawBody).digest('hex');

const isMockPayload = (value: unknown): value is MockCallbackPayload => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const payload = value as Partial<MockCallbackPayload>;

  return (
    typeof payload.orderReference === 'string' &&
    typeof payload.providerTxnId === 'string' &&
    (payload.status === 'paid' || payload.status === 'failed')
  );
};

export const signMockCallback = (rawBody: string) => signatureFor(rawBody);

const verifyMockCallback = (rawBody: string, signature: string | null): VerifiedCallback | null => {
  if (!signature) {
    return null;
  }

  const expected = signatureFor(rawBody);
  const isValid =
    signature.length === expected.length &&
    timingSafeEqual(Buffer.from(signature), Buffer.from(expected));

  if (!isValid) {
    return null;
  }

  try {
    const payload: unknown = JSON.parse(rawBody);

    if (!isMockPayload(payload)) {
      return null;
    }

    return {
      orderReference: payload.orderReference,
      payload,
      providerTxnId: payload.providerTxnId,
      status: payload.status
    };
  } catch {
    return null;
  }
};

export const mockProvider: PaymentProvider = {
  name: 'mock',
  buildAck: () => Response.json({ ok: true }),
  createCheckout: async ({ locale, orderReference, postPaymentToken }) => {
    const query = new URLSearchParams({ order: orderReference });

    if (postPaymentToken) {
      query.set('t', postPaymentToken);
    }

    return { redirectUrl: `/${locale}/checkout/mock?${query.toString()}` };
  },
  verifyCallback: verifyMockCallback
};
