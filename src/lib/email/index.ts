import { sendEmail } from './sendEmail';
import {
  createAccountCredentialsEmail,
  createFeedbackInstructionsEmail,
  createPasswordResetEmail,
  createPurchaseConfirmationEmail
} from './templates';
import type { EmailLocale, PurchaseTier } from './types';

export const sendAccountCredentials = ({
  to,
  password,
  locale
}: {
  to: string;
  password: string;
  locale: EmailLocale;
}) => sendEmail(createAccountCredentialsEmail({ to, password, locale }));

export const sendPurchaseConfirmation = ({
  to,
  courseTitle,
  tier,
  locale
}: {
  to: string;
  courseTitle: string;
  tier: PurchaseTier;
  locale: EmailLocale;
}) => sendEmail(createPurchaseConfirmationEmail({ to, courseTitle, tier, locale }));

export const sendFeedbackInstructions = ({ to, locale }: { to: string; locale: EmailLocale }) =>
  sendEmail(createFeedbackInstructionsEmail({ to, locale }));

export const sendPasswordReset = ({
  to,
  resetUrl,
  locale
}: {
  to: string;
  resetUrl: string;
  locale: EmailLocale;
}) => sendEmail(createPasswordResetEmail({ to, resetUrl, locale }));
