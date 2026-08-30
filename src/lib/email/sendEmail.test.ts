import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  send: vi.fn()
}));

vi.mock('resend', () => ({
  Resend: vi.fn(function ResendMock() {
    return { emails: { send: mocks.send } };
  })
}));

import { Resend } from 'resend';
import { sendEmail } from './sendEmail';

const message = {
  html: '<p>Hello</p>',
  subject: 'Hello',
  text: 'Hello',
  to: 'student@motophd.com'
};

describe('sendEmail', () => {
  afterEach(() => {
    delete process.env.EMAIL_FROM;
    delete process.env.RESEND_API_KEY;
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('logs the complete email without throwing when delivery is not configured', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await expect(sendEmail(message)).resolves.toBeUndefined();

    expect(log).toHaveBeenCalledWith('Email delivery is disabled; outgoing email:', message);
    expect(Resend).not.toHaveBeenCalled();
  });

  it('sends through Resend when both delivery variables are configured', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.EMAIL_FROM = 'MotoPhD <hello@motophd.com>';
    mocks.send.mockResolvedValue({ data: { id: 'email_123' }, error: null });

    await sendEmail(message);

    expect(Resend).toHaveBeenCalledWith('re_test');
    expect(mocks.send).toHaveBeenCalledWith({ ...message, from: process.env.EMAIL_FROM });
  });
});
