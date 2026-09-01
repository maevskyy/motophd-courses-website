import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  find: vi.fn(),
  getCurrentUser: vi.fn(),
  getPayloadClient: vi.fn(),
  getPaymentProvider: vi.fn()
}));

vi.mock('@/lib/auth/currentUser', () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock('@/lib/data/payload', () => ({ getPayloadClient: mocks.getPayloadClient }));
vi.mock('./registry', () => ({ getPaymentProvider: mocks.getPaymentProvider }));

import { createCheckout } from './checkout';

const course = {
  currency: 'EUR' as const,
  id: 4,
  priceFeedback: 129,
  priceStandard: 29,
  slug: 'lean'
};
const user = { email: 'buyer@motophd.com', id: 9 };

describe('checkout', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mocks.getCurrentUser.mockResolvedValue(null);
    mocks.getPayloadClient.mockResolvedValue({ create: mocks.create, find: mocks.find });
    mocks.getPaymentProvider.mockReturnValue({
      createCheckout: vi.fn().mockReturnValue({ redirectUrl: '/en/checkout/mock?order=order' }),
      name: 'mock'
    });
  });

  it('rejects a repeat purchase before creating another order', async () => {
    mocks.find
      .mockResolvedValueOnce({ docs: [course] })
      .mockResolvedValueOnce({ docs: [user] })
      .mockResolvedValueOnce({ docs: [{ id: 1 }], totalDocs: 1 });

    await expect(
      createCheckout({ courseSlug: 'lean', email: user.email, locale: 'en', tier: 'standard' })
    ).resolves.toEqual({ error: 'alreadyPurchased' });
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('rejects a feedback upgrade without a paid standard purchase', async () => {
    mocks.find
      .mockResolvedValueOnce({ docs: [course] })
      .mockResolvedValueOnce({ docs: [user] })
      .mockResolvedValueOnce({ docs: [], totalDocs: 0 })
      .mockResolvedValueOnce({ docs: [], totalDocs: 0 })
      .mockResolvedValueOnce({ docs: [], totalDocs: 0 });

    await expect(
      createCheckout({ courseSlug: 'lean', email: user.email, locale: 'en', tier: 'feedback_upgrade' })
    ).resolves.toEqual({ error: 'upgradeUnavailable' });
  });

  it('calculates the amount from the course record, never from client data', async () => {
    mocks.find
      .mockResolvedValueOnce({ docs: [course] })
      .mockResolvedValueOnce({ docs: [user] })
      .mockResolvedValueOnce({ docs: [], totalDocs: 0 });
    mocks.create.mockResolvedValue({ id: 11 });

    await expect(createCheckout({
      courseSlug: 'lean',
      email: user.email,
      locale: 'en',
      tier: 'standard'
    })).resolves.toEqual({ redirectUrl: '/en/checkout/mock?order=order' });

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ amount: 29, course: course.id, user: user.id })
      })
    );
  });

  it('does not issue a post-payment token for an existing account', async () => {
    mocks.find
      .mockResolvedValueOnce({ docs: [course] })
      .mockResolvedValueOnce({ docs: [user] })
      .mockResolvedValueOnce({ docs: [], totalDocs: 0 });
    mocks.create.mockResolvedValue({ id: 11 });

    await createCheckout({ courseSlug: 'lean', email: user.email, locale: 'en', tier: 'standard' });

    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ postPaymentToken: undefined, postPaymentTokenExpiresAt: undefined })
      })
    );
  });
});
