import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  checkStatus: vi.fn(),
  find: vi.fn(),
  fulfilPayment: vi.fn(),
  getPaymentProvider: vi.fn()
}));

vi.mock('@/lib/data/payload', () => ({
  getPayloadClient: async () => ({ find: mocks.find })
}));
vi.mock('./fulfilment', () => ({ fulfilPayment: mocks.fulfilPayment }));
vi.mock('./registry', () => ({ getPaymentProvider: mocks.getPaymentProvider }));

import { reconcilePendingPayments, refreshPayment } from './paymentStatus';

const purchase = (orderReference: string, status: string) => ({
  docs: [{ id: 1, orderReference, provider: 'wayforpay', status }]
});

const approved = (orderReference: string) => ({
  orderReference,
  payload: {},
  providerTxnId: 'VKTEVW',
  status: 'paid' as const
});

describe('refreshPayment', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getPaymentProvider.mockReturnValue({ checkStatus: mocks.checkStatus, name: 'wayforpay' });
  });

  it('answers from the purchase without asking the bank once it is paid', async () => {
    mocks.find.mockResolvedValue(purchase('order-paid', 'paid'));

    await expect(refreshPayment('order-paid')).resolves.toBe('paid');
    expect(mocks.checkStatus).not.toHaveBeenCalled();
  });

  it('returns null for an unknown order', async () => {
    mocks.find.mockResolvedValue({ docs: [] });

    await expect(refreshPayment('order-unknown')).resolves.toBeNull();
  });

  it('opens access when the bank has approved a pending payment', async () => {
    mocks.find.mockResolvedValue(purchase('order-approved', 'pending'));
    mocks.checkStatus.mockResolvedValue(approved('order-approved'));

    await expect(refreshPayment('order-approved')).resolves.toBe('paid');
    expect(mocks.fulfilPayment).toHaveBeenCalledWith(approved('order-approved'));
  });

  it('stays pending while the bank is still checking', async () => {
    mocks.find.mockResolvedValue(purchase('order-antifraud', 'pending'));
    mocks.checkStatus.mockResolvedValue({ ...approved('order-antifraud'), status: 'pending' });

    await expect(refreshPayment('order-antifraud')).resolves.toBe('pending');
    expect(mocks.fulfilPayment).not.toHaveBeenCalled();
  });

  it('stays pending when the bank cannot be reached', async () => {
    mocks.find.mockResolvedValue(purchase('order-offline', 'pending'));
    mocks.checkStatus.mockRejectedValue(new Error('timeout'));
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await expect(refreshPayment('order-offline')).resolves.toBe('pending');
  });

  it('asks the bank about one order at most once in a few seconds', async () => {
    mocks.find.mockResolvedValue(purchase('order-polled', 'pending'));
    mocks.checkStatus.mockResolvedValue({ ...approved('order-polled'), status: 'pending' });

    await refreshPayment('order-polled');
    await refreshPayment('order-polled');

    expect(mocks.checkStatus).toHaveBeenCalledTimes(1);
  });

  it('reports a declined payment as failed', async () => {
    mocks.find.mockResolvedValue(purchase('order-declined', 'pending'));
    mocks.checkStatus.mockResolvedValue({ ...approved('order-declined'), status: 'failed' });

    await expect(refreshPayment('order-declined')).resolves.toBe('failed');
  });
});

describe('reconcilePendingPayments', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getPaymentProvider.mockReturnValue({ checkStatus: mocks.checkStatus, name: 'wayforpay' });
  });

  it('checks recent pending orders of the bank and counts the approved ones', async () => {
    const now = new Date('2026-10-07T18:00:00Z');
    mocks.find
      .mockResolvedValueOnce({
        docs: [{ orderReference: 'order-a' }, { orderReference: 'order-b' }]
      })
      .mockResolvedValueOnce(purchase('order-a', 'pending'))
      .mockResolvedValueOnce(purchase('order-b', 'pending'));
    mocks.checkStatus
      .mockResolvedValueOnce(approved('order-a'))
      .mockResolvedValueOnce({ ...approved('order-b'), status: 'pending' });

    await expect(reconcilePendingPayments(now)).resolves.toBe(1);
    expect(mocks.find.mock.calls[0][0].where).toEqual({
      and: [
        { status: { equals: 'pending' } },
        { provider: { equals: 'wayforpay' } },
        { createdAt: { greater_than: '2026-10-06T18:00:00.000Z' } },
        { createdAt: { less_than: '2026-10-07T17:58:00.000Z' } }
      ]
    });
    expect(mocks.fulfilPayment).toHaveBeenCalledTimes(1);
  });

  it('does nothing without a bank that can be asked', async () => {
    mocks.getPaymentProvider.mockReturnValue({ name: 'mock' });

    await expect(reconcilePendingPayments()).resolves.toBe(0);
    expect(mocks.find).not.toHaveBeenCalled();
  });
});
