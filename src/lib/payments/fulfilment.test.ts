import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  getPayloadClient: vi.fn(),
  logPaymentNotification: vi.fn(),
  update: vi.fn()
}));

vi.mock('@/lib/data/payload', () => ({ getPayloadClient: mocks.getPayloadClient }));
vi.mock('./notifications', () => ({ logPaymentNotification: mocks.logPaymentNotification }));

import { fulfilPayment } from './fulfilment';

const callback = {
  orderReference: 'order-paid-1',
  payload: { orderReference: 'order-paid-1', status: 'paid' },
  providerTxnId: 'mock-order-paid-1',
  status: 'paid' as const
};

describe('fulfilPayment', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getPayloadClient.mockResolvedValue({
      find: mocks.find,
      update: mocks.update
    });
  });

  it('acknowledges a repeated callback for a paid order without side effects', async () => {
    mocks.find.mockResolvedValue({ docs: [{ id: 17, status: 'paid' }] });

    await expect(fulfilPayment(callback)).resolves.toEqual({ found: true, fulfilled: false });

    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.logPaymentNotification).not.toHaveBeenCalled();
  });

  it('leaves a pending purchase untouched for a non-approved callback', async () => {
    mocks.find.mockResolvedValue({ docs: [{ id: 17, status: 'pending' }] });

    await expect(fulfilPayment({ ...callback, status: 'failed' })).resolves.toEqual({
      found: true,
      fulfilled: false
    });

    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.logPaymentNotification).not.toHaveBeenCalled();
  });
});
