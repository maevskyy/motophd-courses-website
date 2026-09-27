import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ consumePostPaymentSession: vi.fn() }));

vi.mock('@/lib/payments/session', () => ({
  consumePostPaymentSession: mocks.consumePostPaymentSession
}));

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

  it('sends an approved payment to the success page on the site domain', async () => {
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
    const response = await returnRequest('locale=en&order=order-2', {
      orderReference: 'order-2',
      transactionStatus: 'Declined'
    });

    expect(response.headers.get('location')).toBe(
      'https://motophd.com/en/checkout/fail?provider=wayforpay&order=order-2'
    );
    expect(mocks.consumePostPaymentSession).not.toHaveBeenCalled();
  });
});
