import { sendEmail } from './sendEmail';
import {
  createFeedbackInstructionsEmail,
  createPasswordResetEmail,
  createPurchaseConfirmationEmail
} from './templates';
import type { PurchaseTier } from './types';

// Данные приходят из платёжного вебхука, то есть снаружи: чужой tier
// печатался бы как undefined.
const tiers: PurchaseTier[] = ['standard', 'feedback', 'feedback_upgrade'];

const toPurchaseTier = (tier: unknown): PurchaseTier =>
  tiers.includes(tier as PurchaseTier) ? (tier as PurchaseTier) : 'standard';

export const sendPurchaseConfirmation = ({
  courseTitle,
  password,
  tier,
  to
}: {
  courseTitle: string;
  password?: string;
  tier: PurchaseTier;
  to: string;
}) =>
  sendEmail(
    createPurchaseConfirmationEmail({ courseTitle, password, tier: toPurchaseTier(tier), to })
  );

export const sendFeedbackInstructions = ({ to }: { to: string }) =>
  sendEmail(createFeedbackInstructionsEmail({ to }));

export const sendPasswordReset = ({ resetUrl, to }: { resetUrl: string; to: string }) =>
  sendEmail(createPasswordResetEmail({ resetUrl, to }));
