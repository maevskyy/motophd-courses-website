import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  consumePostPaymentSession: vi.fn(),
  refreshPayment: vi.fn()
}));

vi.mock('@/lib/payments/session', () => ({
  consumePostPaymentSession: mocks.consumePostPaymentSession
}));
vi.mock('@/lib/payments/paymentStatus', () => ({ refreshPayment: mocks.refreshPayment }));

import { POST } from './route';

// За прокси (Caddy, тоннель) request.url — внутренний адрес контейнера
// (https://0.0.0.0:3000), поэтому редирект обязан строиться от адреса сайта.
const internalUrl = 'https://0.0.0.0:3000/api/payments/wayforpay/return';

const returnRequest = (query: string, fields: Record<string, string>) =>
  POST(
    new Request(`${internalUrl}?${query}`, {
      body: new URLSearchParams(fields),
      method: 'POST'
    }),
    { params: Promise.resolve({ provider: 'wayforpay' }) }
  );

describe('payment return route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('APP_URL', 'https://motophd.com');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('sends a paid order to the success page on the site domain and signs the buyer in', async () => {
    mocks.refreshPayment.mockResolvedValue('paid');
    mocks.consumePostPaymentSession.mockResolvedValue(true);

    const response = await returnRequest('locale=ru&order=order-1&t=token-1', {
      orderReference: 'order-1',
      transactionStatus: 'Approved'
    });

    expect(response.status).toBe(303);
    expect(response.headers.get('location')).toBe(
      'https://motophd.com/ru/checkout/success?provider=wayforpay&order=order-1&signedIn=1'
    );
    expect(mocks.consumePostPaymentSession).toHaveBeenCalledWith('order-1', 'token-1');
  });

  it('sends a declined payment to the fail page on the site domain', async () => {
    mocks.refreshPayment.mockResolvedValue('pending');

    const response = await returnRequest('locale=en&order=order-2', {
      orderReference: 'order-2',
      transactionStatus: 'Declined'
    });

    expect(response.headers.get('location')).toBe(
      'https://motophd.com/en/checkout/fail?provider=wayforpay&order=order-2'
    );
    expect(mocks.consumePostPaymentSession).not.toHaveBeenCalled();
  });

  // 07.10.2026: банк держал платёж на проверке антифродом, а сайт писал
  // «оплата не прошла», хотя деньги уже были заблокированы.
  it('sends a payment the bank is still checking to the waiting page, keeping the sign-in token', async () => {
    mocks.refreshPayment.mockResolvedValue('pending');

    const response = await returnRequest('locale=uk&order=order-3&t=token-3', {
      orderReference: 'order-3',
      transactionStatus: 'Pending'
    });

    expect(response.headers.get('location')).toBe(
      'https://motophd.com/uk/checkout/pending?provider=wayforpay&order=order-3&t=token-3'
    );
    expect(mocks.consumePostPaymentSession).not.toHaveBeenCalled();
  });

  it('waits when the bank says approved but its notification has not arrived yet', async () => {
    mocks.refreshPayment.mockResolvedValue('pending');

    const response = await returnRequest('locale=en&order=order-4', {
      orderReference: 'order-4',
      transactionStatus: 'Approved'
    });

    expect(new URL(response.headers.get('location') || '').pathname).toBe('/en/checkout/pending');
  });
});
