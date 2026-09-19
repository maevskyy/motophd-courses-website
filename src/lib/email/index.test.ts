import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  sendEmail: vi.fn()
}));

vi.mock('./sendEmail', () => ({ sendEmail: mocks.sendEmail }));

import { sendPasswordReset, sendPurchaseConfirmation, toEmailLocale } from './index';

describe('toEmailLocale', () => {
  // Шаблоны писем есть только на en и ru: украинец получает русское письмо
  // (как и контент курсов), незнакомая локаль — английское.
  it('maps site locales to the languages that have templates', () => {
    expect(toEmailLocale('en')).toBe('en');
    expect(toEmailLocale('ru')).toBe('ru');
    expect(toEmailLocale('uk')).toBe('ru');
    expect(toEmailLocale('de')).toBe('en');
    expect(toEmailLocale(null)).toBe('en');
  });
});

describe('send helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.sendEmail.mockResolvedValue({ status: 'sent' });
  });

  it('sends russian templates to ukrainian readers', async () => {
    await sendPasswordReset({
      locale: 'uk',
      resetUrl: 'https://motophd.com/uk/login/reset?token=abc',
      to: 'student@motophd.com'
    });
    await sendPurchaseConfirmation({
      courseTitle: 'Наклон',
      locale: 'uk',
      tier: 'standard',
      to: 'student@motophd.com'
    });

    expect(mocks.sendEmail).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ subject: 'Восстановление пароля MotoPhD' })
    );
    expect(mocks.sendEmail.mock.calls[0][0].text).toContain('/uk/login/reset?token=abc');
    expect(mocks.sendEmail).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ subject: 'Покупка MotoPhD подтверждена' })
    );
  });
});
