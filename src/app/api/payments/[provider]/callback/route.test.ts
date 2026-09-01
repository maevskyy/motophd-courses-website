import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ fulfilPayment: vi.fn(), getPaymentProvider: vi.fn() }));

vi.mock('@/lib/payments', () => ({
  fulfilPayment: mocks.fulfilPayment,
  getPaymentProvider: mocks.getPaymentProvider
}));

import { POST } from './route';

describe('payment callback route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects a bad signature without touching a purchase', async () => {
    mocks.getPaymentProvider.mockReturnValue({
      name: 'mock',
      verifyCallback: vi.fn().mockReturnValue(null)
    });

    const response = await POST(new Request('http://localhost/api/payments/mock/callback', { method: 'POST' }), {
      params: Promise.resolve({ provider: 'mock' })
    });

    expect(response.status).toBe(400);
    expect(mocks.fulfilPayment).not.toHaveBeenCalled();
  });

  it('passes a verified raw callback to fulfilment and acknowledges it', async () => {
    const callback = {
      orderReference: 'order-1',
      payload: { orderReference: 'order-1' },
      providerTxnId: 'mock-order-1',
      status: 'paid' as const
    };
    mocks.getPaymentProvider.mockReturnValue({
      buildAck: vi.fn().mockReturnValue(Response.json({ ok: true })),
      name: 'mock',
      verifyCallback: vi.fn().mockReturnValue(callback)
    });

    const response = await POST(
      new Request('http://localhost/api/payments/mock/callback', { body: '{}', method: 'POST' }),
      { params: Promise.resolve({ provider: 'mock' }) }
    );

    expect(response.status).toBe(200);
    expect(mocks.fulfilPayment).toHaveBeenCalledWith(callback);
  });
});
