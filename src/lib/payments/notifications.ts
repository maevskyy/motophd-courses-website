import { defaultLocale, type Locale } from '@/i18n/locales';
import { sendFeedbackInstructions, sendPurchaseConfirmation } from '@/lib/email';

import type { PaymentTier } from './types';

type PaymentNotification = {
  courseTitle: string;
  email: string;
  // Покупки, созданные до MOT-38, локали не хранят — им письма по-английски, как раньше.
  locale?: Locale | null;
  tier: PaymentTier;
};

export const sendPaymentNotifications = async ({
  courseTitle,
  email,
  locale,
  tier
}: PaymentNotification) => {
  const emailLocale: Locale = locale ?? defaultLocale;

  await sendPurchaseConfirmation({
    courseTitle,
    locale: emailLocale,
    tier,
    to: email
  });

  if (tier !== 'standard') {
    await sendFeedbackInstructions({ locale: emailLocale, to: email });
  }
};
