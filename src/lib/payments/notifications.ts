import { sendFeedbackInstructions, sendPurchaseConfirmation } from '@/lib/email';

import type { PaymentTier } from './types';

type PaymentNotification = {
  courseTitle: string;
  email: string;
  // Только для первой оплаты аккаунта: покупатель ещё не знает пароля.
  password?: string;
  tier: PaymentTier;
};

export const sendPaymentNotifications = async ({
  courseTitle,
  email,
  password,
  tier
}: PaymentNotification) => {
  await sendPurchaseConfirmation({ courseTitle, password, tier, to: email });

  if (tier !== 'standard') {
    await sendFeedbackInstructions({ to: email });
  }
};
