import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
  html: '<p>Password: hunter2</p>',
  subject: 'Hello',
  text: 'Password: hunter2',
  to: 'student@motophd.com'
};

const originalEnv = { ...process.env };

describe('sendEmail', () => {
  beforeEach(() => {
    delete process.env.EMAIL_FROM;
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('never logs the message body when delivery is not configured', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    await expect(sendEmail(message)).resolves.toEqual({ status: 'skipped' });

    const logged = log.mock.calls.flat().join(' ');

    expect(logged).toContain('student@motophd.com');
    expect(logged).not.toContain('hunter2');
    expect(Resend).not.toHaveBeenCalled();
  });

  it('reports a missing configuration as an error in production', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.stubEnv('NODE_ENV', 'production');

    await expect(sendEmail(message)).resolves.toEqual({ status: 'skipped' });

    expect(error).toHaveBeenCalled();
    expect(error.mock.calls.flat().join(' ')).not.toContain('hunter2');
  });

  it('sends through Resend when both delivery variables are configured', async () => {
    process.env.RESEND_API_KEY = 're_test';
    process.env.EMAIL_FROM = 'MotoPhD <hello@motophd.com>';
    mocks.send.mockResolvedValue({ data: { id: 'email_123' }, error: null });

    await expect(sendEmail(message)).resolves.toEqual({ status: 'sent' });

    expect(Resend).toHaveBeenCalledWith('re_test');
    expect(mocks.send).toHaveBeenCalledWith({ ...message, from: process.env.EMAIL_FROM });
  });

  it('does not throw when Resend reports an error, so a paid webhook still answers 200', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    process.env.RESEND_API_KEY = 're_test';
    process.env.EMAIL_FROM = 'MotoPhD <hello@motophd.com>';
    mocks.send.mockResolvedValue({ data: null, error: { message: 'rate limited' } });

    await expect(sendEmail(message)).resolves.toEqual({ status: 'failed' });
    expect(error).toHaveBeenCalled();
  });

  it('does not throw when the Resend call itself rejects', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    process.env.RESEND_API_KEY = 're_test';
    process.env.EMAIL_FROM = 'MotoPhD <hello@motophd.com>';
    mocks.send.mockRejectedValue(new Error('network down'));

    await expect(sendEmail(message)).resolves.toEqual({ status: 'failed' });
  });
});
