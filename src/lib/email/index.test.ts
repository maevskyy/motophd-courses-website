import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sendEmail: vi.fn()
}));

vi.mock('./sendEmail', () => ({ sendEmail: mocks.sendEmail }));

import { sendPurchaseConfirmation } from './index';

describe('send helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sendEmail.mockResolvedValue({ status: 'sent' });
  });

  it('treats an unknown tier from the webhook as the standard plan', async () => {
    await sendPurchaseConfirmation({
      courseTitle: 'Lean',
      tier: 'gold' as never,
      to: 'student@motophd.com'
    });

    expect(mocks.sendEmail.mock.calls[0][0].text).toContain('Plan: Course only');
  });
});
