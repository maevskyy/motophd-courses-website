import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sendFeedbackInstructions: vi.fn(),
  sendPurchaseConfirmation: vi.fn()
}));

vi.mock('@/lib/email', () => mocks);

import { sendPaymentNotifications } from './notifications';

describe('sendPaymentNotifications', () => {
  it('sends a confirmation for every paid purchase', async () => {
    await sendPaymentNotifications({
      courseTitle: 'Cornering Basics',
      email: 'student@motophd.com',
      tier: 'standard'
    });

    expect(mocks.sendPurchaseConfirmation).toHaveBeenCalledWith({
      courseTitle: 'Cornering Basics',
      locale: 'en',
      tier: 'standard',
      to: 'student@motophd.com'
    });
    expect(mocks.sendFeedbackInstructions).not.toHaveBeenCalled();
  });

  it('adds feedback instructions for feedback purchases', async () => {
    await sendPaymentNotifications({
      courseTitle: 'Cornering Basics',
      email: 'student@motophd.com',
      tier: 'feedback_upgrade'
    });

    expect(mocks.sendFeedbackInstructions).toHaveBeenCalledWith({
      locale: 'en',
      to: 'student@motophd.com'
    });
  });
});
