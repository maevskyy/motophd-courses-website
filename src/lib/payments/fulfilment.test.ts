import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  find: vi.fn(),
  getPayloadClient: vi.fn(),
  sendPaymentNotifications: vi.fn(),
  update: vi.fn()
}));

vi.mock('@/lib/data/payload', () => ({ getPayloadClient: mocks.getPayloadClient }));
vi.mock('./notifications', () => ({ sendPaymentNotifications: mocks.sendPaymentNotifications }));

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
    expect(mocks.sendPaymentNotifications).not.toHaveBeenCalled();
  });

  it('leaves a pending purchase untouched for a non-approved callback', async () => {
    mocks.find.mockResolvedValue({ docs: [{ id: 17, status: 'pending' }] });

    await expect(fulfilPayment({ ...callback, status: 'failed' })).resolves.toEqual({
      found: true,
      fulfilled: false
    });

    expect(mocks.update).not.toHaveBeenCalled();
    expect(mocks.sendPaymentNotifications).not.toHaveBeenCalled();
  });

  it('sends the purchase emails after a first paid callback', async () => {
    mocks.find.mockResolvedValue({
      docs: [{
        course: { title: 'Cornering Basics' },
        id: 17,
        promoCode: null,
        status: 'pending',
        tier: 'feedback',
        user: { email: 'student@motophd.com' }
      }]
    });

    await expect(fulfilPayment(callback)).resolves.toEqual({ found: true, fulfilled: true });

    expect(mocks.sendPaymentNotifications).toHaveBeenCalledWith({
      courseTitle: 'Cornering Basics',
      email: 'student@motophd.com',
      tier: 'feedback'
    });
  });
});
