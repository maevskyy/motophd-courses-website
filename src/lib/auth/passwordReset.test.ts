import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  consumeRateLimit: vi.fn(),
  cookieSet: vi.fn(),
  forgotPassword: vi.fn(),
  redirect: vi.fn(),
  resetPassword: vi.fn(),
  sendPasswordReset: vi.fn()
}));

vi.mock('next/headers', () => ({
  cookies: vi.fn().mockResolvedValue({ set: mocks.cookieSet }),
  headers: vi.fn().mockResolvedValue(new Headers())
}));

vi.mock('next/navigation', () => ({ redirect: mocks.redirect }));

vi.mock('@/lib/data/payload', () => ({
  getPayloadClient: vi.fn().mockResolvedValue({
    forgotPassword: mocks.forgotPassword,
    resetPassword: mocks.resetPassword
  })
}));

vi.mock('@/lib/email', () => ({ sendPasswordReset: mocks.sendPasswordReset }));

vi.mock('@/lib/rateLimit', () => ({
  RATE_LIMITS: { forgotEmail: {}, forgotIp: {} },
  consumeRateLimit: mocks.consumeRateLimit,
  getClientIp: () => '203.0.113.7'
}));

import { forgotPasswordAction, resetPasswordAction } from './passwordReset';
import {
  initialForgotPasswordFormState,
  initialResetPasswordFormState
} from './passwordResetFormState';

const forgotFormData = (email: string) => {
  const formData = new FormData();

  formData.set('email', email);
  formData.set('locale', 'en');

  return formData;
};

const resetFormData = (token: string, password: string, confirmPassword = password) => {
  const formData = new FormData();

  formData.set('token', token);
  formData.set('password', password);
  formData.set('confirmPassword', confirmPassword);
  formData.set('locale', 'en');

  return formData;
};

describe('forgotPasswordAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.consumeRateLimit.mockReturnValue({ allowed: true });
  });

  it('sends the reset link with the token for an existing account', async () => {
    mocks.forgotPassword.mockResolvedValue('tok-123');

    await expect(
      forgotPasswordAction(initialForgotPasswordFormState, forgotFormData('Student@MotoPhD.com'))
    ).resolves.toEqual({ status: 'sent' });

    expect(mocks.forgotPassword).toHaveBeenCalledWith({
      collection: 'users',
      data: { email: 'student@motophd.com' },
      disableEmail: true
    });
    expect(mocks.sendPasswordReset).toHaveBeenCalledWith({
      locale: 'en',
      resetUrl: expect.stringContaining('/en/login/reset?token=tok-123'),
      to: 'student@motophd.com'
    });
  });

  it('answers the same for an unknown account and sends nothing', async () => {
    mocks.forgotPassword.mockRejectedValue(new Error('no user'));

    await expect(
      forgotPasswordAction(initialForgotPasswordFormState, forgotFormData('ghost@motophd.com'))
    ).resolves.toEqual({ status: 'sent' });

    expect(mocks.sendPasswordReset).not.toHaveBeenCalled();
  });

  it('stops before payload when the rate limit is exhausted', async () => {
    mocks.consumeRateLimit.mockReturnValue({ allowed: false, retryAfterSec: 900 });

    await expect(
      forgotPasswordAction(initialForgotPasswordFormState, forgotFormData('student@motophd.com'))
    ).resolves.toEqual({ status: 'rateLimited' });

    expect(mocks.forgotPassword).not.toHaveBeenCalled();
  });
});

describe('resetPasswordAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('validates the new password before touching payload', async () => {
    await expect(
      resetPasswordAction(initialResetPasswordFormState, resetFormData('tok', 'short'))
    ).resolves.toEqual({ status: 'tooShort' });
    await expect(
      resetPasswordAction(initialResetPasswordFormState, resetFormData('tok', 'new-password-1', 'other-pass-2'))
    ).resolves.toEqual({ status: 'mismatch' });

    expect(mocks.resetPassword).not.toHaveBeenCalled();
  });

  it('reports an invalid or expired token', async () => {
    mocks.resetPassword.mockRejectedValue(new Error('token expired'));

    await expect(
      resetPasswordAction(initialResetPasswordFormState, resetFormData('stale', 'new-password-1'))
    ).resolves.toEqual({ status: 'invalidToken' });

    expect(mocks.cookieSet).not.toHaveBeenCalled();
  });

  it('signs the user in with the fresh token and opens the dashboard', async () => {
    mocks.resetPassword.mockResolvedValue({ token: 'fresh-session', user: {} });

    await resetPasswordAction(initialResetPasswordFormState, resetFormData('tok-123', 'new-password-1'));

    expect(mocks.resetPassword).toHaveBeenCalledWith({
      collection: 'users',
      data: { password: 'new-password-1', token: 'tok-123' },
      overrideAccess: true
    });
    expect(mocks.cookieSet).toHaveBeenCalledWith(
      'payload-token',
      'fresh-session',
      expect.objectContaining({ httpOnly: true })
    );
    expect(mocks.redirect).toHaveBeenCalledWith('/en/dashboard');
  });
});
