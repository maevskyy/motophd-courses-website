import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sendFeedbackInstructions: vi.fn(),
  sendPurchaseConfirmation: vi.fn()
}));

vi.mock('@/lib/email', () => mocks);

import { sendPaymentNotifications } from './notifications';

describe('sendPaymentNotifications', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('sends a confirmation for every paid purchase', async () => {
    await sendPaymentNotifications({
      courseTitle: 'Cornering Basics',
      email: 'student@motophd.com',
      tier: 'standard'
    });

    expect(mocks.sendPurchaseConfirmation).toHaveBeenCalledWith({
      courseTitle: 'Cornering Basics',
      password: undefined,
      tier: 'standard',
      to: 'student@motophd.com'
    });
    expect(mocks.sendFeedbackInstructions).not.toHaveBeenCalled();
  });

  it('puts the new password into the purchase email', async () => {
    await sendPaymentNotifications({
      courseTitle: 'Cornering Basics',
      email: 'student@motophd.com',
      password: 'abcd-efgh-jkmn',
      tier: 'standard'
    });

    expect(mocks.sendPurchaseConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ password: 'abcd-efgh-jkmn' })
    );
  });

  it('adds feedback instructions for feedback purchases', async () => {
    await sendPaymentNotifications({
      courseTitle: 'Cornering Basics',
      email: 'student@motophd.com',
      tier: 'feedback_upgrade'
    });

    expect(mocks.sendFeedbackInstructions).toHaveBeenCalledWith({ to: 'student@motophd.com' });
  });
});
