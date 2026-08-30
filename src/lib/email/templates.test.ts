import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createAccountCredentialsEmail,
  createFeedbackInstructionsEmail,
  createPasswordResetEmail,
  createPurchaseConfirmationEmail
} from './templates';

describe('email templates', () => {
  afterEach(() => {
    delete process.env.APP_URL;
    delete process.env.FEEDBACK_CONTACT_URL;
  });

  it.each(['en', 'ru'] as const)('renders all required content in %s', (locale) => {
    process.env.APP_URL = 'https://motophd.com';
    process.env.FEEDBACK_CONTACT_URL = 'https://t.me/motophd';

    const credentials = createAccountCredentialsEmail({
      locale,
      password: 'secure-password',
      to: 'student@motophd.com'
    });
    const purchase = createPurchaseConfirmationEmail({
      courseTitle: 'Cornering Basics',
      locale,
      tier: 'feedback',
      to: 'student@motophd.com'
    });
    const feedback = createFeedbackInstructionsEmail({ locale, to: 'student@motophd.com' });
    const reset = createPasswordResetEmail({
      locale,
      resetUrl: 'https://motophd.com/reset?token=test',
      to: 'student@motophd.com'
    });

    expect(credentials.text).toContain('student@motophd.com');
    expect(credentials.text).toContain('secure-password');
    expect(credentials.html).toContain(`https://motophd.com/${locale}/login`);
    expect(purchase.text).toContain('Cornering Basics');
    expect(purchase.html).toContain(`https://motophd.com/${locale}/dashboard`);
    expect(feedback.text).toContain('https://t.me/motophd');
    expect(feedback.text).toMatch(/45/);
    expect(reset.text).toContain('https://motophd.com/reset?token=test');
  });

  it('falls back to replies and reports an incident when the feedback contact is missing', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const email = createFeedbackInstructionsEmail({ locale: 'en', to: 'student@motophd.com' });

    expect(email.text).toContain('reply to this email');
    expect(email.text).not.toMatch(/coming soon|скоро/i);
    expect(error).toHaveBeenCalled();

    error.mockRestore();
  });

  it('signs every email so it does not read as phishing', () => {
    const email = createAccountCredentialsEmail({
      locale: 'ru',
      password: 'secure-password',
      to: 'student@motophd.com'
    });

    expect(email.html).toContain('<html lang="ru"');
    expect(email.html).toContain('charset="utf-8"');
    expect(email.html).toContain('MotoPhD Online');
    expect(email.text).toContain('MotoPhD Online');
  });

  it('tells the reader how long a reset link stays valid', () => {
    const en = createPasswordResetEmail({
      locale: 'en',
      resetUrl: 'https://motophd.com/reset?token=test',
      to: 'student@motophd.com'
    });
    const ru = createPasswordResetEmail({
      locale: 'ru',
      resetUrl: 'https://motophd.com/reset?token=test',
      to: 'student@motophd.com'
    });

    expect(en.text).toContain('valid for 1 hour');
    expect(ru.text).toContain('действует 1 час');
  });

  it('escapes HTML coming from course titles', () => {
    const email = createPurchaseConfirmationEmail({
      courseTitle: '<img src=x onerror=alert(1)>',
      locale: 'en',
      tier: 'standard',
      to: 'student@motophd.com'
    });

    expect(email.html).not.toContain('<img src=x');
    expect(email.html).toContain('&lt;img src=x');
  });
});
