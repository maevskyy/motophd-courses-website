import { sendEmail } from './sendEmail';
import {
  createAccountCredentialsEmail,
  createFeedbackInstructionsEmail,
  createPasswordResetEmail,
  createPurchaseConfirmationEmail
} from './templates';
import type { EmailLocale, PurchaseTier } from './types';

// Данные приходят из платёжного вебхука, то есть снаружи: неизвестная локаль
// раньше роняла шаблон на names[locale][tier], а чужой tier печатался как undefined.
const tiers: PurchaseTier[] = ['standard', 'feedback', 'feedback_upgrade'];

const toEmailLocale = (locale: unknown): EmailLocale => (locale === 'ru' ? 'ru' : 'en');

const toPurchaseTier = (tier: unknown): PurchaseTier =>
  tiers.includes(tier as PurchaseTier) ? (tier as PurchaseTier) : 'standard';

export const sendAccountCredentials = ({
  to,
  password,
  locale
}: {
  to: string;
  password: string;
  locale: EmailLocale;
}) => sendEmail(createAccountCredentialsEmail({ to, password, locale: toEmailLocale(locale) }));

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
}) =>
  sendEmail(
    createPurchaseConfirmationEmail({
      to,
      courseTitle,
      tier: toPurchaseTier(tier),
      locale: toEmailLocale(locale)
    })
  );

export const sendFeedbackInstructions = ({ to, locale }: { to: string; locale: EmailLocale }) =>
  sendEmail(createFeedbackInstructionsEmail({ to, locale: toEmailLocale(locale) }));

export const sendPasswordReset = ({
  to,
  resetUrl,
  locale
}: {
  to: string;
  resetUrl: string;
  locale: EmailLocale;
}) => sendEmail(createPasswordResetEmail({ to, resetUrl, locale: toEmailLocale(locale) }));
