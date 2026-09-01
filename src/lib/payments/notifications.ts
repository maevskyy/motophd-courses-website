import { sendFeedbackInstructions, sendPurchaseConfirmation } from '@/lib/email';

import type { PaymentTier } from './types';

type PaymentNotification = {
  courseTitle: string;
  email: string;
  tier: PaymentTier;
};

export const sendPaymentNotifications = async ({
  courseTitle,
  email,
  tier
}: PaymentNotification) => {
  await sendPurchaseConfirmation({
    courseTitle,
    locale: 'en',
    tier,
    to: email
  });

  if (tier !== 'standard') {
    await sendFeedbackInstructions({ locale: 'en', to: email });
  }
};
