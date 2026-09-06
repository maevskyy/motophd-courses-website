import { sendFeedbackInstructions, sendPurchaseConfirmation } from '@/lib/email';
import type { EmailLocale } from '@/lib/email/types';

import type { PaymentTier } from './types';

type PaymentNotification = {
  courseTitle: string;
  email: string;
  // Покупки, созданные до MOT-38, локали не хранят — им письма по-английски, как раньше.
  locale?: EmailLocale | null;
  tier: PaymentTier;
};

export const sendPaymentNotifications = async ({
  courseTitle,
  email,
  locale,
  tier
}: PaymentNotification) => {
  const emailLocale: EmailLocale = locale ?? 'en';

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
