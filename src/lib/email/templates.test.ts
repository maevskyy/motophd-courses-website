import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createFeedbackInstructionsEmail,
  createPasswordResetEmail,
  createPurchaseConfirmationEmail
} from './templates';

describe('email templates', () => {
  beforeEach(() => {
    process.env.APP_URL = 'https://motophd.com';
  });

  afterEach(() => {
    delete process.env.APP_URL;
    delete process.env.FEEDBACK_CONTACT_URL;
  });

  it('confirms a purchase in English with a link to the course', () => {
    const email = createPurchaseConfirmationEmail({
      courseTitle: 'Cornering Basics',
      tier: 'feedback',
      to: 'student@motophd.com'
    });

    expect(email.subject).toBe('Your MotoPhD course is ready: Cornering Basics');
    expect(email.text).toContain('Plan: Course + feedback');
    expect(email.html).toContain('https://motophd.com/en/dashboard');
    expect(email.html).toContain('<html lang="en"');
    expect(email.text).not.toContain('Password');
  });

  it('sends sign-in details with the first purchase', () => {
    const email = createPurchaseConfirmationEmail({
      courseTitle: 'Cornering Basics',
      password: 'abcd-efgh-jkmn',
      tier: 'standard',
      to: 'student@motophd.com'
    });

    for (const body of [email.text, email.html]) {
      expect(body).toContain('student@motophd.com');
      expect(body).toContain('abcd-efgh-jkmn');
      expect(body).toContain('change the password in your account settings');
    }
  });

  it('gives feedback buyers the contact link', () => {
    process.env.FEEDBACK_CONTACT_URL = 'https://t.me/motophd';

    const email = createFeedbackInstructionsEmail({ to: 'student@motophd.com' });

    expect(email.text).toContain('https://t.me/motophd');
    expect(email.html).toContain('https://t.me/motophd');
    expect(email.text).toMatch(/45 minutes/);
  });

  it('falls back to support and reports an incident when the feedback contact is missing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const email = createFeedbackInstructionsEmail({ to: 'student@motophd.com' });

    expect(email.text).toContain('support@motophd.com');
    expect(error).toHaveBeenCalled();

    error.mockRestore();
  });

  it('tells how long a reset link stays valid', () => {
    const email = createPasswordResetEmail({
      resetUrl: 'https://motophd.com/en/login/reset?token=test',
      to: 'student@motophd.com'
    });

    expect(email.text).toContain('https://motophd.com/en/login/reset?token=test');
    expect(email.text).toContain('valid for 1 hour');
  });

  it('signs every email with the support address', () => {
    const email = createPasswordResetEmail({
      resetUrl: 'https://motophd.com/en/login/reset?token=test',
      to: 'student@motophd.com'
    });

    expect(email.html).toContain('mailto:support@motophd.com');
    expect(email.text).toContain('support@motophd.com');
  });

  it('escapes HTML coming from course titles', () => {
    const email = createPurchaseConfirmationEmail({
      courseTitle: '<img src=x onerror=alert(1)>',
      tier: 'standard',
      to: 'student@motophd.com'
    });

    expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain('&lt;img src=x');
  });
});
