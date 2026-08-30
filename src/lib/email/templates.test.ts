import { afterEach, describe, expect, it } from 'vitest';
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

  it('uses a helpful placeholder when the feedback contact is not configured', () => {
    const email = createFeedbackInstructionsEmail({ locale: 'en', to: 'student@motophd.com' });

    expect(email.text).toContain('Contact link coming soon.');
  });
});
