import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  count: vi.fn(),
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
      count: mocks.count,
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

  const pendingPurchase = {
    course: { title: 'Cornering Basics' },
    id: 17,
    promoCode: null,
    status: 'pending',
    tier: 'feedback',
    user: { email: 'student@motophd.com', id: 5 }
  };

  it('gives a new password with the first paid purchase of the account', async () => {
    mocks.find.mockResolvedValue({ docs: [pendingPurchase] });
    mocks.count.mockResolvedValue({ totalDocs: 0 });

    await expect(fulfilPayment(callback)).resolves.toEqual({ found: true, fulfilled: true });

    const [passwordUpdate] = mocks.update.mock.calls;
    const password = passwordUpdate[0].data.password as string;

    expect(passwordUpdate[0]).toMatchObject({ collection: 'users', id: 5 });
    expect(password).toMatch(/^[\w]{4}-[\w]{4}-[\w]{4}$/);
    // Пароль ставится раньше отметки «оплачено»: автовход ждёт статус paid.
    expect(mocks.update.mock.calls[1][0]).toMatchObject({
      collection: 'purchases',
      data: expect.objectContaining({ status: 'paid' })
    });
    expect(mocks.sendPaymentNotifications).toHaveBeenCalledWith({
      courseTitle: 'Cornering Basics',
      email: 'student@motophd.com',
      password,
      tier: 'feedback'
    });
  });

  it('keeps the password of a customer who has paid before', async () => {
    mocks.find.mockResolvedValue({ docs: [{ ...pendingPurchase, tier: 'standard' }] });
    mocks.count.mockResolvedValue({ totalDocs: 1 });

    await fulfilPayment(callback);

    expect(mocks.update).toHaveBeenCalledTimes(1);
    expect(mocks.update.mock.calls[0][0].collection).toBe('purchases');
    expect(mocks.sendPaymentNotifications).toHaveBeenCalledWith(
      expect.objectContaining({ password: undefined })
    );
  });
});
