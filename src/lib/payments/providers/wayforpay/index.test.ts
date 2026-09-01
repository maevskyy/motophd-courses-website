import { afterEach, describe, expect, it, vi } from 'vitest';

import { wayForPayJoin, wayForPayProvider, wayForPaySign } from './index';

// Публичные реквизиты WayForPay из их страницы Test details; боевые ключи
// сюда не попадают.
const secret = 'flk3409refn54t54t*FNJRET';

const sign = (values: Array<string | number>) => wayForPaySign(wayForPayJoin(values), secret);

describe('WayForPay signatures', () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.WAYFORPAY_DOMAIN;
    delete process.env.WAYFORPAY_MERCHANT_ACCOUNT;
    delete process.env.WAYFORPAY_SECRET;
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it.each([
    [['test_merch_n1', 'example.com', 'ORD-1002', 1700000000, '100.00', 'UAH', 'Test Product', 1, '100.00'], 'd9e252e426b622682260c01afcb5808f'],
    [['test_merch_n1', 'www.market.ua', 'ORD-1001', 1415379863, '1547.36', 'UAH', 'Course A', 'Course B', 1, 1, 1000, '547.36'], '474606dbda8589b9243ed590bd442510'],
    [['test_merch_n1', 'ORD-1002', '100.00', 'UAH', '541963', '41****8217', 'Approved', '1100'], '688dbd85ec0db0c6de8bd546fb5aa644'],
    [['ORD-1002', 'accept', 1700000100], '1e425f731eda97710b61419cb8fcc72a']
  ])('matches the regression vector', (values, expected) => expect(sign(values)).toBe(expected));

  it('creates an invoice with the signed request and accepts the secure API response', async () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';
    process.env.WAYFORPAY_DOMAIN = 'example.com';
    process.env.WAYFORPAY_MERCHANT_ACCOUNT = 'test_merch_n1';
    process.env.WAYFORPAY_SECRET = secret;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-11-14T22:13:20Z'));
    const fetch = vi.fn().mockResolvedValue({ json: async () => ({ url: 'https://pay.example/invoice' }) });
    vi.stubGlobal('fetch', fetch);

    await expect(wayForPayProvider.createCheckout({
      amount: 100,
      clientEmail: 'buyer@example.com',
      currency: 'EUR',
      locale: 'en',
      orderReference: 'ORD-1002',
      postPaymentToken: 'token',
      productName: 'Test Product'
    })).resolves.toEqual({ redirectUrl: 'https://pay.example/invoice' });

    expect(fetch).toHaveBeenCalledWith(
      'https://secure.wayforpay.com/pay?behavior=offline',
      expect.objectContaining({ method: 'POST' })
    );
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      amount: '100.00',
      merchantSignature: sign([
        'test_merch_n1',
        'example.com',
        'ORD-1002',
        1700000000,
        '100.00',
        'EUR',
        'Test Product',
        1,
        '100.00'
      ]),
      returnUrl: 'https://example.com/api/payments/wayforpay/return?locale=en&order=ORD-1002&t=token'
    });
  });

  it('accepts raw JSON without a Content-Type and does not fulfil WaitingAuthComplete', () => {
    process.env.WAYFORPAY_SECRET = secret;
    const payload = { merchantAccount: 'test_merch_n1', orderReference: 'ORD-1002', amount: '100.00', currency: 'UAH', authCode: '541963', cardPan: '41****8217', transactionStatus: 'WaitingAuthComplete', reasonCode: '1100' };
    const raw = JSON.stringify({ ...payload, merchantSignature: sign([payload.merchantAccount, payload.orderReference, payload.amount, payload.currency, payload.authCode, payload.cardPan, payload.transactionStatus, payload.reasonCode]) });

    expect(wayForPayProvider.verifyCallback(raw, null)).toMatchObject({ orderReference: 'ORD-1002', status: 'failed' });
    expect(wayForPayProvider.verifyCallback(raw.replace('1100', '1101'), null)).toBeNull();
  });

  it('verifies the signature by the raw amount literal that JSON.parse would truncate', () => {
    process.env.WAYFORPAY_SECRET = secret;
    // Банк сериализует amount числом с хвостовым нулём («26.10») и подписывает
    // этот литерал; JSON.parse превратил бы его в 26.1 и сломал подпись.
    const signature = sign(['test_merch_n1', 'ORD-2610', '26.10', 'EUR', '', '', 'Approved', '1100']);
    const raw = `{"merchantAccount":"test_merch_n1","orderReference":"ORD-2610","amount":26.10,"currency":"EUR","authCode":"","cardPan":"","transactionStatus":"Approved","reasonCode":"1100","merchantSignature":"${signature}"}`;

    expect(wayForPayProvider.verifyCallback(raw, null)).toMatchObject({
      orderReference: 'ORD-2610',
      status: 'paid'
    });
  });

  it('returns a signed accept acknowledgement for a valid non-approved callback', async () => {
    process.env.WAYFORPAY_SECRET = secret;
    vi.useFakeTimers(); vi.setSystemTime(new Date('2023-11-14T22:15:00Z'));
    const response = await wayForPayProvider.buildAck({ orderReference: 'ORD-1002', providerTxnId: 'ORD-1002', status: 'failed', payload: {} }).json();

    expect(response).toEqual({ orderReference: 'ORD-1002', status: 'accept', time: 1700000100, signature: '1e425f731eda97710b61419cb8fcc72a' });
  });
});
