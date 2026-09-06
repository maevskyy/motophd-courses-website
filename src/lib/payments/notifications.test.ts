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
      locale: 'en',
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
      locale: 'en',
      tier: 'feedback_upgrade'
    });

    expect(mocks.sendFeedbackInstructions).toHaveBeenCalledWith({
      locale: 'en',
      to: 'student@motophd.com'
    });
  });

  it('sends both emails in the locale the purchase was made in', async () => {
    await sendPaymentNotifications({
      courseTitle: 'Cornering Basics',
      email: 'student@motophd.com',
      locale: 'ru',
      tier: 'feedback'
    });

    expect(mocks.sendPurchaseConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ locale: 'ru' })
    );
    expect(mocks.sendFeedbackInstructions).toHaveBeenCalledWith({
      locale: 'ru',
      to: 'student@motophd.com'
    });
  });

  it('falls back to English for purchases created before the locale field existed', async () => {
    await sendPaymentNotifications({
      courseTitle: 'Cornering Basics',
      email: 'student@motophd.com',
      tier: 'feedback'
    });

    expect(mocks.sendPurchaseConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({ locale: 'en' })
    );
    expect(mocks.sendFeedbackInstructions).toHaveBeenCalledWith({
      locale: 'en',
      to: 'student@motophd.com'
    });
  });
});
