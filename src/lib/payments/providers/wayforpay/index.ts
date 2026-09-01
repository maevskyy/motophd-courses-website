import { createHmac, timingSafeEqual } from 'node:crypto';

import type { PaymentProvider } from '../../types';

type WayForPayCallback = Record<string, string | number | null | undefined>;

const sign = (value: string, secret: string) =>
  createHmac('md5', secret).update(value, 'utf8').digest('hex');

const join = (values: Array<string | number | null | undefined>) => values.map((value) => value ?? '').join(';');

const isSignatureValid = (received: unknown, value: string, secret: string) => {
  if (typeof received !== 'string') return false;
  const expected = sign(value, secret);
  return received.length === expected.length && timingSafeEqual(Buffer.from(received), Buffer.from(expected));
};

const parseCallback = (rawBody: string): WayForPayCallback | null => {
  try {
    const value: unknown = JSON.parse(rawBody);
    return value && typeof value === 'object' && !Array.isArray(value) ? (value as WayForPayCallback) : null;
  } catch {
    const form = new URLSearchParams(rawBody);
    return form.size ? Object.fromEntries(form.entries()) : null;
  }
};

const amountLiteral = (amount: number) => amount.toFixed(2);

// Банк подписывает amount тем литералом, каким сам сериализовал тело
// («100.00»), а JSON.parse съедает хвостовой ноль (26.10 → 26.1) — поэтому
// литерал для проверки подписи достаём из сырого тела, не из распарсенного.
const callbackAmountLiteral = (rawBody: string, fallback: unknown) => {
  const match = rawBody.match(/"amount"\s*:\s*"?([0-9]+(?:\.[0-9]+)?)"?/);

  return match ? match[1] : String(fallback ?? '');
};

type CreateInvoiceResponse = { reasonCode?: number | string; url?: string };

const getEnvironment = () => {
  const merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT || '';
  const merchantDomainName = process.env.WAYFORPAY_DOMAIN || '';
  const secret = process.env.WAYFORPAY_SECRET || '';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || '';

  if (!merchantAccount || !merchantDomainName || !secret || !siteUrl) {
    throw new Error('WayForPay environment is not configured');
  }

  return { merchantAccount, merchantDomainName, secret, siteUrl };
};

export const wayForPayProvider: PaymentProvider = {
  name: 'wayforpay',
  buildAck: (callback) => {
    const time = Math.floor(Date.now() / 1000);
    const secret = process.env.WAYFORPAY_SECRET || '';
    const value = join([callback.orderReference, 'accept', time]);
    return Response.json({ orderReference: callback.orderReference, status: 'accept', time, signature: sign(value, secret) });
  },
  createCheckout: async ({
    amount,
    clientEmail,
    currency,
    locale,
    orderReference,
    postPaymentToken,
    productName
  }) => {
    const { merchantAccount, merchantDomainName, secret, siteUrl } = getEnvironment();

    const orderDate = Math.floor(Date.now() / 1000);
    const amountText = amountLiteral(amount);
    const signature = sign(
      join([
        merchantAccount,
        merchantDomainName,
        orderReference,
        orderDate,
        amountText,
        currency,
        productName,
        1,
        amountText
      ]),
      secret
    );
    const returnUrl = new URL('/api/payments/wayforpay/return', siteUrl);
    returnUrl.searchParams.set('locale', locale);
    returnUrl.searchParams.set('order', orderReference);
    if (postPaymentToken) returnUrl.searchParams.set('t', postPaymentToken);
    const serviceUrl = new URL('/api/payments/wayforpay/callback', siteUrl).toString();
    const response = await fetch('https://secure.wayforpay.com/pay?behavior=offline', {
      body: JSON.stringify({
        amount: amountText,
        clientEmail,
        currency,
        language: locale === 'ru' ? 'RU' : 'EN',
        merchantAccount,
        merchantDomainName,
        merchantSignature: signature,
        merchantTransactionSecureType: 'AUTO',
        merchantTransactionType: 'SALE',
        orderDate,
        orderReference,
        productCount: [1],
        productName: [productName],
        productPrice: [amountText],
        returnUrl: returnUrl.toString(),
        serviceUrl
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST'
    });
    const result = (await response.json()) as CreateInvoiceResponse;

    if (!result.url || (result.reasonCode !== undefined && String(result.reasonCode) !== '1100')) {
      throw new Error(`WayForPay invoice failed: ${result.reasonCode ?? 'unknown'}`);
    }

    return { redirectUrl: result.url };
  },
  verifyCallback: (rawBody) => {
    const payload = parseCallback(rawBody);
    const secret = process.env.WAYFORPAY_SECRET || '';
    const signatureFields = payload && [
      payload.merchantAccount,
      payload.orderReference,
      callbackAmountLiteral(rawBody, payload.amount),
      payload.currency,
      payload.authCode,
      payload.cardPan,
      payload.transactionStatus,
      payload.reasonCode
    ];

    if (
      !payload ||
      !secret ||
      !isSignatureValid(payload.merchantSignature, join(signatureFields || []), secret)
    ) {
      return null;
    }

    const orderReference = String(payload.orderReference || '');

    if (!orderReference) {
      return null;
    }

    return {
      orderReference,
      payload,
      providerTxnId: String(payload.authCode || orderReference),
      status: String(payload.transactionStatus || '').toLowerCase() === 'approved' ? 'paid' : 'failed'
    };
  }
};

export const wayForPaySign = sign;
export const wayForPayJoin = join;
